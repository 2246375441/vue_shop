<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="" border :show-row-hover="false" class="treeTable">
      
        <!-- 内置模板 -->
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:#7eb761;font-size:20px"></i>
          <i class="el-icon-error" v-else style="color:red;font-size:20px"></i>
        </template>

        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" >编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" >删除</el-button>
        </template>

      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[5,10,15,30]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDIalogClose"
      >
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象-->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
            change-on-select>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类查询条件
      querInfo:{
        // 显示层级关系
        type:3,
        // 当前页面值
        pagenum:1,
        // 每页显示多少条数据
        pagesize:5,
      },
      // 商品分类的数据列表
      catelist:[],
      // 总数据条数
      total:0,
      // 为table指定列的定义
      columns:[
        {
          label:'分类名称',
          prop:'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          // 表示将当前列定义为模板列
          type: 'template',
          template: 'isok',
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'order',
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt',
        }
      ],
      // 添加分类的显示隐藏
      addCateDialogVisible:false,
      // 添加分类的表单数据对象
      addCateForm:{
        cat_name:'',
        // 父级分类id
        cat_pid:0,
        // 父级的等级,默认要添加一级分类
        cat_level:0
      },
      // 添加分类表单的验证规则
      addCateFormRules:{
        cat_name:[
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList:[],
      // 指定级联选择器配置对象
      cascaderProps:{
        value:'cat_id',
        label:'cat_name',
        children:'children',
        expandTrigger: 'hover',
      },
      // 选中的父级分类id数组
      selectedKeys:[],

    }
  },
  methods: {
    // 获取商品分类数据
    async getCateList(){
      const {data:res} = await this.$http.get('categories',{params:this.querInfo})
      if (res.meta.status !==200) {
        return this.$message.error('商品分类获取失败！')
      }
      // console.log(res);
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize 改变
    handleSizeChange(newSize){
      // console.log(newSize);
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum 改变
    handleCurrentChange(newPage){
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮显示添加分类对话框
    showAddCateDialog(){
      // 获取父级分类数据
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList(){
      const {data:res} = await this.$http.get('categories',{params:{type:2}})

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      // console.log(res.data);
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChange(){
      // console.log(this.selectedKeys);
      // selectedKeys 数组中的length大于0  证明选中的父级父类
      // selectedKeys 反之就说明没有选中任何父级分类
      if (this.selectedKeys.length >0) {
        // 父级分类的ID
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length -1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }else{
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮 添加新的分类
    addCate(){
      // console.log(this.addCateForm);
      this.$refs.addCateFormRef.validate(async valid=>{
        if (!valid) {
          return
        }
        const {data:res} = await this.$http.post('categories',this.addCateForm)

        if (res.meta.status !==201) {
          return this.$message.error('添加分类成功')
        }

        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框关闭事件 重置表单
    addCateDIalogClose(){
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  },
  created() {
    this.getCateList()
  },
}
</script>

<style lang="less" scoped>
.treeTable{
  margin-top: 15px;
}
</style>