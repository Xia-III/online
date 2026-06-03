<template>
  <div class="container">
    <!-- 顶部搜索框 - 仅在移动端显示 -->
    <div class="search-container mobile-search">
      <div class="search-wrapper">
        <van-search 
          v-model="keyword" 
          shape="round" 
          placeholder="请输入用户名或账号"
          @search="onSearch"
          @update:model-value="onInput"
        />
        <el-button type="primary" class="search-btn" @click="onSearch">
          搜索
        </el-button>
      </div>
    </div>

    <!-- 主内容区域 - 包含用户卡片列表 -->
    <div class="main-content">
     <!-- 页面标题和操作区 -->
      <div class="header-actions">
        <h2 class="page-title">用户管理</h2>
        <el-button type="primary" @click="handleAddUser">
          <i class="el-icon-plus"></i> 添加用户
        </el-button>
      </div>
      <!-- 用户卡片列表 - 移动端一行一个，PC端一行多个 -->
      <div class="user-list">
        <div 
          v-for="user in displayUsers" 
          :key="user.userId" 
          class="user-card"
          @mouseenter="handleCardHover(user.userId, true)"
          @mouseleave="handleCardHover(user.userId, false)"
          @click="handleViewUser(user)"
        >
          <div class="user-avatar">
            <!-- 当头像为空时显示默认头像 -->
            <template v-if="user.userPic && user.userPic.trim()">
              <img :src="user.userPic"  class="avatar-img">
            </template>
            <template v-else>
              <el-avatar class="default-avatar">
                <i class="el-icon-user"></i>
              </el-avatar>
            </template>
          </div>
          
          <div class="user-info">
            <div class="user-main-info">
              <h3 class="user-name">{{ user.username }}</h3>
              <p class="user-accountNumber">{{ user.accountNumber }}</p>
            </div>
            <div class="user-meta">
              <span class="user-status" :class="user.status ? 'status-active' : 'status-inactive'">
                {{ user.status===1 ? '正常' : '禁用' }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 无数据提示 -->
        <div v-if="displayUsers.length === 0 && !loading" class="no-data">
          没有找到匹配的用户
        </div>
        
        <!-- 加载中提示 -->
        <div v-if="loading" class="loading">
          <el-loading-spinner></el-loading-spinner>
          <p>加载中...</p>
        </div>
      </div>

      <!-- 分页组件 -->
    <div class="pagination-container">
      <el-pagination 
        :page-size="pageSize" 
        :current-page="page" 
        :pager-count="5" 
        layout="prev, pager, next" 
        :total="total"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
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
            placeholder="请输入用户名或账号"
            @search="onSearch"
            @update:model-value="onInput"
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

    <!-- 添加用户弹窗 -->
    <el-dialog
      title="添加用户"
      v-model="dialogVisible"
      :width="isMobile ? '84%' : '500px'" 
      :before-close="handleClose"
      class="mobile-dialog"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="80px"
        class="add-user-form"
      >
        <el-form-item label="账号" prop="accountNumber">
          <el-input v-model="form.accountNumber" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose" class="footer-btn cancel-btn">取消</el-button>
          <el-button type="primary" @click="handleSubmit" class="footer-btn confirm-btn">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户详情弹窗 -->
    <el-dialog
      :title="`${currentUser.username || ''} 的详情`"
      v-model="detailDialogVisible"
      :width="isMobile ? '84%' : '500px'" 
      :before-close="handleDetailClose"
      class="mobile-dialog"
    >
      <div class="user-detail">
        <div class="detail-avatar">
          <!-- 当头像为空时显示默认头像 -->
          <template v-if="currentUser.userPic && currentUser.userPic.trim()">
            <img :src="currentUser.userPic"  class="detail-avatar-img">
          </template>
          <template v-else>
            <el-avatar class="default-detail-avatar">
              <i class="el-icon-user"></i>
            </el-avatar>
          </template>
        </div>
        
        <div class="detail-info">
          <!-- 每个属性名和值在一行展示 -->
           <div class="detail-item">账号：<span class="detail-value">{{ currentUser.accountNumber || '-' }}</span></div>
          <div class="detail-item">用户名：<span class="detail-value">{{ currentUser.username || '-' }}</span></div>
          <div class="detail-item">邮箱：<span class="detail-value">{{ currentUser.email || '-' }}</span></div>
          <div class="detail-item">密码：<span class="detail-value">{{ currentUser.password || '-' }}</span></div>
          <div class="detail-item">角色：<span class="detail-value">{{ currentUser.role === 1 ? '管理员' : '普通用户' }}</span></div>
          <div class="detail-item">状态：<span class="detail-value" :class="currentUser.status === 1 ? 'status-active' : 'status-inactive'">
            {{ currentUser.status === 1 ? '正常' : '禁用' }}
          </span></div>
        </div>
      </div>
      
      <template #footer>
        <div class="detail-footer">
          <el-button 
            type="primary" 
            class="el-button"
            plain 
            @click="handleResetPassword(currentUser.userId)"
          >
            重置密码
          </el-button>
          <el-button 
            :type="currentUser.status === 1 ? 'warning' : 'success'" 
            class="el-button"
            @click="handleToggleStatus(currentUser.userId)"
          >
            {{ currentUser.status === 1 ? '禁用' : '恢复' }}
          </el-button>
          <el-button 
            type="danger" 
            class="el-button"
            @click="handleDeleteUser"
          >
            删除
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Tabbar, TabbarItem, Search } from 'vant';
import { ElButton, ElMessage, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElSwitch, ElPagination, ElLoading, ElMessageBox, ElAvatar } from 'element-plus';
import { getUserListByPageAPI, AdminAddUserAPI,UpdateUserStatusAPI,ResetPasswordAPI,DeleteUserAPI } from '@/api';
import { useUserStore } from '../../stores/pinia';

// 角色管理
const userStore = useUserStore();
const role = computed(() => {
  return userStore.userInfo?.role ?? 0; // 1：管理员 0：普通用户，默认普通用户
});


// 状态管理
const activeTab = ref(2);
const keyword = ref('');
const router = useRouter();
const route = useRoute();
const hoveredUserId = ref(null);
const dialogVisible = ref(false);
const formRef = ref(null);
const isMobile = ref(false);
const detailDialogVisible = ref(false);
const currentUser = ref({});
const userList = ref([
  {
    userId: 1,
    username: '张三',
    email: 'zhangsan@example.com',
    userPic: 'https://picsum.photos/id/1/200',
    accountNumber: 'zhangsan',
    status: 1,
    role: 0
  },
  {
    userId: 2,
    username: '李四',
    email: 'lisi@example.com',
    userPic: '', // 测试空头像情况
    accountNumber: 'lisi',
    status: 1,
    role: 0
  },
  {
    userId: 3,
    username: '王五',
    email: 'wangwu@example.com',
    userPic: null, // 测试null头像情况
    accountNumber: 'wangwu',
    status: 0,
    role: 0
  }
]);

// 分页
const page = ref(1);
const pageSize = ref(4);
const total = ref(0);
const loading = ref(false);
// 添加防抖标记，防止重复请求
const isSearching = ref(false);

const getList = async () => {
  // 如果正在加载中，则不重复请求
  if (loading.value) return;
  
  try {
    loading.value = true;
    const res = await getUserListByPageAPI({
      page: page.value,
      size: pageSize.value,
      keyword: keyword.value || undefined
    });
    if (res.data.code === 0 && res.data.data) {
      userList.value = res.data.data;
      total.value = res.data.total || 0;
    } else {
      ElMessage.warning('获取用户列表失败');
      userList.value = [];
      total.value = 0;
    }
  } catch (error) {
    ElMessage.error('获取用户列表时发生错误');
    console.error('Error fetching user list:', error);
    userList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
    isSearching.value = false;
  }
}

onMounted(() => {
  getList();
})
// 添加用户表单数据
const form = reactive({
  username: '',
  accountNumber: ''
});

// 表单验证规则
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  accountNumber: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 2, max: 20, message: '账号长度在 2 到 20 个字符', trigger: 'blur' }
  ]
});

// 检测屏幕尺寸，判断是否为移动设备
const checkScreenSize = () => {
  const width = window.innerWidth;
  isMobile.value = width < 768;
};

// 验证身份
const checkAuth = () => {
  if (role.value !== 1) {
    ElMessage.warning('无权访问该页面');
    router.replace('/manage/databaseManage');
  }
};

// 初始化时检测屏幕尺寸
onMounted(() => {
  checkAuth();
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
  
  // 监听页面和页面大小变化，重新获取数据
  watch([page, pageSize], () => {
    getList();
  });
});

// 直接使用用户列表，不进行客户端过滤
const displayUsers = computed(() => {
  return userList.value;
});

// 分页事件处理
const handlePageChange = (val) => {
  page.value = val;
  // 滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  page.value = 1; // 重置到第一页
  // 滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 路由路径与tab索引的映射关系
const routeTabMap = {
  '/manage/databaseManage': 0,
  '/manage/apply': 1,
  '/manage/audit': 2,
  '/manage/personalCenter': 3
};

// 根据路由设置activeTab
const setTabByRoute = (path) => {
  activeTab.value = routeTabMap[path] ?? 2;
};

// 切换底部导航
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

// 搜索相关方法 - 添加防抖处理
const onSearch = () => {
  // 防止重复请求
  if (isSearching.value) return;
  
  isSearching.value = true;
  console.log('搜索关键词:', keyword.value);
  page.value = 1; // 搜索后重置到第一页
  
  // 使用setTimeout创建一个微小延迟，防止事件冒泡导致的重复调用
  setTimeout(() => {
    getList();
  }, 100);
};

const onInput = (value) => {
  keyword.value = value;
};

// 卡片交互效果
const handleCardHover = (userId, isHovered) => {
  hoveredUserId.value = isHovered ? userId : null;
};

// 用户操作方法 - 查看详情
const handleViewUser = (user) => {
  currentUser.value = { ...user };
  detailDialogVisible.value = true;
};

// 详情弹窗相关方法
const handleDetailClose = () => {
  detailDialogVisible.value = false;
};

// 重置密码
const handleResetPassword = (userId) => {
  ElMessageBox.confirm(
    `确定要重置 ${currentUser.value.username} 的密码吗？`,
    '确认重置',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      return ResetPasswordAPI({
        userId: userId
      });
    })
    .then(res => {
      if (res.data.code === 0) {
        ElMessage.success(`已重置 ${currentUser.value.username} 的密码`);
      } else {
        ElMessage.error('重置密码失败');
      }
    })
    .catch(() => {
      // 取消时不做处理
    });
};

// 切换用户状态（禁用/恢复）
const handleToggleStatus = (userId) => {
  const newStatus = currentUser.value.status === 1 ? 0 : 1;
  const actionText = newStatus === 1 ? '恢复' : '禁用';
  
  ElMessageBox.confirm(
    `确定要${actionText}用户 ${currentUser.value.username} 吗？`,
    `确认${actionText}`,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: newStatus === 1 ? 'success' : 'warning'
    }
  )
    .then(() => {
      return UpdateUserStatusAPI({
        userId: userId,
        status: newStatus
      });
    })
    .then(res => {
      if (res.data.code === 0) {
        // 更新当前用户状态
        currentUser.value.status = newStatus;
        
        // 更新用户列表中的状态
        const index = userList.value.findIndex(u => u.userId === currentUser.value.userId);
        if (index !== -1) {
          userList.value[index].status = newStatus;
        }
        
        ElMessage.success(`${actionText}用户 ${currentUser.value.username} 成功`);
      } else {
        ElMessage.error(`${actionText}用户失败`);
      }
    })
    .catch(() => {
      // 取消时不做处理
    });
};

// 删除用户
const handleDeleteUser = () => {
  if (currentUser.value.role === 1) {
    ElMessage.warning('不能删除管理员');
    return;
  }
  
  ElMessageBox.confirm(
    `确定要删除用户 ${currentUser.value.username} 吗？此操作不可恢复！`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  )
    .then(() => {
      return DeleteUserAPI({
        userId: currentUser.value.userId
      });
    })
    .then(res => {
      if (res.data.code === 0) {
        // 从用户列表中删除
        userList.value = userList.value.filter(u => u.userId !== currentUser.value.userId);
        
        // 如果删除后当前页没有数据且不是第一页，则切换到上一页
        if (displayUsers.value.length === 0 && page.value > 1) {
          page.value--;
          getList(); // 重新获取上一页数据
        } else {
          // 重新计算总数
          total.value--;
        }
        
        // 关闭详情弹窗
        detailDialogVisible.value = false;
        
        ElMessage.success(`已删除用户: ${currentUser.value.username}`);
      } else {
        ElMessage.error('删除用户失败');
      }
    })
    .catch(() => {
      // 取消时不做处理
    });
};

// 添加用户弹窗相关方法
const handleAddUser = () => {
  // 重置表单
  form.username = '';
  form.accountNumber = '';
  if (formRef.value) {
    formRef.value.resetFields();
  }
  // 显示弹窗
  dialogVisible.value = true;
};

const handleClose = () => {
  dialogVisible.value = false;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    await AdminAddUserAPI({
      username: form.username,
      accountNumber: form.accountNumber
    });
    
    ElMessage.success('用户添加成功');
    dialogVisible.value = false;
    // 刷新用户列表
    page.value = 1;
    getList();
  } catch (error) {
    if (error.name === 'ValidationError') {
      return; // 表单验证失败，不做其他处理
    }
    ElMessage.error(error.message || '添加用户失败');
  }
};

// 路由变化时验证身份
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath === '/manage/audit') {
      checkAuth();
    }
    setTabByRoute(newPath);
    // 当路由切换到当前页面时刷新数据
    if (newPath === '/manage/audit' && newPath !== oldPath) {
      getList();
    }
  },
  { immediate: true }
);

// 监听搜索关键词变化，重置分页
watch(
  () => keyword.value,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      page.value = 1;
    }
  }
);
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #F9FAFB;
  padding-bottom: 60px;
  box-sizing: border-box;
}

/* 主内容区域样式 */
.main-content {
  padding: 130px 15px 15px; /* 顶部留出更多空间 */
}

/* 页面标题和操作区 */
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.page-title {
  margin: 0;
  font-size: 38px;
  font-weight: 600;
  color: #333;
}

/* 搜索框样式 */
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
  gap: 8px;
  width: 100%;
  align-items: center;
}

:deep(.van-search) {
  flex: 1;
}

/* 用户列表样式 */
.user-list {
  display: flex;
  flex-direction: column;
  gap: 25px; /* 增大卡片之间的间距 */
  margin-bottom: 40px; /* 为分页留出空间 */
  min-height: 200px;
  justify-content: center;
  align-items: center;
}

/* 无数据和加载中样式 */
.no-data, .loading {
  text-align: center;
  padding: 40px 0;
  color: #666;
  font-size: 16px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

/* 分页容器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

:deep(.el-pagination) {
  text-align: center;
}

:deep(.el-pagination__total) {
  margin-right: 15px;
}

/* 用户卡片样式 - 进一步增大尺寸 */
.user-card {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 15px; /* 增大圆角 */
  padding: 30px 25px; /* 增大内边距 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
}

/* 卡片悬停效果 */
.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 头像样式 - 进一步增大尺寸 */
.user-avatar {
  margin-right: 25px; /* 增大与文字的间距 */
  flex-shrink: 0;
}

.avatar-img {
  width: 85px; /* 增大头像 */
  height: 85px;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

/* 默认头像样式 */
:deep(.default-avatar) {
  width: 85px;
  height: 85px;
  font-size: 40px;
  transition: transform 0.3s ease;
}

:deep(.default-detail-avatar) {
  width: 125px;
  height: 125px;
  font-size: 60px;
}

.user-card:hover :deep(.default-avatar) {
  transform: scale(1.05);
}

/* 用户信息样式 */
.user-info {
  flex: 1;
}

.user-main-info {
  margin-bottom: 15px; /* 增大间距 */
}

/* 用户名 - 进一步增大字体 */
.user-name {
  font-size: 29px; /* 增大字体 */
  font-weight: 500;
  margin: 0 0 10px 0;
  transition: color 0.3s ease;
}

.user-card:hover .user-name {
  color: #409EFF;
}

/* 邮箱 - 进一步增大字体 */
.user-accountNumber {
  color: #666;
  margin: 0;
  font-size: 23px; /* 增大字体 */
}

.user-meta {
  display: flex;
  gap: 20px; /* 增大间距 */
}

/* 角色和状态标签 - 进一步增大尺寸 */
.user-role, .user-status {
  font-size: 21px; /* 增大字体 */
  padding: 6px 15px; /* 增大内边距 */
  border-radius: 8px; /* 增大圆角 */
}

.role-admin {
  background-color: #E6F7FF;
  color: #1890FF;
}

.role-user {
  background-color: #F6FFED;
  color: #52C41A;
}

.status-active {
  background-color: #F6FFED;
  color: #52C41A;
}

.status-inactive {
  background-color: #FFF2F0;
  color: #F5222D;
}

/* 底部导航栏样式 */
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #F3F4F6;
  font-size: 16px;
  z-index: 5;
}

/* 按钮样式调整 */
:deep(.el-button) {
  padding: 14px 35px;
  font-size: 34px;
  border-radius: 10px;
}

/* 适配按钮大小 */
:deep(.el-button--small) {
  padding: 6px 12px;
  font-size: 14px;
}

/* 添加用户表单样式 */
.add-user-form {
  margin-top: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 15px;
}

/* 移动端弹窗样式优化 */
.mobile-dialog {
  --el-dialog-margin-top: 15px !important;
  --el-dialog-margin-bottom: 25px !important;
}

:deep(.el-dialog__header) {
  padding: 25px 25px 15px;
}

:deep(.el-dialog__body) {
  padding: 20px 25px;
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.el-dialog__footer) {
  padding: 15px 25px 25px;
}

:deep(.el-dialog__title) {
  font-size: 27px; /* 增大弹窗标题 */
  font-weight: 600;
}

/* 弹窗底部按钮样式 */
.dialog-footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 0;
  box-sizing: border-box;
}

.footer-btn {
  flex: 1;
  margin: 0 8px;
  padding: 12px 0;
  font-size: 23px; /* 增大弹窗按钮文字 */
}

.cancel-btn {
  background-color: #f5f7fa;
  color: #4e5969;
}

.confirm-btn {
  background-color: #409eff;
  color: #fff;
}

/* 用户详情弹窗样式 */
.user-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.detail-avatar {
  margin-bottom: 25px;
}

.detail-avatar-img {
  width: 125px; /* 增大详情头像 */
  height: 125px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f2f5;
}

.detail-info {
  width: 100%;
}

.detail-item {
  margin-bottom: 25px; /* 增大详情项间距 */
  padding-bottom: 25px;
  border-bottom: 1px solid #f0f2f5;
  color: #666;
  font-weight: 500;
  font-size: 27px; /* 进一步增大详情文字 */
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-value {
  color: #333;
  font-weight: normal;
  margin-left: 12px; /* 增大标签与值的间距 */
}

/* 详情弹窗底部按钮样式 */
.detail-footer {
  display: flex;
  gap: 12px;
  width: 100%;
}

.detail-footer .el-button{
  flex: 1;
  padding: 10px 0; /* 增大按钮内边距 */
  font-size: 30px; /* 增大按钮文字 */
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

/* 响应式设计 - 移动端优先 */
@media (min-width: 768px) {
  /* PC端样式 */
  .container {
    padding-bottom: 0;
  }
  
  .main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 80px; /* 调整顶部距离，因为搜索框已移至导航栏 */
    padding-bottom: 40px;
  }
  
  /* 隐藏移动端搜索框和底部导航，显示PC端导航 */
  .mobile-search, .mobile-tabbar {
    display: none;
  }
  
  .pc-nav {
    display: block;
  }
  
  /* PC端用户卡片网格布局 */
  .user-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
    justify-items: center;
  }
  
  .user-card {
    width: 100%;
    box-sizing: border-box;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .user-name {
    font-size: 18px;
  }
  
  .user-accountNumber {
    font-size: 14px;
  }
  
  .user-status {
    font-size: 14px;
    padding: 4px 10px;
  }
  
  .avatar-img {
    width: 60px;
    height: 60px;
  }
  
  :deep(.default-avatar) {
    width: 60px;
    height: 60px;
    font-size: 30px;
  }
  
  .detail-avatar-img {
    width: 100px;
    height: 100px;
  }
  
  :deep(.default-detail-avatar) {
    width: 100px;
    height: 100px;
    font-size: 50px;
  }
  
  .detail-item {
    font-size: 16px;
    margin-bottom: 15px;
    padding-bottom: 15px;
  }
  
  :deep(.el-dialog__title) {
    font-size: 20px;
  }
  
  :deep(.el-button) {
    padding: 8px 20px;
    font-size: 14px;
  }
  
  .detail-footer .el-button {
    font-size: 14px;
  }
  
  .footer-btn {
    font-size: 14px;
  }
}

@media (min-width: 1024px) {
  /* 大屏幕PC样式 */
  .user-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
