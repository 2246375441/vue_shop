<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert
        title="添加商品信息" type="info" center show-icon :closable="false">
      </el-alert>

      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex -0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
          <!-- 基本信息tab -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称：" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格：" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量：" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量：" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类：" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cateProps"
                @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数tab -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
                <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key='i' border></el-checkbox>
                </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性tab -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片tab -->
          <el-tab-pane label="商品图片" name="3">
            <!-- action 图片上传的后台API地址 -->
            <!-- on-preview 预览处理事件 -->
            <!-- on-remove  删除处理事件-->
            <!-- list-type 图片模式 -->
            <!-- headers   请求头 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容tab -->
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%"
      >
      <img :src="prveiewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data() {
    return {
      // 上传图片的url地址
      uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
      // 步骤条进度
      activeIndex:'0',
      // 添加表单数据对象
      addForm:{
        goods_name:'',
        goods_price:'',
        goods_weight:'',
        goods_number:'',
        // 商品所属的分类数组
        goods_cat:[],
        // 图片存放临时路径
        pics:[],
        // 商品详情内容描述 -- 富文本编辑器
        goods_introduce:'',
        // 商品参数（动态和静态两个）
        attrs:[]
      },
      // 添加表单数据验证规则
      addFormRules:{
        goods_name:[
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price:[
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight:[
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number:[
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_cat:[
          { required: true, message: '请选择商品分类', trigger: 'blur' },
        ]
      },
      // 商品分类列表数据
      catelist:[],
      // 商品分类列表props设置
      cateProps:{
        expandTrigger: 'hover',
        label:'cat_name',
        value:'cat_id',
        children:'children'
      },
      // 动态参数列表数据
      manyTableData:[],
      // 静态属性列表数据
      onlyTableData:[],
      // 图片上传请求头设置
      headersObj:{
        Authorization:window.sessionStorage.getItem('token')
      },
      // 预览图片地址
      prveiewPath:'',
      // 预览图片对话框的显示与隐藏
      previewVisible:false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList(){
      const {data:res} = await this.$http.get('categories')

      if (res.meta.status!==200) {
        return this.$message.error('获取商品分类数据失败')
      }

      this.catelist = res.data
    },
    // 级联选择器发生变化 触发函数
    handleChange(){
      // console.log(this.addForm.goods_cat);
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
        this.$message.error('请选择三级分类')
      }
    },
    // 标签页切换触发
    // return false 阻止标签页切换
    beforeTabLeave(activeName, oldActiveName){
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // 点击标签页触发
    async tabClicked(){
      // tab对应的name名称
      // console.log(this.activeIndex);

      // this.activeIndex = 1 证明访问得是动态参数面板
      if (this.activeIndex === '1') {
        // console.log(this.cateId);
        const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'many'}})

        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }

        // console.log(res.data);
        // 将字符串数据 转化为 数组
        res.data.forEach(item=>{
          if (item.attr_vals.length === 0) {
            item.attr_vals = []
          }else{
            item.attr_vals = item.attr_vals.split(' ')
          }
        })

        this.manyTableData = res.data

        // console.log(this.manyTableData);

      // this.activeIndex = 1 证明访问得是静态属性面板
      }else if(this.activeIndex === '2'){
        const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'only'}})

        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性失败！')
        }

        // console.log(res.data);
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview(file){
      // console.log(file);
      this.prveiewPath = file.response.data.url

      this.previewVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file){
      // file 图片数据
      // console.log(file);

      // 1 获取要删除图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2 从pics数组中找到图片对应索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3 调用splice方法 把图片信息对象从pics数组中移除
      this.addForm.pics.splice(i,1)
      // console.log(this.addForm.pics);
    },
    // 监听图片上传成功的事件
    handleSuccess(response){
      // response 服务器返回数据
      // console.log(response);

      // 1 先拼接得到一个图片信息对象
      const obj = {pic:response.data.tmp_path}
      // 2 将图片信息对象push到pics数组中
      this.addForm.pics.push(obj)
      // console.log(this.addForm);

    },
    // 添加商品提交
    add(){
      // console.log(this.addForm);
      this.$refs.addFormRef.validate(async valid =>{
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }

        // 执行添加逻辑 

        // 处理goods_cat
        // lodash  cloneDeep(obj)  == 深拷贝
        // 因为分类列表动态绑定了addForm.goods_cat  需求为 数组
        // 但是 提交API接口需要的addForm.goods_cat 为字符串 用,分割数据
        // 所以使用lodash插件的cloneDeep方法 深拷贝一个新的addForm为form用来提交数据
        // 原来的addForm 用来给分类列表使用
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')

        // 处理attrs
        // 处理动态参数
        this.manyTableData.forEach(item=>{
          const newInfo = {
            attr_id:item.attr_id,
            attr_value:item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item=>{
          const newInfo = {
            attr_id:item.attr_id,
            attr_value:item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        // 将addForm.attrs赋值给深拷贝出来的form
        form.attrs = this.addForm.attrs
        // console.log(form);
        
        // 提交数据到服务器
        const {data:res} = await this.$http.post('goods',form)

        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }else{
          this.$message.success('添加商品成功')
          this.$router.push('/goods')
        }
      })
    }

  },
  computed: {
    // 三级分类id
    cateId(){
      if (this.addForm.goods_cat.length===3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
}
</script>

<style lang="less" scoped>
.el-checkbox{
  margin: 0 5px 0 0 !important;
}
.previewImg{
  width: 100%;
}
.btnAdd{
  margin-top: 15px;
}
</style>