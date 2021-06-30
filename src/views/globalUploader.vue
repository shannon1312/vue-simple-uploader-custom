<template>
  <div id="global-uploader">
    <!-- 上传 -->
    <uploader
      ref="uploader"
      :options="options"
      :auto-start="false"
      class="uploader-app"
      @file-added="addInfo" 
      @file-success="onFileSuccess"
      @file-progress="onFileProgress"
      @file-error="onFileError"
    >
      <uploader-unsupport />
      <div
        class="float-icon"
        v-if="collapse"
        id="moveDiv"
        @click="openPannel()"
      >
        <img src="../assets/images/file-uploader.png" alt="" />
      </div>
      <div style="display: flex; justify-content: center; align-items: center">
        <uploader-btn
          id="global-uploader-btn"
          class="uploader-btn"
          ref="uploadBtn"
          :attrs="attrs"
        >
          <i class="el-icon-upload"></i>
          上传文件
        </uploader-btn>
        <uploader-btn
          id="global-uploaderfolder-btn"
          class="uploader-btn"
          style="margin-left: 36px"
          :directory="true"
        >
          <i class="el-icon-folder-add"></i>
          上传文件夹
        </uploader-btn>
      </div>
      <transition name="slide-fade">
        <uploader-list v-show="panelShow">
          <div
            slot-scope="props"
            class="file-panel"
            :class="{ collapse: collapse }"
          >
            <div class="file-title">
              <h4>文件列表</h4>
              <div class="operate">
                <el-button type="text"  @click="fileListShow">
                  <i
                    style="color: #000; font-size: 18px"
                    :class="
                      collapse ? 'el-icon-arrow-down' : 'el-icon-arrow-up'
                    "
                  />
                </el-button>
                <el-button type="none" class="clearbtn" @click="deleteSuccess(props.fileList)" icon="el-icon-delete" >清除已完成</el-button>
              </div>
            </div>

            <ul class="file-list">
              <li v-for="file in props.fileList" :key="file.id">
                <uploader-file
                  ref="files"
                  :class="'file_' + file.id"
                  :file="file"
                  :list="true"
                />
              </li>
              <div v-if="!props.fileList.length" class="no-file">
                <i class="iconfont icon-empty-file" /> 暂无待上传文件
                <uploader-btn
                  id="global-uploader-btn"
                  class="uploader-btn"
                  ref="uploadBtn"
                  :attrs="attrs"
                >
                  <i class="el-icon-upload"></i>
                  上传文件
                </uploader-btn>
                <uploader-btn
                  id="global-uploaderfolder-btn"
                  class="uploader-btn"
                  :directory="true"
                >
                  <i class="el-icon-folder-add"></i>
                  上传文件夹
                </uploader-btn>
              </div>
            </ul>
          </div>
        </uploader-list>
      </transition>
    </uploader>
    <my-drawer
      :drawerShow="dialogFormVisible"
      drawerTitle="素材上传"
      drawerSize="100%"
      @closeDialog="dialogFormVisible = false"
    >
      <template v-slot:main>
        <el-form
          :model="params"
          ref="dataForm"
          :rules="dataFormRules"
          label-width="85px"
        >
          <el-form-item label="时间" prop="uploadedTime">
            <el-date-picker
              type="date"
              placeholder="选择日期"
              v-model="params.uploadedTime"
              style="width: 100%"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
            <!-- <el-input v-model="form.uploadedTime" ></el-input> -->
          </el-form-item>
          <el-form-item label="地点" prop="uploadedaddr">
            <el-input v-model="params.uploadedaddr"></el-input>
          </el-form-item>
          <el-form-item label="主要人物" prop="uploadedowner">
            <el-input v-model="params.uploadedowner"></el-input>
          </el-form-item>
          <el-form-item
            type="textarea"
            :rows="3"
            label="摘要"
            prop="uploadedabs"
          >
            <el-input v-model="params.uploadedabs"  :rows="5" :maxlength="200"  show-word-limit type="textarea"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template v-slot:footer-Button>
        <!-- <span class="dialog-footer"> -->
        <el-button type="primary" @click="dialogFormVisible = false"
          >取 消</el-button
        >
        <el-button type="primary" @click="uploaderconfirm">上 传</el-button>
        <!-- </span> -->
      </template>
    </my-drawer>
  </div>
</template>

<script>
/**
 *   全局上传插件
 *   调用方法：Bus.$emit('openUploader', {}) 打开文件选择框，参数为需要传递的额外参数
 *   监听函数：Bus.$on('fileAdded', fn); 文件选择后的回调
 *            Bus.$on('fileSuccess', fn); 文件上传成功的回调
 */

import { ACCEPT_CONFIG } from  '../utils/config';
import Bus from '../utils/bus';
import SparkMD5 from "spark-md5";
import myDrawer from "@/views/bizComponents/myDrawer";
import $ from "jquery";
// 这两个是我自己项目中用的，请忽略
// import * as udsApi from "@/api/udsApi.js";

export default {
  name: "globalUploader",
  components: {
    myDrawer,
  },
  props: {
    groupId: {
      // type: Number,
      required: true,
      default() {
        return "0";
      },
    },
  },
  data() {
    return {
      udsIpAddr: "",
      udsServer: {}, //uds服务参数
      fileArr: [],
      fileSuccessArr:[],
      // formLabelWidth:'10px',
      dataFormRules: {
        uploadedTime: [
          { required: true, message: "请选择上传时间", trigger: "blur" },
        ],
        uploadedaddr: [
          { required: true, message: "请输入上传地址", trigger: "blur" },
        ],
        uploadedowner: [
          { required: true, message: "请输入上传人物", trigger: "blur" },
        ],
        uploadedabs: [
          { required: true, message: "请输入上传摘要", trigger: "blur" },
        ],
      },
      options: {
        //form data里的参数 根据实际需要
        target: `http://139.186.122.21:9080/v1/chunk`,
        // target: '',
        query: {
          groupId: this.groupId,
        },
        chunkSize: "20480000", //100M分片
        // chunkSize: sessionStorage.getItem("chunkSize"), //100M分片
        fileParameterName: "file",
        maxChunkRetries: 3,
        testChunks: true, // 是否开启服务器分片校验
        // 服务器分片校验函数，秒传及断点续传基
        checkChunkUploadedByResponse: function (chunk, message) {
          const objMessage = JSON.parse(message);
          console.log(
            "checkChunkUploadedByResponse--->",
            JSON.stringify(objMessage)
          );
          if (objMessage.data && objMessage.data.skipUpload) {
            console.log("秒传成功");
            return true;
          }
          return (
            (objMessage.data ? objMessage.data.uploaded : [] || []).indexOf(
              chunk.offset + 1
            ) >= 0
          );
        },
        headers: {
          Authorization:
            'Ticket.get() && "Bearer " + Ticket.get().access_token',
        },
      },
      params: {
        userId: sessionStorage.getItem("userId"),
        orgId: sessionStorage.getItem("orgId"),
        orgCode: sessionStorage.getItem("orgCode"),
        creatorId: sessionStorage.getItem("userId"),
        orgName: sessionStorage.getItem("orgName"),
        username: sessionStorage.getItem("username"),
        groupId: this.groupId,
        uploadedTime: "",
        uploadedaddr: "",
        uploadedowner: "",
        uploadedabs: "",
      },

      attrs: {
        accept: ACCEPT_CONFIG.getAll(),
      },
      panelShow: false, // 选择文件后，展示上传panel
      dialogFormVisible: false,
      collapse: true,
      position: { x: 0, y: 0 },
      nx: "",
      ny: "",
      dx: "",
      dy: "",
      xPum: "",
      yPum: "",
    };
  },
  async created() {},
  mounted() {
    Bus.$on("openUploader", (query) => {
      this.params = query || {};
      if (this.$refs.uploadBtn) {
        $("#global-uploader-btn").click();
      }
      this.dialogFormVisible = true;
    });
  },
  beforeUpdate() {
    this.params.groupId = this.groupId;
  },
  computed: {
    // Uploader实例
    uploader() {
      return this.$refs.uploader.uploader;
    },
  },
  destroyed() {
    Bus.$off("openUploader");
  },
  methods: {
    //如不需要手动添加参数，可直接略过这一步 uploader里@file-added="onFileAdded"
    addInfo(file) {
      this.dialogFormVisible = true;
      this.fileArr.push(file);
      this.params.uploadedTime = this.$moment().format("YYYY-MM-DD");
      this.params.uploadedaddr = "";
      this.params.uploadedowner = "";
      this.params.uploadedabs = "";
    },
    uploaderconfirm() {
      this.$refs.dataForm.validate((valid) => {
        if (valid) {
          this.dialogFormVisible = false;
          this.onFileAdded();
        }
      });
    },
    resetForm() {
      this.$refs.dataForm.resetFields("uploadedabs");
    },
    onFileAdded() {
      this.panelShow = true;
      this.fileArr.forEach((item) => {
        this.computeMD5(item);
      })
      Bus.$emit("fileAdded", {
        groupId: this.groupId,
      });
    },
    onFileProgress(rootFile, file, chunk) {
      console.log(
        `上传中 ${file.name}，chunk：${chunk.startByte / 1024 / 1024} ~ ${
          chunk.endByte / 1024 / 1024
        }`
      );
    },
    onFileSuccess(rootFile, file, response, chunk) {
      const res = JSON.parse(response);
      console.log("response=========== >" + JSON.stringify(res));
      // 服务器自定义的错误（即虽返回200，但是是错误的情况），这种错误是Uploader无法拦截的
      if (res.status == 200) {
        Bus.$emit("fileSuccess");
        this.fileArr.splice(this.fileArr.findIndex(item => item === file), 1)//上传成功后清空fileArr
        console.log("上传成功");
      } else if (res.status == 205) {
        console.log("开始合并");
        // 文件状态设为“合并中”
        this.statusSet(file.id, "merging");//合并 自添加合并请求接口 
        // udsApi
        //   .merge({
        //     identifier: file.uniqueIdentifier,
        //     filename: file.name,
        //     ...this.params,
        //   })
        //   .then((res) => {
        //     if (res.status == 200) {
        //       // 文件合并成功
        //       Bus.$emit("fileSuccess");
        //       this.statusRemove(file.id);
        //       console.log("合并成功");
        //     } else {
        //       this.statusSet(file.id, "mergeFailed");
        //       this.$message({
        //         message: res.message,
        //         type: "error",
        //       });
        //     }
        //   })
        //   .catch((e) => {
        //     console.log(e);
        //     this.statusSet(file.id, "mergeFailed");
        //     this.$message({
        //       message: res.message,
        //       type: "error",
        //     });
        //   });
      } else {
        this.$message({ message: res.message, type: "error" });
        // 文件状态设为“失败”
        this.statusSet(file.id, "failed");
        return;
      }
    },
    onFileError(rootFile, file, response, chunk) {
      console.log(response);
      this.$message({
        message: response,
        type: "error",
      });
    },

    /**
     * 计算md5，实现断点续传及秒传
     * @param file
     */
    computeMD5(file) {
      const fileReader = new FileReader();
      const time = new Date().getTime();
      const blobSlice =
        File.prototype.slice ||
        File.prototype.mozSlice ||
        File.prototype.webkitSlice;
      let currentChunk = 0;
      const chunkSize = sessionStorage.getItem("chunkSize");
      const chunks = Math.ceil(file.size / chunkSize);
      const spark = new SparkMD5.ArrayBuffer();

      // 文件状态设为"计算MD5"
      this.statusSet(file.id, "md5");
      file.pause();

      loadNext();

      fileReader.onload = (e) => {
        spark.append(e.target.result);

        if (currentChunk < chunks) {
          currentChunk++;
          loadNext();

          // 实时展示MD5的计算进度
          this.$nextTick(() => {
            $(`.myStatus_${file.id}`).text(
              "校验MD5 " + ((currentChunk / chunks) * 100).toFixed(0) + "%"
            );
          });
        } else {
          const md5 = spark.end();
          this.computeMD5Success(md5, file);
          console.log(
            `MD5计算完毕：${file.name} \nMD5：${md5} \n分片：${chunks} 大小:${
              file.size
            } 用时：${new Date().getTime() - time} ms`
          );
        }
      };

      fileReader.onerror = function () {
        this.error(`文件${file.name}读取出错，请检查该文件`);
        file.cancel();
      };

      function loadNext() {
        const start = currentChunk * chunkSize;
        const end =
          start + chunkSize >= file.size ? file.size : start + chunkSize;

        fileReader.readAsArrayBuffer(blobSlice.call(file.file, start, end));
      }
    },

    computeMD5Success(md5, file) {
      // 将自定义参数直接加载uploader实例的opts上
      Object.assign(this.uploader.opts, {
        query: {
          ...this.params,
        },
      });

      file.uniqueIdentifier = md5;
      file.resume();
      this.statusRemove(file.id);
    },

    fileListShow() {
      const $list = $("#global-uploader .file-list");

      // if ($list.is(":visible")) {
      //   $list.slideUp();
      this.collapse = true;
      this.panelShow = false;
      // } else {
      //   $list.slideDown();
      //   this.collapse = false;
      // }
    },
    close() {
      this.uploader.cancel();
      this.panelShow = false;
    },
    openPannel() {
      this.panelShow = true;
      this.collapse = false;
    },
    /**
     * 新增的自定义的状态: 'md5'、'transcoding'、'failed'
     * @param id
     * @param status
     */
    statusSet(id, status) {
      const statusMap = {
        md5: {
          text: "校验MD5",
          bgc: "#fff",
        },
        merging: {
          text: "合并中",
          bgc: "#e2eeff",
        },
        transcoding: {
          text: "转码中",
          bgc: "#e2eeff",
        },
        failed: {
          text: "上传失败",
          bgc: "#e2eeff",
        },
        mergeFailed: {
          text: "文件合并失败",
          bgc: "#e2eeff",
        },
      };

      this.$nextTick(() => {
        $(`<p class="myStatus_${id}"></p>`)
          .appendTo(`.file_${id} .uploader-file-status`)
          .css({
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            zIndex: "1",
            backgroundColor: statusMap[status].bgc,
          })
          .text(statusMap[status].text);
      });
    },
    statusRemove(id) {
      this.$nextTick(() => {
        $(`.myStatus_${id}`).remove();
      });
    },

    error(msg) {
      this.$notify({
        title: "错误",
        message: msg,
        type: "error",
        duration: 2000,
      });
    },
    // 定义url字符串拼接的方法
    // setUrlQuery(options) {
    //   let { url, query } = options;
    //   if (!url) return "";
    //   if (query) {
    //     let queryArr = [];
    //     for (const key in query) {
    //       if (query.hasOwnProperty(key)) {
    //         queryArr.push(`${key}=${query[key]}`);
    //       }
    //     }
    //     if (url.indexOf("?") !== -1) {
    //       url = `${url}&${queryArr.join("&")}`;
    //     } else {
    //       url = `${url}?${queryArr.join("&")}`;
    //     }
    //   }
    //   console.log("字符串" + url);
    //   return url;
    // },
    //清除已完成
    deleteSuccess(fileList){
      console.log(this.$refs.uploader.fileList);
      this.$confirm('确定删除已完成的素材？', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
        center: true
      }).then(() => {
        console.log(fileList)
        let list = this.$refs.uploader.fileList.filter(item=>{
          return !item.completed;
        })
        this.$refs.uploader.fileList = list;
      })
    }
  },
  // },
};
</script>

<style lang="scss">
.slide-fade-enter-active {
  transition: all 0.2s ease;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(5px);
  opacity: 0;
}
#global-uploader {
  z-index: 20;
  top: 0;
  .uploader-app {
    width: auto;
    .float-icon {
      position: absolute;
      z-index: 100;
      top: -20px;
      left: 49%;
      img {
        // width: 35px;
        height: 47px;
      }
    }
  }
  .el-dialog__wrapper{
    position: none;
    width:100% !important;

  }
      .el-dialog{
      width: 100% !important;
    }
  .el-dialog--center{
   width:100% !important; 
  }
  .filedialog {
    clear: both;
    z-index: 25;
    margin-top: 5vh;
    margin: 0 auto;
    width: 50%;
    .el-form-item {
      margin-bottom: 20px;
    }
  }
  .dialog-footer {
    margin-top: 15px;
  }
  .file-panel {
    clear: both;
    position: absolute;
    left: 0px;
    width: 700px;
    z-index: 25;
    background-color: #fff;
    border: 1px solid #e2e2e2;
    border-radius: 7px 7px 0 0;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    .file-title {
      display: flex;
      height: 40px;
      line-height: 40px;
      padding: 0 15px;
      border-bottom: 1px solid #ddd;
      align-items: center;
      .operate {
        flex: 1;
        text-align: right;
      }
    }
    .file-list {
      position: relative;
      height: 240px;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: #fff;
      list-style-type: decimal;
      > li {
        background-color: #fff;
      }
      > li::marker {
        line-height: 50px;
      }
      .clearbtn{
          background:#fff !important;
          color:black !important;
          border-color:#fff !important;
        }
    }
    &.collapse {
      .file-title {
        background-color: #c3ccd4;
        .clearbtn{
          background:#c3ccd4;color:black;border-color:#c3ccd4
        }
      }
    }
  }
  .no-file {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
  }
  // .uploader-file-progress {
  //   position: absolute;
  //   width: 100%;
  //   /* right: 5%; */
  //   height: 8%;
  //   bottom: 0;
  //   border-radius: 10px;
  //   background-image: linear-gradient(
  //     60deg,
  //     transparent 0,
  //     transparent 0.8rem,
  //     red 0.8rem,
  //     red 1.6rem,
  //     transparent 1.6rem,
  //     transparent 2.4rem,
  //     red 2.4rem
  //   ) !important;
  // }
  .uploader-file-icon {
    &:before {
      content: "" !important;
    }
    &[icon="image"] {
      background: url("../assets/images/image-icon.png") !important;
    }
    &[icon="video"] {
      background: url("../assets/images/video-icon.png") !important;
    }
    &[icon="audio"] {
      background: url("../assets/images/audio-icon.png") !important;
    }
    &[icon="document"] {
      background: url("../assets/images/text-icon.png") !important;
    }
    &[icon="unknown"] {
      background: url("../assets/images/default.png") !important;
    }
    &[icon="folder"] {
      background: url("../assets/images/folder.png") !important;
    }
  }
  .uploader-file-actions > span {
    margin-right: 6px;
  }
}
.uploader-btn {
  margin-left: 12px;
  padding: 6px 9px !important;
  text-align: center;
  width: 100px;
  color: #fff;
  background-color: rgb(255, 240, 240) !important;
  border-color: #f84a44 !important;
  color: #f84a44 !important;
  border-radius: 3px !important;
  transition: 0.1s;
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  font-size: 12px !important;
  font-weight: 400;
  border: none;
}
.uploader-btn:hover {
  margin-left: 12px;
  padding: 9px 12px !important;
  text-align: center;
  width: 100px;
  background-color: #f84a44 !important;
  border-color: 1px solid #f84a44 !important;
  color: rgb(255, 240, 240) !important;
  border-radius: 3px !important;
  transition: 0.1s;
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  font-size: 12px !important;
  font-weight: 400;
  border: none;
}
</style>
