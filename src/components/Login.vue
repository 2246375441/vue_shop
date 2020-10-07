<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录表单区域 -->
      <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" label-width="60px" class="login_form">
        <!-- 用户名 -->
        <el-form-item label="账号" prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
        </el-form-item>
        <!-- 按钮区 -->
        <el-form-item label="" class="btns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name:'Login',
  data() {
    return {
      // 登录表单的数据绑定对象
      loginForm:{
        username:'admin',
        password:'123456'
      },
      // 表单验证规则对象
      loginFormRules:{
        username:[
          { required: true, message: '请输入账号', trigger: 'blur' },
          { min: 5, max: 12, message: '长度在 5 到 12 个字符', trigger: 'blur' }
        ],
        password:[
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮
    resetLoginForm(){
      // console.log(this);
      this.$refs.loginFormRef.resetFields()
    },
    login(){
      this.$refs.loginFormRef.validate(async (valid)=>{
        // console.log(valid);
        if (!valid) {
          return
        }else{
          // console.log('可以发送了');
          // const result = await this.$http.post('login',this.loginForm)
          // console.log(result.data);
          // {data:res} 和上面方法一致  使用解构方法！！
          const {data:res} = await this.$http.post('login',this.loginForm)
          // console.log(res);
          if (res.meta.status !==200) {
            // console.log('没有此账户');
            this.$message.error('登录失败')
          }else{
            // console.log('登录成功'); 
            this.$message.success('登录成功')

            //1.将登录成功之后的token, 保存到客户端的sessionStorage 中
            //  1.1项目中出了登录之外的其他API接口，必须在登录之后才能访问
            //  1.2 token 只应在当前网站打开期间生效，所以将token 保存在sessionStorage 中
            // 把token添加到session中 sessionStorage会话结束 就关闭
            // ☆
            window.sessionStorage.setItem("token",res.data.token)
            window.sessionStorage.setItem("username",res.data.username)
            //2.通过编程式导航跳转到后台主页，路由地址是/home
            this.$router.push('/home')
            
          }
        }
      })
    }
  },
}
</script>

<style lang="less" scoped>
.login_container{
  height: 100%;
  background-color: #2b4b6b;
}
.login_box{
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  .avatar_box{
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    background-color: #fff;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 0;
    right: 0;
    margin: 0 auto;
    transform: translate(0,-50%);
    img{
      height: 100%;
      width: 100%;
      border: solid 1px #eee;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.btns{
  display: flex;
  justify-content: flex-end;
}
.login_form{
  position: absolute;
  bottom: 0;  
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>