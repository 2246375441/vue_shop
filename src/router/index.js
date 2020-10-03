import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'


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
]

const router = new VueRouter({
  routes
})

export default router
