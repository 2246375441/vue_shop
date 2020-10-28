<template>
  <div class="home-div">
    <!-- 头部区域 -->
    <el-container class="home-container">
      <el-header>
        <div>
          <img src="../assets/img/Home/logo.png" alt="" />
          <span>Element-Ui后台管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <!-- 页面主体区域 -->
      <el-container>
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse ? '64px' : '180px'">
          <!-- 折叠侧边栏按钮 -->
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!-- 侧边栏菜单区域 -->
                    <!-- unique-opened  是否只保持一个子菜单的展开-->
                    <!-- collapse  是否水平折叠收起菜单-->
                    <!-- collapse-transition 是否开启折叠动画-->
                    <!-- router 是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转 -->
                    <!-- default-active 当前激活菜单的 index -->
          <el-menu
            background-color="#313743"
            text-color="#fff"
            active-text-color="rgb(59,154,244)"
            :unique-opened="true"
            :collapse="isCollapse"
            :collapse-transition="false"
            :router="true"
            :default-active="activePath"
          >
            <!-- 1级菜单 -->
            <el-submenu
              :index="item.id + ''"
              v-for="item in menulist"
              :key="item.id"
            >
              <!-- 一级菜单的模板区 -->
              <template slot="title">
                <!-- 图标 -->
                <!-- <i class="el-icon-location"></i> -->
                <i :class="iconsObj[item.id]"></i>
                <!-- 文本 -->
                <span>{{ item.authName }}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item
                :index="'/' + subItem.path"
                v-for="subItem in item.children"
                :key="subItem.id"
                @click="saveNavState('/' + subItem.path)"
              >
                <template slot="title">
                  <!-- 图标 -->
                  <i class="el-icon-menu"></i>
                  <!-- 文本 -->
                  <span>{{ subItem.authName }}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 右侧内容主题 -->
        <el-main>
          <!-- 路由占位符 -->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      iconsObj: {
        125: 'iconfont icon-users',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao',
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath:''
    };
  },
  methods: {
    // 退出按钮
    logout() {
      window.sessionStorage.clear();
      this.$router.push('/login');
    },
    // 获取左侧菜单栏数据
    async getMenuList() {
      const { data: res } = await this.$http.get('menus');
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      } else {
        this.menulist = res.data;
      }
      // console.log(this.menulist);
    },
    // 点击按钮侧边栏折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    // 保存链接激活状态
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }
  },
};
</script>

<style lang="less" scoped>
.home-div {
  height: 100%;
}
.home-container {
  height: 100%;
}
.el-header {
  background-color: rgb(54, 61, 64);
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
  > div {
    display: flex;
    align-items: center;
  }
  > div img {
    padding: 0 10px;
    height: 50px;
    widows: 50px;
  }
}
.el-aside {
  background-color: rgb(49, 55, 67);
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: rgb(233, 237, 241);
}
.iconfont {
  padding-right: 10px;
}
.toggle-button {
  background-color: #475163;
  color: #fff;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>