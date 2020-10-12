<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList()">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- table表格区域 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="95px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">
            <!-- dateFormat函数 在main.js 中全局定义 -->
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <!-- 编辑 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="eidtByid(scope.row.goods_id)"></el-button>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5,10,15,20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background>
      </el-pagination>
    </el-card>

    
    <!-- 编辑对话框 -->
    <el-dialog
      title="编辑商品"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose">

      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" label-position="top">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_name">
          <el-input v-model="editForm.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_name">
          <el-input v-model="editForm.goods_number" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_name">
          <el-input v-model="editForm.goods_weight" type="number"></el-input>
        </el-form-item>

        <!-- many -->
        <el-form-item :label="item.attr_name" v-for="(item,i) in manyData" :key="i">
          <el-checkbox-group v-model="item.attr_value">
            <el-checkbox :label="itemV" v-for="(itemV,iV) in item.attr_value" :key="iV" border></el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <!-- only -->
        <el-form-item :label="item.attr_name" v-for="item in onlyData" :key="item.attr_id">
          <el-input v-model="item.attr_value"></el-input>
        </el-form-item>

        <!-- 上传图片 -->
        <el-upload
          :action="uploadURL"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :file-list="pictureImg"
          :on-success="successImg"
          :headers="headersObj"
          list-type="picture">
          <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>

      <!-- 富文本编辑器 -->
      <quill-editor v-model="editForm.goods_introduce"></quill-editor>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormBox">确 定</el-button>
      </span>
    </el-dialog>



    <!-- 缩略图放大 -->
    <el-dialog
      title="图片预览"
      :visible.sync="IMGdialogVisible"
      width="50%"
      >
      <img :src="IMGPath" alt="" class="previewImg">
      <span slot="footer" class="dialog-footer">
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 图片上传路径
      uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
      // 查询参数
      queryInfo:{
        query:'',
        pagenum:1,
        pagesize:10
      },
      // 商品列表
      goodslist:[],
      // 总数据条数
      total:0,
      // 编辑对话框的显示与隐藏
      editDialogVisible:false,
      // 修改数据表单
      editForm:{
        goods_name :'',    //1
        goods_price :'',   //1
        goods_number :'',  //1
        goods_weight :'',  //1
        goods_introduce :'',
        pics :[],          //删 
        attrs :[],
      },
      // 修改数据表单验证
      editFormRules:{
        goods_name:[{ required: true, message: '请输入商品名称', trigger: 'blur' }]
      },
      // 修改动态数据
      manyData:[],
      // 修改静态数据
      onlyData:[],
      // 上传图片请求头
      headersObj:{
        Authorization:window.sessionStorage.getItem('token')
      },
      // 图片上传路径存储--暂存
      ImgPath:[],
      // 图片暂存
      pictureImg:[],
      // 缩略图放大对话框显示和隐藏 
      IMGdialogVisible:false,
      // 缩略图暂存地址
      IMGPath:'',
      // 编辑id
      goodsId:""
    }
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList(){
      const {data:res} = await this.$http.get('goods',{params:this.queryInfo})

      if (res.meta.status!==200) {
        return this.$message.error('获取商品列表失败！')
      }

      this.goodslist = res.data.goods
      this.total =  res.data.total
    },
    // 当前每页多少条数据变化 触发函数
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 当前页数发生改变 触发函数
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 删除按钮
    async removeById(id){
      const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)

      if (confirmResult !=='confirm') {
        return this.$message.info('已经取消删除')
      }else{
        // 开始删除
        const {data:res} = await this.$http.delete('goods/'+id)

        if (res.meta.status !==200) {
          return this.$message.error('删除失败')
        }else{
          this.$message.success('删除成功')
          this.getGoodsList()
        }
      }
    },
    // 添加商品按钮 ---点击跳转到add组件
    goAddPage(){
      this.$router.push('/goods/add')
    },
    // 点击编辑按钮 展示编辑对话框
    async eidtByid(id){
      const {data:res} = await this.$http.get(`goods/${id}`)
      // console.log(res);

      if (res.meta.status!==200) {
        return this.$message.error('获取商品数据失败')
      }
      this.editForm.goods_name = res.data.goods_name
      this.editForm.goods_price = res.data.goods_price
      this.editForm.goods_number = res.data.goods_number
      this.editForm.goods_weight = res.data.goods_weight
      this.editForm.goods_introduce = res.data.goods_introduce
      this.editForm.pics = res.data.pics
      this.editForm.attrs = res.data.attrs

      this.goodsId = res.data.goods_id
      // console.log(this.editForm);
      // console.log(res);


      this.onlyData = []
      this.manyData = []
      this.editForm.attrs.forEach(item=>{
        if (item.attr_sel == "only") {
          // only
          this.onlyData.push(item)
        }else{
          // many
          item.attr_value = item.attr_value.split(' ')
          this.manyData.push(item)
        }
      })
      

      // 处理图片数据
      // this.editForm.pics.forEach(item=>{
      //   this.ImgPath.push({pic:item.pics_big})
      // })
      // console.log(this.ImgPath);


      // 图片缩略图
      let ArrS = []
      this.editForm.pics.forEach(item=>{
        let obj = {name:item.pics_id,url:item.pics_big_url}
        ArrS.push(obj)
      })
      this.pictureImg = ArrS




      this.editDialogVisible = true
    },
    // 图片点击放大
    handlePreview(file){
      // console.log(file);
      this.IMGdialogVisible = true
      this.IMGPath = file.url
    },
    // 图片移除
    handleRemove(file, fileList){
      // console.log(this.editForm.pics);
      // console.log(file);
      const i = this.editForm.pics.findIndex(x => x.pics_id ===file.name)
      this.editForm.pics.splice(i,1)
      console.log(this.editForm.pics);
    },
    // 图片上传成功
    successImg(response, file, fileList){
      // console.log(file);
      if (file.response.meta.status !==200) {
        return this.$message.error('图片上传失败')
      }
      this.editForm.pics.push({
        pics_id:file.name,
        pics_big:file.response.data.tmp_path,
        pics_big_url:file.response.data.url
      })
      // console.log(this.editForm.pics);
    },
    // 提交修改所有数据到服务器
    async editFormBox(){
      // console.log(this.goodsId);
      // console.log(this.editForm);

      let EditFormInfo = {
        goods_name:this.editForm.goods_name,
        goods_price:this.editForm.goods_price,
        goods_number:this.editForm.goods_number,
        goods_weight:this.editForm.goods_weight,
        goods_introduce:this.editForm.goods_introduce,
        pics:[],
        attrs:[],

        // 分类没有设置
        goods_cat:"1,2,3",
      }

      // 处理数据 attrs
      this.editForm.attrs.forEach(item=>{
        if (item.attr_sel =="many") {
          let obj = {
            attr_id:item.attr_id,
            attr_value:item.attr_value.join(' ')
          }
          // console.log(obj);
          EditFormInfo.attrs.push(obj)
        }else{
          EditFormInfo.attrs.push({
            attr_id:item.attr_id,
            attr_value:item.attr_value
          })
        }
      })

      // console.log(EditFormInfo.attrs);
      // 处理图片pics
      // this.editForm.pics.forEach(item=>{
      //   let objPath = {
      //     "pic":item.pics_big
      //   }
      //   EditFormInfo.pics.push(objPath)
      // })
      // console.log(EditFormInfo.pics);


      // 提交数据处理
      const {data:res} = await this.$http.put(`goods/${this.goodsId}`,EditFormInfo)
      this.editDialogVisible = false

      // console.log(res);
      this.getGoodsList()
    },
    // 监听关闭
    editDialogClose(){
      this.ImgPath = []
      this.pictureImg = []
    }
  },
  computed: {
  },
  created() {
    this.getGoodsList()
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
.quill-editor{
  margin-top: 15px;
}
</style>