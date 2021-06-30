<template>
    <div id="app">
        <div id="nav">
            <!-- <router-link to="/">Home</router-link>
            <router-link to="/about">About</router-link> -->
        </div>
        <!-- <router-view/> -->

        <!-- 将上传组件全局注册 -->
         <global-uploader :groupId="directory.id" @fileSuccess="uploadSuccess"></global-uploader>
    </div>
</template>

<script>
    import globalUploader from '@/views/globalUploader.vue'
    export default {
        name: 'app',
        data() {
            return {
                directory:{
                    id:927837  //自定义需要上传的参数
                }
            }
        },
        components: {
            globalUploader
        },
        computed: {},
        created() {
        },
        watch: {},
        methods:{
        uploadSuccess(data) {
        // this.page() //刷新列表显示数据页
      },
        }
    }
</script>

<style lang="scss">
</style>
