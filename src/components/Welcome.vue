<template>
  <div>
    <h1>用户 ：{{username}}</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username:''
    }
  },
  created() {
    this.getUserName()
  },
  methods: {
    getUserName(){
      const username = window.sessionStorage.getItem("username")
      // console.log(username);
      this.username = username

    }
  },
}
</script>

<style lang="less" scoped>

</style>