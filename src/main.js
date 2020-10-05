import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入elementUi
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图片
import './assets/fonts/iconfont.css'

// 导入axios
import axios from 'axios'
// 配置axios请求路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 设置拦截器 在请求头上设置token 
axios.interceptors.request.use(config =>{
  // console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须return config
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
