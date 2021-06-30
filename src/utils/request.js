import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
// import Cookies from 'js-cookie'
import router from '@/router'
import Cookies from "js-cookie";

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_CPMS // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  // timeout: 10000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    let token = sessionStorage.getItem('access-ticket');
    let username = sessionStorage.getItem('username');
    //session中取不到就去cookies中去取
    if (((token === undefined || token === '' || token == null) || (username === undefined || username === '' || username == null))) {
      token = Cookies.get('access-ticket');
      username = Cookies.get('username');
    }

    config.headers['access-ticket'] = token;
    config.headers['username'] = username;

    // config.headers['access-ticket'] = sessionStorage.getItem('access-ticket')
    // config.headers['username'] = sessionStorage.getItem('username')
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  async response => {
      const res = response.data

      // if the custom code is not 20000, it is judged as an error.
      // if (res.status !== 200 && res.code !== 20000) {
      //   Message({
      //     message: res.message || 'Error',
      //     type: 'error',
      //     duration: 5 * 1000
      //   })
      if (res.status !== 200) {

        if (res.status === 401) {
          Cookies.set('access-ticket','');
          Cookies.set('username','');
          sessionStorage.clear()
          await store.dispatch('user/setLoadMenusStatus', 'no');
          router.push('/login')
          // to re-login
          Message({
            message: '登录超时，请重新登录',
            type: 'error',
            duration: 4 * 1000
          })
           window.location.href = process.env.VUE_APP_BASE_DOOR_URL;
        } else if (res.status === 402) {
          Cookies.set('access-ticket','');
          Cookies.set('username','');
          sessionStorage.clear()
          await store.dispatch('user/setLoadMenusStatus', 'no');
          router.push('/login')
          // to re-login
          Message({
            message: '账号已在其它地方登录',
            type: 'error',
            duration: 4 * 1000
          })
          window.location.href = process.env.VUE_APP_BASE_DOOR_URL;
        } else {
          return res
        }

      } else {
        return res
      }
    },
    error => {
      // Message({
      //   message: error.message,
      //   type: 'error',
      //   duration: 5 * 1000
      // })
      return Promise.reject(error)
    }
)

export default service
