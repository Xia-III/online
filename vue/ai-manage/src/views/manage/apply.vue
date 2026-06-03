<template>
  <div class="container" ref="container">
    <!-- 顶部搜索框 - 仅在移动端显示 -->
    <div class="search-container mobile-search">
      <div class="search-wrapper">
        <van-search 
          v-model="keyword" 
          shape="round" 
          placeholder="请输入搜索关键词"
          @search="onSearch"
          @update:model-value="onInput"
          @keydown.enter.prevent="onSearch" 
        />
        <el-button type="primary" class="search-btn" @click="onSearch">
          搜索
        </el-button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="page-header">
      <div class="T">知识库管理员设置</div>
      <div class="t">设置知识库管理员，为知识共享贡献力量</div>
    </div>


    <div class="content">
      <!-- 使用 v-for 遍历 datasetList 生成卡片，点击卡片打开管理员设置弹窗 -->
      <div class="card card-item" v-for="dataset in datasetList" :key="dataset.id" @click="handleCardClick(dataset)">
        <div class="card-header">{{ dataset.name }}</div>
        <div class="card-app-count">关联应用：{{ dataset.app_count }}</div>
        
        <!-- 修改的卡片操作区域，默认折叠 -->
        <div class="card-actions" :class="{ 'expanded': dataset.isExpanded }">
          <el-button type="primary" size="small" @click.stop="editDataset(dataset)">修改</el-button>
          <el-button type="danger" size="small" @click.stop="deleteDataset(dataset.id)">删除</el-button>
        </div>
      </div>
    </div>
    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination 
        :page-size="size" 
        :current-page="currentPage" 
        :pager-count="5" 
        layout="prev, pager, next" 
        :total="total"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 底部导航 - 仅在移动端显示 -->
    <van-tabbar v-model="activeTab" class="tabbar mobile-tabbar">
      <van-tabbar-item icon="edit" :active="activeTab === 0" @click="switchTab(0)">
        知识库
      </van-tabbar-item>
      <van-tabbar-item v-if="role === 1" icon="notes-o" :active="activeTab === 1" @click="switchTab(1)">
        管理
      </van-tabbar-item>
      <van-tabbar-item v-if="role === 1" icon="home-o" :active="activeTab === 2" @click="switchTab(2)">
        用户
      </van-tabbar-item>
      <van-tabbar-item icon="user-o" :active="activeTab === 3" @click="switchTab(3)">
        个人中心
      </van-tabbar-item>
    </van-tabbar>
    
    <!-- 顶部导航 - 仅在PC端显示 -->
    <div class="pc-nav">
      <div class="pc-nav-container">
        <div class="logo">知识库管理系统</div>
        
        <!-- PC端搜索框 - 位于logo右侧 -->
        <div class="pc-search-wrapper">
          <van-search 
            v-model="keyword" 
            shape="round" 
            placeholder="请输入搜索关键词"
            @search="onSearch"
            @update:model-value="onInput"
            @keydown.enter.prevent="onSearch" 
          />
          <el-button type="primary" class="pc-search-btn" @click="onSearch">
            搜索
          </el-button>
        </div>
        
        <div class="nav-items">
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 0 }"
            @click="switchTab(0)"
          >
            知识库
          </div>
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 1 }"
            @click="switchTab(1)"
            v-if="role === 1"
          >
            管理
          </div>
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 2 }"
            @click="switchTab(2)"
            v-if="role === 1"
          >
            用户
          </div>
          <div 
            class="nav-item" 
            :class="{ active: activeTab === 3 }"
            @click="switchTab(3)"
          >
            个人中心
          </div>
        </div>
      </div>
    </div>

    <!-- 设置管理员对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="80%"
      :show-close="true"
      align-center
      :lock-scroll="true"
      :close-on-click-modal="false"
      class="admin-dialog" 
    >
      <div class="dialog-content">
        <div class="dialog-section">
          <h3 class="section-title">当前管理员</h3>
          <div v-if="knowledgeDocumentAdminList.length > 0" class="admin-list">
            <div v-for="admin in knowledgeDocumentAdminList" :key="admin.id" class="admin-item">
              <div class="admin-info">
                <div class="admin-details">
                  <div class="admin-name">{{ getUserInfo(admin.administratorId)?.username || '未知用户' }}</div>
                  <div class="admin-contact">
                    <span>{{ getUserInfo(admin.administratorId)?.mobile || '无手机号' }}</span>
                    <span>{{ getUserInfo(admin.administratorId)?.email || '无邮箱' }}</span>
                  </div>
                </div>
              </div>
              <el-button 
                type="danger" 
                size="small" 
                @click="removeAdmin(admin.id)"
                class="remove-btn"
              >
                移除
              </el-button>
            </div>
          </div>
          <div v-else class="no-admin">暂无管理员</div>
        </div>

        <div class="dialog-section">
          <h3 class="section-title">添加新管理员</h3>
          <el-select 
            v-model="selectedUserId" 
            placeholder="选择用户"
            class="user-select"
            filterable
            clearable
            popper-append-to-body="false"
            popper-class="limited-select-dropdown"
          >
            <el-option 
              v-for="user in filteredUserList" 
              :key="user.userId"
              :label="user.username"
              :value="user.userId"
            >
              <div class="option-content">
                <div>
                  <div>{{ user.username }}</div>
                  <div class="option-subtitle">{{ user.mobile }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
          <el-button 
            type="primary" 
            @click="addAdmin"
            :disabled="!selectedUserId"
            class="add-btn"
          >
            添加为管理员
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 添加知识库弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加知识库"
      width="80%"
      :show-close="true"
      align-center
      :lock-scroll="true"
      :close-on-click-modal="false"
      class="add-dialog"
    >
      <div class="add-dialog-content">
        <el-form :model="knowledgeForm" :rules="rules" ref="knowledgeFormRef" label-width="0">
          <el-form-item prop="name">
            <el-input 
              v-model="knowledgeForm.name" 
              placeholder="请输入知识库名称" 
              class="knowledge-input"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeAddDialog">取消</el-button>
          <el-button type="primary" @click="submitKnowledge">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改知识库弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="修改知识库"
      width="80%"
      :show-close="true"
      align-center
      :lock-scroll="true"
      :close-on-click-modal="false"
      class="edit-dialog"
    >
      <div class="edit-dialog-content">
        <el-form :model="editKnowledgeForm" :rules="rules" ref="editKnowledgeFormRef" label-width="0">
          <el-form-item prop="name">
            <el-input 
              v-model="editKnowledgeForm.name" 
              placeholder="请输入知识库名称" 
              class="knowledge-input"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeEditDialog">取消</el-button>
          <el-button type="primary" @click="submitEditKnowledge">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 悬浮添加按钮 -->
    <div class="floating-add-btn" @click="openAddDialog">
      <van-icon name="plus" size="24" color="#fff" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Tabbar, TabbarItem, Search, Icon } from 'vant';
import { ElPagination, ElButton, ElDialog, ElMessage, ElSelect, ElOption, ElMessageBox, ElForm, ElFormItem, ElInput, ElFormInstance } from 'element-plus';
import { getDatasetListAPI, authorityAddAPI, getUserListAPI, getKnowledgeDocumentAdminListByDatasetsIdAPI, deleteKnowledgeDocumentAdminAPI, 
createKnowledgeDatasetAPI, updateKnowledgeDatasetAPI, deleteKnowledgeDatasetAPI } from '@/api';
import { useUserStore } from '../../stores/pinia';

// 状态管理
const userStore = useUserStore();
const role = computed(() => {
  return userStore.userInfo?.role ?? 0; // 1：管理员 0：普通用户，默认普通用户
});

const activeTab = ref(1);
const keyword = ref(''); // 搜索框绑定的值
const router = useRouter();
const route = useRoute(); // 获取当前路由实例
const size = ref(3);
const currentPage = ref(1);
const total = ref(10);
const datasetList = ref([
  // {
  //   "id": "e8a403a6-9bb1-485c-8ee8-91ac86bf3a31",
  //   "name": "1",
  //   "app_count": 0,
  //   "isExpanded": false // 添加展开状态
  // }
]);
const userList = ref([
    //   {
    //   "userId": 1,
    //   "username": "ww",
    //   "userPic": "http://101.200.231.100:8011/demo/001.jpg",
    //   "mobile": "19185250931",
    //   "email": "asdk@163.com",
    //   "role": 0,
    //   "status": 1
    // }
]);
// 管理员列表只保留基础关联字段
const knowledgeDocumentAdminList = ref([
  //  {
  //     "id": 2,
  //     "datasetsId": "50406473-035e-4bf7-a896-ebb2387b3074",
  //     "datasetsName": "111",
  //     "administratorId": 6
  //   }
]);

// 防止重复请求的锁
const isLoading = ref(false);

// 对话框相关状态
const dialogVisible = ref(false);
const dialogTitle = ref('知识库管理员管理');
const currentDataset = ref(null);
const selectedUserId = ref('');

// 添加知识库弹窗相关状态
const addDialogVisible = ref(false);
const knowledgeForm = reactive({
  name: ''
});
const knowledgeFormRef = ref();

// 修改知识库弹窗相关状态
const editDialogVisible = ref(false);
const editKnowledgeForm = reactive({
  id: '',
  name: ''
});
const editKnowledgeFormRef = ref();

// 新增：标记弹窗是否正在关闭
const isDialogClosing = ref(false);

const rules = {
  name: [
    { required: true, message: '请输入知识库名称', trigger: 'blur' },
    { min: 1, max: 50, message: '名称长度在 1 到 50 个字符', trigger: 'blur' }
  ]
};

// 路由路径与tab索引的映射关系
const routeTabMap = {
  '/manage/databaseManage': 0,
  '/manage/apply': 1,
  '/manage/audit': 2,
  '/manage/personalCenter': 3
};

// 容器引用，用于监听点击事件
const container = ref(null);

// 计算属性：检查是否有任何弹窗打开
const isAnyDialogOpen = computed(() => {
  return dialogVisible.value || addDialogVisible.value || editDialogVisible.value;
});

// 根据路由设置activeTab
const setTabByRoute = (path) => {
  activeTab.value = routeTabMap[path] ?? 0;
};

// 获取用户信息的工具函数 - 通过userId匹配
const getUserInfo = (userId) => {
  return userList.value.find(user => user.userId === userId) || null;
};

// 获取知识库管理员列表
const getKnowledgeDocumentAdminList = async (datasetsId) => {
  try {
    const response = await getKnowledgeDocumentAdminListByDatasetsIdAPI({
      datasetsId: datasetsId
    });
    if(response.status === 200){
      knowledgeDocumentAdminList.value = response.data.data || [];
    }
  } catch (error) {
    console.error('获取知识库管理员列表失败:', error);
  }
}

// 获取用户列表
const getUserList = async () => {
  try {
    const response = await getUserListAPI();
    if(response.status === 200){
      userList.value = response.data.data || [];
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
  }
}

// 获取不在管理员列表中的用户
const filteredUserList = computed(() => {
  if (!knowledgeDocumentAdminList.value.length) {
    return [...userList.value];
  }
  
  const adminIds = knowledgeDocumentAdminList.value.map(admin => admin.administratorId);
  return userList.value.filter(user => !adminIds.includes(user.userId));
});

// 获取数据集列表
const getDatasetList = async () => {
  // 如果正在加载中，直接返回
  if (isLoading.value) return;
  
  try {
    isLoading.value = true;
    const response = await getDatasetListAPI({
      keyword: keyword.value,
      page: currentPage.value,
      limit: size.value
    });
    // 为每个数据集添加isExpanded属性
    const datasets = response.data.data || [];
    datasetList.value = datasets.map(dataset => ({
      ...dataset,
      isExpanded: false
    }));
    total.value = response.data.total || 0;
  } catch (error) {
    console.error('获取数据集列表失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 处理卡片点击事件 - 切换展开状态或打开对话框
const handleCardClick = (dataset) => {
  // 如果已经展开，则打开管理员设置对话框
  if (dataset.isExpanded) {
    openDialog(dataset);
  } else {
    // 关闭其他卡片的展开状态
    datasetList.value.forEach(item => {
      if (item.id !== dataset.id) {
        item.isExpanded = false;
      }
    });
    // 切换当前卡片的展开状态
    dataset.isExpanded = !dataset.isExpanded;
  }
};

// 处理点击外部区域关闭所有展开的卡片
const handleClickOutside = (event) => {
  // 如果有任何弹窗打开或正在关闭，不执行关闭操作
  if (isAnyDialogOpen.value || isDialogClosing.value) return;
  
  // 检查是否点击的是卡片或卡片内的元素
  const isClickOnCard = event.target.closest('.card-item');
  
  // 如果不是点击卡片，且有卡片处于展开状态，则关闭所有卡片的展开状态
  if (!isClickOnCard) {
    datasetList.value.forEach(item => {
      item.isExpanded = false;
    });
  }
};

// 解决组件复用导致onMounted只执行一次的问题
let isFirstLoad = ref(true);

// 页面进入时执行
const handlePageEnter = () => {
  if (!checkAdminRole()) return;
  getDatasetList();
  getUserList();
  setTabByRoute(route.path);
};

// 验证身份并跳转
const checkAdminRole = () => {
  if (role.value !== 1) {
    ElMessage.warning('您没有权限访问此页面');
    router.replace('/manage/databaseManage');
    return false;
  }
  return true;
};

// 首次加载执行
onMounted(() => {
  handlePageEnter();
  isFirstLoad.value = false;
  
  // 添加点击事件监听器
  if (container.value) {
    container.value.addEventListener('click', handleClickOutside);
  }
});

// 组件卸载时移除事件监听器
onUnmounted(() => {
  if (container.value) {
    container.value.removeEventListener('click', handleClickOutside);
  }
});

// 监听路由变化 - 当从其他页面进入当前页面时触发
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath === '/manage/apply') {
      if (!checkAdminRole()) return;
    }
    setTabByRoute(newPath);
    // 非首次加载且是从其他页面进入当前页面时重新加载数据
    if (!isFirstLoad.value && newPath === '/manage/apply' && oldPath !== newPath) {
      getDatasetList();
      getUserList();
    }
  },
  { immediate: true }
);

// 分页切换事件处理
const handlePageChange = (page) => {
  currentPage.value = page;
  getDatasetList();
};

// 标签切换方法
const switchTab = (index) => {
  activeTab.value = index;
  switch(index) {
      case 0:
        router.push('/manage/databaseManage');
        break;
      case 1:
        router.push('/manage/apply');
        break;
      case 2:
        router.push('/manage/audit');
        break;
      case 3:
        router.push('/manage/personalCenter');
        break;
  }
};

// 搜索框事件处理
const onSearch = () => {
  // 清空输入时也执行搜索，显示全部结果
  currentPage.value = 1;
  getDatasetList();
};

// 输入框内容变化处理
const onInput = (value) => {
  keyword.value = value;
};

// 打开管理员对话框
const openDialog = async (dataset) => {
  // 禁用背景滚动
  document.body.style.overflow = 'hidden';
  
  currentDataset.value = dataset;
  dialogTitle.value = `${dataset.name} - 管理员设置`;
  dialogVisible.value = true;
  
  // 加载该知识库的管理员列表
  await getKnowledgeDocumentAdminList(dataset.id);
  // 重置选中用户
  selectedUserId.value = '';
};


// 打开添加知识库弹窗
const openAddDialog = () => {
  // 重置表单
  knowledgeForm.name = '';
  if (knowledgeFormRef.value) {
    knowledgeFormRef.value.clearValidate();
  }
  addDialogVisible.value = true;
};

// 关闭添加知识库弹窗
const closeAddDialog = () => {
  isDialogClosing.value = true;
  addDialogVisible.value = false;
  // 短暂延迟后重置状态
  setTimeout(() => {
    isDialogClosing.value = false;
  }, 100);
};

// 打开修改知识库对话框
const editDataset = (dataset) => {
  editKnowledgeForm.id = dataset.id;
  editKnowledgeForm.name = dataset.name;
  if (editKnowledgeFormRef.value) {
    editKnowledgeFormRef.value.clearValidate();
  }
  editDialogVisible.value = true;
};

// 关闭修改知识库弹窗
const closeEditDialog = () => {
  isDialogClosing.value = true;
  editDialogVisible.value = false;
  // 短暂延迟后重置状态
  setTimeout(() => {
    isDialogClosing.value = false;
  }, 100);
};

// 添加管理员
const addAdmin = async () => {
  if (!selectedUserId.value || !currentDataset.value) return;
  
  try {
    const res = await authorityAddAPI({
      datasetsId: currentDataset.value.id,
      datasetsName: currentDataset.value.name,
      administratorId: selectedUserId.value,
      level: 1 // 管理员级别
    });

    if(res.data.code === 0){
      ElMessage.success('添加管理员成功');
      // 重新获取管理员列表
      await getKnowledgeDocumentAdminList(currentDataset.value.id);
      // 重置选中状态
      selectedUserId.value = '';
    }else{
      ElMessage.error(res.data.msg || '添加管理员失败');
    }
  } catch (error) {
    console.error('添加管理员失败:', error);
    ElMessage.error('添加管理员失败');
  }
};

// 提交添加知识库表单
const submitKnowledge = async () => {
  if (!knowledgeFormRef.value) return;
  
  try {
    // 表单验证
    await knowledgeFormRef.value.validate();
    
    // 调用API创建知识库
    const res = await createKnowledgeDatasetAPI(knowledgeForm.name);
    
    if (res.status === 200) {
      ElMessage.success('知识库创建成功');
      closeAddDialog();
      // 刷新知识库列表
      getDatasetList();
    } else {
      ElMessage.error(res.data.msg || '知识库创建失败');
    }
  } catch (error) {
    // 表单验证失败不处理，已由Element Plus提示
    if (error === 'Validation failed') return;
    
    console.error('创建知识库失败:', error);
    ElMessage.error('创建知识库失败');
  }
};

// 提交修改知识库表单
const submitEditKnowledge = async () => {
  if (!editKnowledgeFormRef.value) return;
  
  try {
    // 表单验证
    await editKnowledgeFormRef.value.validate();
    
    // 调用API修改知识库
    const res = await updateKnowledgeDatasetAPI(editKnowledgeForm.id, editKnowledgeForm.name);
    
    if (res.status === 200) {
      ElMessage.success('知识库修改成功');
      closeEditDialog();
      // 刷新知识库列表
      getDatasetList();
    } else {
      ElMessage.error(res.data.msg || '知识库修改失败');
    }
  } catch (error) {
    // 表单验证失败不处理，已由Element Plus提示
    if (error === 'Validation failed') return;
    
    console.error('修改知识库失败:', error);
    ElMessage.error('修改知识库失败');
  }
};

// 删除知识库
const deleteDataset = async (datasetId) => {
  // 查找对应的知识库
  const dataset = datasetList.value.find(item => item.id === datasetId);
  
  // 检查是否有关联应用，如果有则直接提示无法删除
  if (dataset && dataset.app_count > 0) {
    ElMessage.warning('无法删除有关联应用的知识库');
    return;
  }
  
  try {
    // 使用ElMessageBox确认
    const result = await ElMessageBox.confirm(
      '确定要删除该知识库吗？此操作不可撤销！',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
        center: true
      }
    );

    // 如果用户点击确定
    if (result === 'confirm') {
      const res = await deleteKnowledgeDatasetAPI(datasetId);

      if(res.status === 204){
        ElMessage.success('知识库删除成功');
        // 刷新知识库列表
        getDatasetList();
      }else{
        ElMessage.error(res.data.msg || '知识库删除失败');
      }
    }
  } catch (error) {
    // 如果用户取消或发生错误，不做处理
    if (error === 'cancel') {
      return; // 用户取消操作
    }
    console.error('删除知识库失败:', error);
    ElMessage.error('删除知识库失败');
  }
};

// 移除管理员
const removeAdmin = async (adminId) => {
  try {
    // 使用ElMessageBox确认
    const result = await ElMessageBox.confirm(
      '确定要移除该管理员吗？',
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    );

    // 如果用户点击确定
    if (result === 'confirm') {
      const res = await deleteKnowledgeDocumentAdminAPI({
        id: adminId
      });

      if(res.status === 200){
        ElMessage.success('移除管理员成功');
        // 重新获取管理员列表
        await getKnowledgeDocumentAdminList(currentDataset.value.id);
      }else{
        ElMessage.error(res.data.msg || '移除管理员失败');
      }
    }
  } catch (error) {
    // 如果用户取消或发生错误，不做处理
    if (error === 'cancel') {
      return; // 用户取消操作
    }
    console.error('移除管理员失败:', error);
    ElMessage.error('移除管理员失败');
  }
};
</script>

<style>
/* 添加全局样式 */
.el-popup-parent--hidden {
  overflow: hidden !important;
  position: fixed;
  width: 100%;
}

/* 调整弹窗整体高度和布局 */
.el-dialog {
  display: flex;
  flex-direction: column;
  margin-top: 20vh !important;
  max-height: 60vh !important;
  height: auto !important;
}

.el-dialog__body {
  flex: 1;
  overflow-y: auto !important;
  padding-top: 15px !important;
  padding-bottom: 15px !important;
}

.el-dialog__wrapper {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: hidden;
}

/* 关键修改：使用自定义类名限制下拉列表高度 */
.limited-select-dropdown {
  max-height: 280px !important;
}

.limited-select-dropdown .el-select-dropdown__wrap {
  max-height: 280px !important;
  overflow-y: auto !important;
}
</style>

<style scoped>
.content {
  padding: 15px 30px 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 300px;
  box-sizing: border-box;
}

/* 移动端搜索框 */
.search-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 0px 15px;
  background-color: white;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.search-wrapper {
  display: flex;
  gap: 1px;
  width: 100%;
  align-items: center;
}

:deep(.van-search) {
  flex: 1;
}

.page-header {
  padding-top: 110px;
  text-align: center;
}
.T {
  font-weight: bold; 
  text-align: center; 
  font-size: 55px;
  margin-bottom: 10px;
}

.t {
  text-align: center; 
  font-size: 33px;
  margin-left: 20px;
  margin-right: 20px;
  color: #666;
}

.card {
  background-color: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.card-header {
  font-weight: bold;
  font-size: 44px;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
}

/* 修改的卡片操作按钮区域 */
.card-actions {
  display: flex;
  justify-content: space-between; /* 左右对齐 */
  gap: 10px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease, margin-top 0.3s ease;
}

/* 展开状态的样式 */
.card-actions.expanded {
  max-height: 100px;
  opacity: 1;
  margin-top: 20px;
}

/* 新增的card-app-count样式 */
.card-app-count {
  font-size: 24px; /* 移动端中小字体 */
  color: #3886e0; /* 浅蓝颜色 */
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
  margin-bottom: 50px;
  padding: 5px 0;
  min-height: 60px;
  position: relative;
  z-index: 1;
}

:deep(.el-pagination) {
  display: inline-flex !important;
  align-items: center;
  margin: 0;
}

.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #F3F4F6;
  font-size: 15px;
  z-index: 5;
}

.container {
  min-height: 100vh;
  background-color: #F9FAFB;
  padding-bottom: 60px;
  box-sizing: border-box;
}

/* 对话框样式优化 */
.dialog-content {
  padding: 10px 0;
  max-height: none;
}

.dialog-section {
  margin-bottom: 15px;
}

.section-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.admin-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.admin-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.admin-name {
  font-size: 28px;
  font-weight: 500;
  color: #333;
}

.admin-contact {
  display: flex;
  gap: 15px;
  font-size: 24px;
  color: #666;
  margin-top: 5px;
}

.no-admin {
  text-align: center;
  padding: 15px;
  color: #999;
  font-size: 28px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.user-select {
  width: 100%;
  margin-bottom: 10px;
}

/* 确保每个选项高度一致 */
:deep(.el-select-dropdown__item) {
  padding: 15px;
  height: 70px !important;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.option-content {
  display: flex;
  align-items: center;
}

.option-subtitle {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.add-btn {
  width: 100%;
  margin-bottom: 0;
  padding: 10px 0;
}

.remove-btn {
  height: 40px;
}

:deep(.el-dialog) {
  border-radius: 12px;
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 15px 20px 10px;
  text-align: center;
}

:deep(.el-dialog__headerbtn) {
  font-size: 20px;
}

:deep(.el-dialog__title) {
  font-size: 36px;
  font-weight: bold;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 10px;
}

:deep(.el-button) {
  padding: 12px 30px;
  font-size: 32px;
  border-radius: 8px;
}

/* 添加知识库弹窗样式 */
.add-dialog-content {
  padding: 10px 0;
}

.knowledge-input {
  width: 100%;
  font-size: 30px;
  padding: 15px;
}

/* 对话框相关样式调整 */
:deep(.admin-dialog .el-dialog),
:deep(.add-dialog .el-dialog),
:deep(.edit-dialog .el-dialog) {
  margin: 20vh auto 24px !important;
  max-height: 60vh !important;
}

:deep(.admin-dialog .el-dialog__body),
:deep(.add-dialog .el-dialog__body),
:deep(.edit-dialog .el-dialog__body) {
  padding: 10px 20px;
  overflow-y: auto;
}

/* PC端导航栏 - 默认隐藏 */
.pc-nav {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 11;
}

.pc-nav-container {
  display: flex;
  align-items: center;
  max-width: 1200px;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
  gap: 20px;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: #2563EB;
  white-space: nowrap;
}

/* PC端搜索框样式 */
.pc-search-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  max-width: 500px;
}

:deep(.pc-search-wrapper .van-search) {
  flex: 1;
}

.pc-search-btn {
  white-space: nowrap;
}

.nav-items {
  display: flex;
  gap: 30px;
  margin-left: auto;
}

.nav-item {
  font-size: 16px;
  color: #333;
  cursor: pointer;
  padding: 5px 0;
  position: relative;
}

.nav-item.active {
  color: #2563EB;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #2563EB;
}

/* 悬浮添加按钮样式 - 移动端设置 */
.floating-add-btn {
  position: fixed;
  right: 30px;
  bottom: 120px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #2563EB;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  cursor: pointer;
  z-index: 4;
  transition: transform 0.2s, box-shadow 0.2s;
}

/* 调整移动端图标大小以适应更大的按钮 */
.floating-add-btn :deep(.van-icon) {
  font-size: 30px !important;
}

.floating-add-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

/* 响应式设计 - 移动端优先 */
@media (min-width: 768px) {
  /* PC端样式 */
  .container {
    padding-bottom: 0;
  }
  
  .content, .page-header {
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 80px;
  }
  
  /* 隐藏移动端搜索框和底部导航，显示PC端导航 */
  .mobile-search, .mobile-tabbar {
    display: none;
  }
  
  .pc-nav {
    display: block;
  }
  
  .knowledge-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  
  .page-header .T {
    font-size: 32px;
  }
  
  .page-header .t {
    font-size: 16px;
  }
  
  .card {
    padding: 20px;
  }
  
  .card-header {
    font-size: 18px;
    margin-bottom: 5px;
  }
  
  /* 卡片按钮在PC端的样式 */
  :deep(.card-actions .el-button) {
    padding: 5px 12px;
    font-size: 14px;
  }
  
  /* PC端的card-app-count样式 */
  .card-app-count {
    font-size: 14px;
    color: #3886e0;
  }
  
  .admin-name {
    font-size: 16px;
  }
  
  .admin-contact {
    font-size: 14px;
  }
  
  .no-admin {
    font-size: 16px;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .knowledge-input {
    font-size: 16px;
    padding: 10px;
  }
  
  :deep(.van-icon) {
    transform: scale(0.8);
  }
  
  :deep(.pc-search-wrapper .el-button) {
    padding: 8px 20px;
    font-size: 14px;
  }
  
  :deep(.el-pagination) {
    font-size: 14px;
  }
  
  :deep(.el-dialog__title) {
    font-size: 20px;
  }
  
  :deep(.el-button) {
    padding: 8px 20px;
    font-size: 14px;
  }
  
  /* PC端悬浮按钮保持原有样式 */
  .floating-add-btn {
    right: 40px;
    bottom: 40px;
    width: 64px;
    height: 64px;
  }
  
  /* 恢复PC端图标大小 */
  .floating-add-btn :deep(.van-icon) {
    font-size: 24px !important;
  }
}

@media (min-width: 1024px) {
  /* 大屏幕PC样式 */
  .content {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
