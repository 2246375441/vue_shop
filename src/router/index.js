import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'

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
    component: Home,
    // 重定向
    redirect: '/welcome',
    // 子路由
    children:[
      {
        path: '/welcome',
        name: 'Welcome',
        component: Welcome
      },
      {
        path: '/users',
        name: 'Users',
        component: Users
      },
      {
        path: '/rights',
        name: 'Rights',
        component: Rights
      },
      {
        path: '/roles',
        name: 'Roles',
        component: Roles
      },
      {
        path: '/categories',
        name: 'Cate',
        component: Cate
      },
    ]
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
