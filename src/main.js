import Vue from 'vue'
import App from './app.vue'
import Cookies from 'js-cookie'
import ElementUI from 'element-ui'
import uploader from 'vue-simple-uploader'
import $ from 'jquery'

window.jQuery = $
window.$ = $

Vue.use(uploader)
Vue.use(ElementUI, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  // locale: enLang // 如果使用中文，无需设置，请删除
})
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
