<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRole">
            添加角色
          </el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom',li === 0 ? 'bdtop':'','vcenter']" v-for="(item1,li) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag @close="removRightById(scope.row,item1.id)" closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row :class="[li2 ===0 ? '':'bdtop','vcenter']" v-for="(item2,li2) in item1.children" :key="item2.id">
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" @close="removRightById(scope.row,item2.id)" closable >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3,li3) in item2.children" :key="item3.id" closable @close="removRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{scope.row}}
            </pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRoleById(scope.row.id,scope.row.roleName)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRoleById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleVisible"
      width="50%"
      @close="addClose()"
      >
      <el-form :model="AddRoleForm" :rules="AddRoleRules" ref="AddRoleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="AddRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="AddRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleInfo()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editRoleVisible"
      width="50%"
      >
      <el-form :model="editRoleForm" :rules="AddRoleRules" ref="editRoleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%" @close="setRightDialogClose">
      <!-- 树形控件 -->
      <el-tree show-checkbox :data="rightsList" :props="treeProps" node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolelist:[],
      // 添加角色的显示隐藏
      addRoleVisible:false,
      // 添加角色数据内容
      AddRoleForm:{
        roleName:'',
        roleDesc:'',
        roleId:''
      },
      // 添加角色数据内容规则
      AddRoleRules:{
        roleName:[
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 1, max: 12, message: '长度在 1 到 12 个字符', trigger: 'blur' }
        ],
      },
      // 修改角色显示隐藏
      editRoleVisible:false,
      // 修改角色数据
      editRoleForm:{
        roleName:'',
        roleDesc:''
      },
      // 控制分配权限对话框显示与隐藏
      setRightDialogVisible:false,
      // 所有权限的数据
      rightsList:[],
      // 树形控件数据绑定对象
      treeProps:{
        label:'authName',
        children:'children'
      },
      // 树形控件默认选中节点ID值
      defKeys:[],
      // 当前即将分配权限的角色id
      roleId:''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList(){
      const {data:res} = await this.$http.get('roles')
      if (res.meta.status !==200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolelist = res.data
      // console.log(this.rolelist);
    },
    // 根据id删除对应的权限
    async removRightById(role,rightId){
      // console.log(role);
      // 弹框提示用户是否删除
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)

      if (confirmResult !=='confirm') {
        return this.$message.info('取消删除')
      }
      // console.log('确认删除');

      const {data:res}= await this.$http.delete(`roles/${role.id}/rights/${rightId}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！！')
      }

      // this.getRolesList()
      role.children = res.data

    },
    // 添加角色
    addRole(){
      this.addRoleVisible = true
    },
    // 监听添加角色关闭事件
    addClose(){
      this.$refs.AddRoleFormRef.resetFields()
    },
    // 添加角色提交
    addRoleInfo(){
      this.$refs.AddRoleFormRef.validate(async (valid)=>{
        // console.log(valid);
        if (valid !==true) {
          return this.$message.error('请输入正确角色名称')
        }
        const {data:res} = await this.$http.post('roles',this.AddRoleForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }else{
          this.$message.success('添加角色成功')
          this.addRoleVisible = false
          this.getRolesList()
        }
      })
    },
    // 点击修改获取角色数据
    async editRoleById(id,roleName){
      this.editRoleVisible = true

      const {data:res} = await this.$http.put(`roles/${id}`,{roleName})
      // console.log(res.data);
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色数据失败！')
      }
      this.editRoleForm.roleName = res.data.roleName
      this.editRoleForm.roleDesc = res.data.roleDesc
      this.editRoleForm.roleId = res.data.roleId
      // console.log(this.editRoleForm);
    },
    // 修改角色提交
    editRoleInfo(){
      // console.log(this.editRoleForm.roleId);
      let id = this.editRoleForm.roleId

      this.$refs.editRoleFormRef.validate(async (valid)=>{
        // console.log(valid);
        if (valid !==true) {
          return this.$message.error('请输入正确角色名称')
        }
        const {data:res} = await this.$http.put(`roles/${id}`,this.editRoleForm)
        // console.log(res);
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色失败')
        }else{
          this.$message.success('修改角色成功')
          this.editRoleVisible = false
          this.getRolesList()
        }
      })
    },
    // 删除角色
    async deleteRoleById(id){
      // console.log(id);
      const IsConfirm = this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(IsConfirm);
      // 如果用户确认删除，则返回值为字符串confirm
      // 如果用户取消了删除，则返回值为字符串cancel
      if (IsConfirm !== 'confirm') {
        return this.$message.error('删除已取消！')
      }else{
        const {data:res} = await this.$http.delete(`roles/${id}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败！')
        }
        this.$message.success('删除成功！')
        this.getRolesList()
      }

    },
    // 展示分配权限对话框
    async showSetRightDialog(role){
      // 保存角色id
      this.roleId = role.id
      // 获取所有权限数据
      const {data:res} = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      this.rightsList = res.data
      // console.log(this.rightsList);

      // 递归获取三级节点的id
      this.getLeafKeys(role,this.defKeys)

      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限ID保存到数组defKeys下
    getLeafKeys(node,arr){
      // 如果当前node节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item=>{
        this.getLeafKeys(item,arr)
      })
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClose(){
      this.defKeys = []
    },
    // 点击提交 分配权限
    async allotRights(){
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      // console.log(keys);

      const idStr = keys.join(',')
      // console.log(idStr);

     const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})

     if (res.meta.status !== 200) {
       return this.$message.error('分配权限失败！')
     }
     this.$message.success('分配权限成功')
     this.getRolesList()
     this.setRightDialogVisible = false
    }
  },
}
</script>

<style lang="less" scoped>
.el-tag{
  margin: 7px;
}
.bdtop{
  border-top: 1px solid #eee;
}
.bdbottom{
  border-bottom: 1px solid #eee;
}
.vcenter{
  display: flex;
  align-items: center;
}
</style>