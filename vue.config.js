module.exports={
  publicPath: '/uploader-folder',
  outputDir:process.env.outputDir,
  devServer: {
    proxy:{
    [process.env.VUE_APP_PROXY_API] : { 
      target: process.env.VUE_APP_BASE_SSO,
      changeOrigin:true,
      // pathRewrite: {　　　　　　　　　　　　　　// 这里重写路径，如果api本身不存在接口路径中，一定要写成空！！！
      //   ['^'+process.env.VUE_APP_PROXY_API]: process.env.VUE_APP_PROXY_API
      // },
      // ws: false
    },
    // [process.env.VUE_APP_BASE_IEDU] : { 
    //   target: process.env.VUE_APP_PROXY_API2,
    //   changeOrigin:true,
    //   pathRewrite: {　　　　　　　　　　　　　　// 这里重写路径，如果monitor本身不存在接口路径中，一定要写成空！！！
    //     ['^'+process.env.VUE_APP_BASE_IEDU]: '/'
    //   },
    //   ws: false
    //   }
    },
  },
  pages: {
    index: {
      // page 的入口
      entry: 'src/main.js',
      // 模板来源
      template: 'public/index.html',
      // 在 dist/index.html 的输出
      filename: 'index.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: '文件上传',
      // 在这个页面中包含的块，默认情况下会包含
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    // 当使用只有入口的字符串格式时，
    // 模板会被推导为 `public/subpage.html`
    // 并且如果找不到的话，就回退到 `public/index.html`。
    // 输出文件名会被推导为 `subpage.html`。
    // subpage: 'src/main.js'
  }
}
