<template>
  <div class="container">
    <!-- PC端顶部导航 - 仅在PC端显示 -->
    <div class="pc-nav" v-if="!isMobile">
      <div class="pc-nav-container">
        <div class="logo">知识库管理系统</div>
        
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

    <div class="personal-center">
      <!-- 个人信息卡片 -->
      <el-card class="info-card">
        <div class="bg-gradient"></div>
        <div class="info-content">
          <!-- 头像区域 - 水平居中 -->
          <div class="avatar-section">
            <el-avatar 
              :size="isMobile ? 96 : 120"
              :src="userInfo.userPic"
              @click="showAvatarDialog"
              class="user-avatar"
            />
            <el-button
              class="change-avatar-btn"
              circle
              size="small"
              @click="showAvatarDialog"
            >
              <el-icon><Camera /></el-icon>
            </el-button>
          </div>
          
          <!-- 名字和信息区域 -->
          <div class="personal-details">
            <!-- 名字区域 -->
            <div class="basic-info">
              <h1>{{ userInfo.username }}</h1>
            </div>

            <!-- 账号和邮箱区域 -->
            <div class="detail-info">
              <div class="info-item">
                <el-icon class="info-icon"><User /></el-icon>
                <div class="info-text">
                  <div class="label">账号</div>
                  <div class="value">{{ userInfo.accountNumber }}</div>
                </div>
              </div>
              
              <div class="info-item">
                <el-icon class="info-icon"><Message /></el-icon>
                <div class="info-text">
                  <div class="label">电子邮箱</div>
                  <div class="value">{{ userInfo.email || '未设置' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 功能卡片区 -->
      <div class="function-cards">
        <el-card class="function-card" @click="showEditDialog">
          <div class="card-content">
            <div class="icon-wrapper">
              <el-icon class="feature-icon"><User /></el-icon>
            </div>
            <div class="text-wrapper">
              <h3>编辑个人信息</h3>
              <p>更新您的联系信息</p>
            </div>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </div>
        </el-card>

        <el-card class="function-card" @click="showPasswordDialog">
          <div class="card-content">
            <div class="icon-wrapper">
              <el-icon class="feature-icon"><Lock /></el-icon>
            </div>
            <div class="text-wrapper">
              <h3>修改密码</h3>
              <p>更新您的账户密码</p>
            </div>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </div>
        </el-card>

        <el-card class="function-card logout-card" @click="showLogoutConfirm">
          <div class="card-content">
            <div class="icon-wrapper warning">
              <el-icon class="feature-icon"><SwitchButton /></el-icon>
            </div>
            <div class="text-wrapper">
              <h3>退出登录</h3>
              <p>安全退出当前账号</p>
            </div>
            <el-icon class="arrow-icon warning"><ArrowRight /></el-icon>
          </div>
        </el-card>
      </div>

      <!-- 编辑信息对话框 -->
      <el-dialog
        v-model="editDialogVisible"
        title="编辑个人信息"
        :width="isMobile ? '90%' : '620px'" 
        :close-on-click-modal="false"
        class="custom-dialog form-dialog" 
        align-center
      >
        <el-scrollbar>
          <div class="dialog-content">
            <el-form 
              ref="editFormRef"
              :model="editForm"
              :rules="editRules"
              label-width="100px" 
              class="form-layout"
            >
              <el-form-item label="姓名" prop="username">
                <el-input v-model="editForm.username" placeholder="请输入姓名" class="wide-input" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email" placeholder="请输入邮箱" class="wide-input" />
              </el-form-item>
              <div class="form-spacer"></div>
            </el-form>
          </div>
        </el-scrollbar>
        <template #footer>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm">保存修改</el-button>
        </template>
      </el-dialog>

      <!-- 修改密码对话框 -->
      <el-dialog
        v-model="passwordDialogVisible"
        title="修改密码"
        :width="isMobile ? '90%' : '620px'"  
        :close-on-click-modal="false"
        class="custom-dialog password-dialog"
        align-center
      >
        <el-scrollbar>
          <div class="dialog-content">
            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="100px"
              class="form-layout"
            >
              <el-form-item label="当前密码" prop="currentPassword">
                <el-input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  placeholder="请输入当前密码"
                  show-password
                  class="wide-input"
                />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  show-password
                  class="wide-input"
                />
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                  class="wide-input"
                />
              </el-form-item>
            </el-form>
          </div>
        </el-scrollbar>
        <template #footer>
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPasswordForm">确认修改</el-button>
        </template>
      </el-dialog>

      <!-- 更换头像对话框 -->
      <el-dialog
        v-model="avatarDialogVisible"
        title="更换头像"
        :width="isMobile ? '90%' : '500px'"
        :close-on-click-modal="false"
        class="custom-dialog"
        align-center
      >
        <div class="avatar-upload-content">
          <el-avatar
            :size="120"
            :src="previewAvatar || userInfo.userPic"
            class="preview-avatar"
          />
          <p class="upload-tip">支持JPG、PNG格式，建议尺寸200x200像素，大小不超过5MB</p>
           
          <el-upload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
            accept="image/*"  
          >
            <el-button type="primary">选择图片</el-button>
          </el-upload>
          
          <!-- 加载状态 -->
          <el-loading 
            v-if="isUploading" 
            text="上传中..." 
            :fullscreen="false"
            class="upload-loading"
          />
        </div>
        <template #footer>
          <el-button @click="avatarDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="submitAvatarChange"
            :disabled="!previewAvatar || isUploading"
          >
            确认更换
          </el-button>
        </template>
      </el-dialog>
    </div>

    <!-- 底部导航 - 仅在移动端显示 -->
    <van-tabbar v-model="activeTab" class="tabbar" v-if="isMobile">
      <van-tabbar-item 
        icon="edit" 
        :active="activeTab === 0" 
        @click="switchTab(0)"
        :name="0"
      >
        知识库
      </van-tabbar-item>
      <van-tabbar-item 
        v-if="role === 1" 
        icon="notes-o" 
        :active="activeTab === 1" 
        @click="switchTab(1)"
        :name="1"
      >
        管理
      </van-tabbar-item>
      <van-tabbar-item 
        v-if="role === 1" 
        icon="home-o" 
        :active="activeTab === 2" 
        @click="switchTab(2)"
        :name="2"
      >
        用户
      </van-tabbar-item>
      <van-tabbar-item 
        icon="user-o" 
        :active="activeTab === 3" 
        @click="switchTab(3)"
        :name="3"
        class="personal-tab"
      >
        个人中心
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { User, Lock, Mobile, Message, Camera, ArrowRight, SwitchButton } from '@element-plus/icons-vue'
import { Tabbar, TabbarItem } from 'vant';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '../../stores/pinia';
import { 
  logoutAPI, 
  getUserInfoAPI, 
  UpdateUserNameAndEmailAPI, 
  UpdatePasswordAPI, 
  UpdateUserAvatarAPI,
  uploadFileAPI  // 导入上传文件API
} from '@/api';

// 底部导航相关
const activeTab = ref(3); // 默认选中个人中心
const router = useRouter();
const route = useRoute(); // 获取当前路由实例
const userStore = useUserStore();
const role = computed(() => {
  return userStore.userInfo?.role ?? 0; // 1：管理员 0：普通用户，默认普通用户
});

// 路由路径与tab索引的映射关系
const routeTabMap = {
  '/manage/databaseManage': 0,
  '/manage/apply': 1,
  '/manage/audit': 2,
  '/manage/personalCenter': 3
};

// 根据路由设置activeTab
const setTabByRoute = (path) => {
  activeTab.value = routeTabMap[path] ?? 3;
};

// 用户信息 - 使用响应式对象
const userInfo = reactive({
  username: '',
  accountNumber: '',
  email: '',
  userPic: ''
})

// 默认用户信息
const defaultUserInfo = {
  username: '张三',
  accountNumber: '138****6789',
  email: 'zhangs***@example.com',
  userPic: 'https://picsum.photos/id/64/120/120'
}


// 初始化用户信息 - 直接从store获取
const initUserInfo = () => {
  const storeUserInfo = userStore.userInfo;
  if (storeUserInfo && Object.keys(storeUserInfo).length > 0) {
    Object.assign(userInfo, storeUserInfo);
  } else {
    Object.assign(userInfo, defaultUserInfo);
  }
}

// 编辑表单相关
const editDialogVisible = ref(false)
const editFormRef = ref()
const editForm = reactive({
  username: '',
  email: ''
})

const editRules = {
  username: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  accountNumber: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 密码表单相关
const passwordDialogVisible = ref(false)
const passwordFormRef = ref()
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordRules = {
  currentPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 头像相关
const avatarDialogVisible = ref(false)
const previewAvatar = ref('')
const isUploading = ref(false)  // 上传状态

// 响应式判断是否为移动设备
const isMobile = ref(window.innerWidth <= 768)

// 组件挂载时初始化
onMounted(() => {
  setTabByRoute(route.path);
  
  // 只有在当前页面才初始化用户信息
  if (route.path === '/manage/personalCenter') {
    initUserInfo();
  }
  
  window.addEventListener('resize', handleResize)
});

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    setTabByRoute(newPath);
    // 路由切换到当前页面时初始化用户信息
    if (newPath === '/manage/personalCenter') {
      initUserInfo();
    }
  }
);

// 监听store中用户信息的变化，实时更新界面
watch(
  () => userStore.userInfo,
  (newUserInfo) => {
    if (newUserInfo && Object.keys(newUserInfo).length > 0) {
      Object.assign(userInfo, newUserInfo);
    } else {
      Object.assign(userInfo, defaultUserInfo);
    }
  },
  { deep: true, immediate: true }
);

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 处理窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

// 方法定义
const showEditDialog = () => {
  Object.assign(editForm, userInfo)
  editDialogVisible.value = true
}

const submitEditForm = async () => {
  if (!editFormRef.value) return
   await UpdateUserNameAndEmailAPI({
    username: editForm.username,
    email: editForm.email
  })
  .then(res => {
    if (res.data.code === 0) {
      //刷新用户信息
      getUserInfoAPI().then(res => {
        if (res.data.code === 0) {
          userStore.setUserInfo(res.data.data)
        }
      })
      editDialogVisible.value = false
      ElMessage.success('个人信息更新成功')
    }
    if (res.data.code === 1) {
      ElMessage.error(res.data.msg || '个人信息更新失败')
    }
  })
}

const showPasswordDialog = () => {
  passwordDialogVisible.value = true
  // 重置密码表单
  if (passwordFormRef.value) {
    passwordFormRef.value.resetFields()
  }
}

const submitPasswordForm = async () => {
  if (!passwordFormRef.value) return
  await UpdatePasswordAPI({
    oldpassword: passwordForm.currentPassword,
    newpassword: passwordForm.newPassword,
    repassword: passwordForm.confirmPassword
  })
  .then(res => {
    if (res.data.code === 0) {
      passwordDialogVisible.value = false
      ElMessage.success('密码修改成功')
      passwordFormRef.value.resetFields()
      // 退出登录
     logoutAPI().then(() => {
        // 退出成功后，清除用户信息
        userStore.logout();
        ElMessage.success('请重新登录')
        // 重置为默认信息
        Object.assign(userInfo, defaultUserInfo);
      }).then(() => {
        // 退出成功后，跳转到登录页
        router.push('/login');
      })
    }
    if (res.data.code === 1) {
      ElMessage.error(res.data.msg || '密码修改失败')
    }
  })
  .catch(err => {
    ElMessage.error(err.message || '密码修改失败')
  })
}

const showAvatarDialog = () => {
  previewAvatar.value = ''
  avatarDialogVisible.value = true
}

// 选择图片后自动上传，添加了文件类型和大小检查
const handleAvatarChange = async (file) => {
  // 检查文件类型
  const isImage = file.raw.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片格式的文件');
    return;
  }
  
  // 检查文件大小 (5MB = 5 * 1024 * 1024 bytes)
  const isLt5M = file.raw.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过5MB');
    return;
  }
  
  try {
    // 显示上传状态
    isUploading.value = true
    
    // 调用上传文件API
    const response = await uploadFileAPI(file.raw)
    
    // 假设API返回格式为 { data: { url: "图片URL" } }
    if (response.data && response.data.data) {
      // 使用返回的URL作为预览图
      previewAvatar.value = response.data.data
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error('上传失败，未获取到图片URL')
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    ElMessage.error('图片上传失败，请重试')
  } finally {
    // 隐藏上传状态
    isUploading.value = false
  }
}

const selectDefaultAvatar = (avatar) => {
  previewAvatar.value = avatar
}

// 提交时只需要更新用户头像信息，不需要再次上传
const submitAvatarChange = () => {
  if (previewAvatar.value) {
    // 调用更新头像API，使用上传返回的URL
    UpdateUserAvatarAPI({
      userPic: previewAvatar.value
    }).then(res => {
      if (res.data.code === 0) {
        // 刷新用户信息
        getUserInfoAPI().then(res => {
          if (res.data.code === 0) {
            userStore.setUserInfo(res.data.data)
          }
        })
        avatarDialogVisible.value = false
        ElMessage.success('头像更新成功')
      }
    })
  }
}

const showLogoutConfirm = () => {
  ElMessageBox.confirm(
    '您将退出当前账号，需要重新登录才能继续使用',
    '确认退出登录？',
    {
      confirmButtonText: '确认退出',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      // 退出登录
      logoutAPI().then(() => {
        // 退出成功后，清除用户信息
        userStore.logout();
        ElMessage.success('已成功退出登录')
        // 重置为默认信息
        Object.assign(userInfo, defaultUserInfo);
      }).then(() => {
        // 退出成功后，跳转到登录页
        router.push('/login');
      })
    })
    .catch(() => {
      // 用户点击取消按钮时，不做任何操作
    })
}

// 切换导航的方法
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
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #F9FAFB;
  padding-bottom: 50px; /* 为底部导航留出空间 */
  box-sizing: border-box;
}

.personal-center {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.info-card {
  margin-bottom: 20px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.info-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.bg-gradient {
  height: 96px;
  background: linear-gradient(90deg, #165DFF 0%, #1890FF 100%);
  margin: -20px -20px 0;
}

.info-content {
  margin-top: -48px;
  padding: 0 20px 20px;
  text-align: center; /* 让内容区域整体水平居中 */
}

.avatar-section {
  position: relative;
  display: inline-block; /* 保持为 inline-block 以便居中 */
  margin: 0 auto; /* 水平居中 */
}

.user-avatar {
  border: 4px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.change-avatar-btn {
  position: absolute;
  right: 0;
  bottom: 0;
  background: var(--el-color-primary);
  color: white;
  border: 2px solid #fff;
}

.basic-info {
  margin-top: 16px;
  text-align: center; /* 名字水平居中 */
}

.basic-info h1 {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin: 0; /* 移除默认外边距，确保居中效果 */
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
  align-items: center; /* 信息项水平居中 */
}

.info-item {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px; /* 限制最大宽度，避免在宽屏上拉得太开 */
}

.info-icon {
  padding: 12px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 20px;
  margin-right: 16px;
  flex-shrink: 0; /* 防止图标被压缩 */
}

.info-text .label {
  color: var(--el-text-color-secondary);
  text-align: left;
  font-size: 16px;
  margin-bottom: 4px;
}

.info-text .value {
  font-size: 33px;
  color: var(--el-text-color-primary);
}

.function-cards {
  display: grid;
  grid-template-columns: 1fr; /* 移动端单列布局 */
  gap: 15px; /* 移动端间距 */
}

.function-card {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
}

.function-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 8px;
}

.icon-wrapper {
  padding: 12px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  margin-right: 16px;
}

.warning {
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
}

.feature-icon {
  font-size: 20px;
  color: var(--el-color-primary);
}

.warning .feature-icon {
  color: var(--el-color-danger);
}

.text-wrapper h3 {
  font-size: 33px;
  margin-bottom: 4px;
  color: var(--el-text-color-primary);
}

.text-wrapper p {
  color: var(--el-text-color-secondary);
  font-size: 24px;
}

.arrow-icon {
  margin-left: auto;
  color: var(--el-text-color-secondary);
  transition: transform 0.3s;
}

.function-card:hover .arrow-icon {
  transform: translateX(4px);
}

.avatar-upload-content {
  text-align: center;
  position: relative; /* 为加载状态提供定位上下文 */
}

.preview-avatar {
  margin-bottom: 16px;
}

.upload-tip {
  color: var(--el-text-color-secondary);
  font-size: 20px;
  margin-bottom: 16px;
}

.avatar-uploader {
  margin-bottom: 20px;
}

.avatar-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.avatar-item {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.avatar-item:hover {
  border-color: var(--el-color-primary-light-5);
}

.avatar-item.active {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-5);
}

.avatar-thumb {
  width: 100%;
  height: auto;
  border-radius: 4px;
  aspect-ratio: 1/1;
  object-fit: cover;
}

/* 底部导航样式 - 仅移动端显示 */
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid #F3F4F6;
  font-size: 15px;
  z-index: 100; /* 确保导航在最上层 */
}

/* 为个人中心标签添加激活样式 */
:deep(.van-tabbar-item--active.personal-tab) {
  color: #165DFF !important;
}

/* 弹窗样式优化 */
:deep(.custom-dialog) {
  display: flex;
  flex-direction: column;
  margin: 0 auto !important;
  max-width: calc(100% - 20px);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 101; /* 确保弹窗在导航上方 */
}

/* 表单类弹窗统一样式 */
:deep(.form-dialog),
:deep(.password-dialog) {
  width: 620px !important;
  max-width: 90%;
}

/* 内容区域优化 */
:deep(.custom-dialog .el-dialog__body) {
  padding: 0;
  overflow: hidden;
}

.dialog-content {
  padding: 16px;
}

/* 表单布局优化 */
.form-layout {
  --el-form-item-margin-bottom: 16px;
}

:deep(.form-dialog .el-form-item),
:deep(.password-dialog .el-form-item) {
  margin-bottom: 16px !important;
}

/* 增大输入框宽度 */
.wide-input {
  width: 100%;
  max-width: 400px;
}

.form-spacer {
  height: 32px;
}

/* 确保验证提示不被遮挡 */
:deep(.el-form-item__error) {
  position: static;
  margin-top: 4px;
  white-space: normal;
}

:deep(.el-form-item__content) {
  min-height: auto;
}

/* 弹窗头部和底部样式 */
:deep(.custom-dialog .el-dialog__header) {
  margin-right: 0;
  padding: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.custom-dialog .el-dialog__footer) {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: 0;
}

/* 上传加载状态样式 */
.upload-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* 滚动条样式 */
:deep(.el-scrollbar__wrap) {
  margin-bottom: 0 !important;
}

:deep(.el-scrollbar__view) {
  padding-bottom: 0;
}

/* 移动端优化 */
@media screen and (max-width: 768px) {
  .info-item {
    padding-left: 0;
    max-width: 100%;
  }
  
  :deep(.el-form-item__label) {
    padding-bottom: 4px;
  }
  
  .dialog-content {
    padding: 12px;
  }
  
  :deep(.custom-dialog .el-dialog__header) {
    padding: 12px;
  }
  
  :deep(.custom-dialog .el-dialog__footer) {
    padding: 10px 12px;
  }
  
  :deep(.el-dialog__footer .el-button) {
    padding: 8px 16px;
  }
  
  .wide-input {
    max-width: 100%;
  }
}

/* PC端样式 */
@media screen and (min-width: 768px) {
  .container {
    padding-bottom: 0;
  }
  
  .personal-center {
    padding-top: 80px; /* 为顶部导航留出空间 */
    padding-bottom: 40px;
  }
  
  /* PC端顶部导航 */
  .pc-nav {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    z-index: 100;
  }
  
  .pc-nav-container {
    display: flex;
    align-items: center;
    max-width: 1200px;
    height: 100%;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .logo {
    font-size: 18px;
    font-weight: bold;
    color: #2563EB;
    margin-right: 40px;
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
    transition: color 0.2s;
  }
  
  .nav-item:hover {
    color: #2563EB;
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
  
  /* 个人信息卡片PC端布局 */
  .info-card {
    margin-bottom: 30px;
  }
  
  .info-content {
    flex-direction: row;
    align-items: flex-start;
    padding: 0 30px 30px;
    text-align: left;
    display: flex;
  }
  
  .avatar-section {
    margin-right: 30px;
    margin-bottom: 0;
    margin-top: 10px;
  }
  
  .personal-details {
    flex: 1;
    min-width: 0; /* 防止内容溢出 */
  }
  
  .basic-info {
    margin-bottom: 30px;
    margin-top: 15px;
    text-align: left;
  }
  
  .basic-info h1 {
    font-size: 28px;
  }
  
  /* 优化账号和邮箱区域布局 */
  .detail-info {
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 40px;
    margin-top: 15px;
  }
  
  .info-item {
    flex: 1;
    min-width: 200px;
    max-width: none;
  }
  
  .info-text .label {
    font-size: 14px;
  }
  
  .info-text .value {
    font-size: 16px;
  }
  
  /* 功能卡片PC端布局 */
  .function-cards {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  .logout-card {
    grid-column: auto; /* PC端所有卡片按3列布局 */
  }
  
  .card-content {
    padding: 16px;
  }
  
  .text-wrapper h3 {
    font-size: 16px;
  }
  
  .text-wrapper p {
    font-size: 14px;
  }
  
  .upload-tip {
    font-size: 14px;
  }
}

/* 大屏幕PC样式优化 */
@media screen and (min-width: 1024px) {
  .info-card {
    margin-bottom: 40px;
  }
  
  .detail-info {
    gap: 60px;
  }
  
  .info-icon {
    font-size: 24px;
  }
  
  .text-wrapper h3 {
    font-size: 18px;
  }
}
</style>
