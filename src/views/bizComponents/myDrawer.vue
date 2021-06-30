<template>
  <!-- 新增，编辑el-drawer-->
  <el-dialog :visible="drawerShow" :width="drawerSize" :destroy-on-close="true" :close-on-click-modal="false"
    class="ccDialog" :show-close="false" top="5vh" :append-to-body="true" ref="myDialog" v-if="drawerShow" center>

    <div slot="title" class="dialog-title">
      <span class="title">{{drawerTitle}}</span>
      <el-button type="danger" size="mini" @click="closeDialog" icon="el-icon-close" circle plain />
    </div>

    <el-container class="drawerContainer" direction="vertical">

      <el-main class="animated fadeIn  main">
        <slot name="main"></slot>
      </el-main>

    </el-container>

    <div slot="footer" class="dialog-footer">
      <slot name="footer-Button"></slot>
    </div>

  </el-dialog>
</template>

<script>
  // import { loadDicts } from '@/utils/dictCommon.js'

  export default {
    name: 'myDrawer',
    components: {},
    props: {
      //drawer尺寸
      drawerSize: {
        type: String,
        default: () => {
          return '30%'
        }
      },
      //drawer是否展示
      drawerShow: {
        required: true,
        type: Boolean,
        default: () => {
          return false
        }
      },
      //drawer标题头
      drawerTitle: {
        required: true,
        type: String,
        default: () => {
          return '无标题'
        }
      },

    },
    data() {
      return {
        elMainHeight: 0,
      }
    },
    computed: {},
    watch: {},
    async created() {
      this._getElMainHeight()

    },
    mounted() {
      this._getElMainHeight()
      //动态计算elmain高度
      window.addEventListener('resize', () => {
        //调整el-main高度
        var that = this
        window.onresize = function() {
          that._getElMainHeight()
        }
      })
    },
    destroyed() {
      window.onresize = null // 注销window.onresize事件
    },
    methods: {
      closeDialog() {
        this.$emit('closeDialog')
      },
      //计算elMain高度
      _getElMainHeight() {
        this.elMainHeight = document.documentElement.clientHeight - 120
      },
    }
  }
</script>

<style scoped>
  >>>.el-select {
    width: 100%;
  }
  /* 以下为elTree滚动条设置*/
  .main::-webkit-scrollbar {
    /* 滚动条整体样式 */
    /*高宽分别对应横竖滚动条的尺寸*/
    width: 7px;
    height: 8px;
  }
  .main::-webkit-scrollbar-track {
    /* 滚动条里面轨道 */
    background-color: rgba(218, 218, 218, 1);
    border-radius: 5px;
  }
  .main::-webkit-scrollbar-thumb {
    /* 滚动条里面小方块 */
    border-radius: 5px;
    -webkit-box-shadow: inset 0 0 5px rgba(202, 202, 202, 1.0);
    background-color: rgba(177, 177, 177, 1.0);
  }
</style>
<style scoped lang="scss">
  .ccDialog {
    ::v-deep .el-dialog__body {
      padding: 0px;
    }
    /* 头部*/
    ::v-deep .el-dialog__header {
      padding: 0px;
      padding-bottom: 0px;
      background-color: #ad4135;
      .dialog-title {
        padding: 5px;
        color: #ffffff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title {
          margin-left: 10px;
          font-size: 17px;
        }
      }
    }
    .drawerContainer {
      max-height: 800px;
      overflow: auto;
      .main {
        margin: 0px;
      }
    }
  }
</style>
