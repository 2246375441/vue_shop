<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录表单区域 -->
      <el-form label-width="80px">
        <el-form-item label="活动名称">
          <el-input></el-input>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name:'Login'
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
</style>