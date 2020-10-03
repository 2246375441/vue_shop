import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    // redirect自动重定向到登录页面
    redirect:'/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },  
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
]

const router = new VueRouter({
  routes
})


// 挂载路由导航守卫
router.beforeEach((to,from,next)=>{
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数,表示放行
  // next()放行    next('/login')强制跳转
  
  // 当路径为/login 放行
  if (to.path == '/login') {
    return next()
  }
  
  // 获取token  不存在则强制跳转到/login
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr){
    return next('/login')
  }

  next()
  
})


export default router
