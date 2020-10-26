import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入elementUi
import './plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css';
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图片
import './assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'
// 导入TreeTable插件 
import TreeTable from 'vue-table-with-tree-grid'
// 导入 富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

// 导入 富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入进度条 nprogress 插件
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置axios请求路径
axios.defaults.baseURL = 'http://chenxinlong.xyz:61235/api/private/v1/'
// 在request拦截器中 显示进度条 ---NProgress    NProgress.start()
// 设置拦截器 在请求头上设置token 
axios.interceptors.request.use(config =>{
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须return config
  return config
})
// response拦截器 隐藏进度条  ---NProgress    NProgress.done()
axios.interceptors.response.use(config =>{
  NProgress.done()
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 组件注册
Vue.component('tree-table',TreeTable)

// 全局---将时间秒转换为年-月-日-时-秒
Vue.filter('dateFormat',function(originVal){
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2,'0')
  const d = (dt.getDate() + '').padStart(2,'0')
  const hh = (dt.getHours() + '').padStart(2,'0')
  const mm = (dt.getMinutes() + '').padStart(2,'0')
  const ss = (dt.getSeconds() + '').padStart(2,'0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// 将富文本编辑器注册为全局可用组件
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
