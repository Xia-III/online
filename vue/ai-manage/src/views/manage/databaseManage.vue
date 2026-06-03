<template>
  <div class="container">
    <!-- 顶部搜索框 - 仅在移动端显示 -->
    <div class="search-container mobile-search">
      <div class="search-wrapper">
        <van-search 
          v-model="keyword" 
          shape="round" 
          placeholder="请输入搜索关键词"
          @search="onSearch"
          @update:model-value="onInput"
        />
        <el-button type="primary" class="search-btn" @click="onSearch">
          搜索
        </el-button>
      </div>
    </div>
    
    <!-- 主内容区 -->
    <div class="content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>知识库</h1>
        <p>管理和访问您的所有知识库</p>
      </div>
      
      <!-- 知识库列表 - 使用v-for动态渲染 -->
      <div class="knowledge-list">
        <div 
          class="knowledge-card" 
          v-for="(knowledge, index) in datasetsList" 
          :key="knowledge.datasetsId"
          @click="goToKnowledge(knowledge.datasetsId)"
        >
          <div class="card-icon" :style="{ backgroundColor: getBackgroundColor(index) }">
            <van-icon name="book" :color="getIconColor(index)" size="50" />
          </div>
          <div class="card-info">
            <h3>{{ knowledge.name }}</h3>
            <p>{{ knowledge.document_count }}个文档</p>
          </div>
          <van-icon name="arrow-right" color="#9CA3AF" size="32" />
        </div>
      </div>
      
      <!-- 分页控件 -->
      <div class="pagination-container">
        <el-pagination 
          :page-size="pageSize" 
          :current-page="currentPage" 
          :pager-count="5" 
          layout="prev, pager, next" 
          :total="total"
          @current-change="handlePageChange"
        />
      </div>
      
      <!-- 添加新知识库按钮 -->
      <!-- <div class="add-button" @click="goToApplyNew">
        <van-icon name="plus" color="#2563EB" size="36" />
        <span>申请新知识库</span>
      </div> -->
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
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Tabbar, TabbarItem, Search, Icon } from 'vant';
import { ElButton, ElPagination } from 'element-plus';
import { getManageDatasetsListAPI, getKnowledgeDetailAPI, getDatasetListAPI } from '@/api';
import { useUserStore } from '../../stores/pinia';

// 状态管理
const activeTab = ref(0);
const keyword = ref(''); // 搜索框绑定的值
const router = useRouter();
const route = useRoute(); // 获取当前路由实例
const total = ref(0);
const userStore = useUserStore();

// 【关键修复】使用computed监听用户角色变化，确保获取最新值
const role = computed(() => {
  return userStore.userInfo?.role ?? 0; // 1：管理员 0：普通用户，默认普通用户
});

// 分页相关配置
const currentPage = ref(1);
const pageSize = ref(5); // 每页显示4条数据

// 固定颜色顺序 - 按索引循环使用这些颜色
const colorPalette = [
  { icon: '#2563EB', background: '#DBEAFE' },  // 蓝色
  { icon: '#10B981', background: '#D1FAE5' },  // 绿色
  { icon: '#8B5CF6', background: '#EDE9FE' },  // 紫色
  { icon: '#F59E0B', background: '#FEF3C7' },  // 黄色
  { icon: '#EF4444', background: '#FEE2E2' }   // 红色
];
const datasetsList = ref([
    {
      "datasetsId": "e8a403a6-9bb1-485c-8ee8-91ac86bf3a31"
    }
]);

// 防止重复请求的锁
const isLoading = ref(false);

// 获取知识库列表数据
const getDatasetsList = async () => {
  // 如果正在加载中，直接返回
  if (isLoading.value) return;
  
  try {
    isLoading.value = true;
    let res;
    
    // 使用computed属性的.value获取最新角色值
    if (role.value === 1) {
      res = await getDatasetListAPI({
        page: currentPage.value,
        limit: pageSize.value,
        keyword: keyword.value
      });
      if (res.data && res.status === 200) {
        datasetsList.value = res.data.data;
        total.value = res.data.total;
        for (let i = 0; i < datasetsList.value.length; i++) {
          const element = datasetsList.value[i];
          element.datasetsId = element.id;
        }
      }
    } else {
      res = await getManageDatasetsListAPI({
        page: currentPage.value,
        size: pageSize.value,
        keyword: keyword.value
      });
      if (res.data && res.data.code === 0) {
        datasetsList.value = res.data.data;
        total.value = res.data.total;
        
        // 获取每个知识库的详细信息
        for (let i = 0; i < datasetsList.value.length; i++) {
          const element = datasetsList.value[i];
          try {
            const detailRes = await getKnowledgeDetailAPI(element.datasetsId);
            if (detailRes.data && detailRes.status === 200) {
              element.name = detailRes.data.name;
              console.log(detailRes.data.document_count);
              element.document_count = detailRes.data.document_count;
            }
          } catch (error) {
            console.error('获取知识库详情失败:', error);
          }
        }
      }
    }
  } finally {
    isLoading.value = false;
  }
}

// 页面初始化时加载数据
onMounted(() => {
  // 初始加载数据
  if (route.path === '/manage/databaseManage') {
    getDatasetsList();
  }
});

// 【新增】监听用户信息变化，重新加载数据
watch(
  () => userStore.userInfo,
  (newUserInfo, oldUserInfo) => {
    // 当用户信息变化（如重新登录）且当前在知识库页面时，重新加载数据
    if (
      route.path === '/manage/databaseManage' && 
      newUserInfo?.role !== oldUserInfo?.role
    ) {
      currentPage.value = 1;
      getDatasetsList();
    }
  },
  { deep: true }
);

// 根据索引获取图标颜色
const getIconColor = (index) => {
  return colorPalette[index % colorPalette.length].icon;
};

// 根据索引获取背景颜色
const getBackgroundColor = (index) => {
  return colorPalette[index % colorPalette.length].background;
};

// 分页切换事件
const handlePageChange = (page) => {
  currentPage.value = page;
  window.scrollTo(0, 0);
  getDatasetsList(); // 分页切换时重新加载数据
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
  activeTab.value = routeTabMap[path] ?? 0;
};

// 监听路由变化，每次进入当前页面时重新加载数据
watch(
  () => route.path,
  (newPath) => {
    setTabByRoute(newPath);
    // 当路由切换到当前页面时重新加载数据
    if (newPath === '/manage/databaseManage') {
      currentPage.value = 1;
      getDatasetsList();
    }
  },
  { immediate: true }
);

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
  currentPage.value = 1;
  getDatasetsList(); // 搜索时重新加载数据
};

// 输入框内容变化处理
const onInput = (value) => {
  keyword.value = value;
};

// 进入知识库
const goToKnowledge = (datasetsId) => {
  router.push({
    path: `/manage/knowledge/${datasetsId}`
  })
}

// 申请新知识库
const goToApplyNew = () => {
  router.push('/manage/apply');
};
</script>

<style scoped>
/* 基础样式 */
.container {
  min-height: 100vh;
  background-color: #F9FAFB;
  padding-bottom: 60px;
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

.content {
  padding: 24px;
  padding-top: 115px;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 36px;
}

.page-header h1 {
  font-size: 55px;
  font-weight: bold;
  color: #1F2937;
  margin-bottom: 6px;
}

.page-header p {
  font-size: 33px;
  color: #6B7280;
}

.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 12px;
}

.knowledge-card {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
}

.knowledge-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.card-icon {
  width: 100px;
  height: 100px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30px;
}

.card-info {
  flex: 1;
}

.card-info h3 {
  font-size: 32px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 10px;
}

.card-info p {
  font-size: 24px;
  color: #6B7280;
}

.add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 3px dashed #93C5FD;
  color: #2563EB;
  border-radius: 20px;
  padding: 30px;
  font-size: 28px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 12px;
}

.add-button:hover {
  border-color: #2563EB;
  background-color: #EFF6FF;
}

.add-button span {
  margin-left: 15px;
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

:deep(.el-button) {
  padding: 12px 30px;
  font-size: 32px;
  border-radius: 8px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin: 5px 0;
}

:deep(.el-pagination) {
  display: inline-flex;
  align-items: center;
  font-size: 20px;
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
  
  .content {
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 80px; /* 调整顶部距离，因为搜索框已移至导航栏 */
    padding-bottom: 40px;
  }
  
  /* 隐藏移动端搜索框，显示PC端导航 */
  .mobile-search {
    display: none;
  }
  
  .pc-nav {
    display: block;
  }
  
  .mobile-tabbar {
    display: none;
  }
  
  .knowledge-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
  
  .page-header h1 {
    font-size: 32px;
  }
  
  .page-header p {
    font-size: 16px;
  }
  
  .card-icon {
    width: 80px;
    height: 80px;
    margin-right: 20px;
  }
  
  .card-info h3 {
    font-size: 18px;
    margin-bottom: 5px;
  }
  
  .card-info p {
    font-size: 14px;
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
}

@media (min-width: 1024px) {
  /* 大屏幕PC样式 */
  .knowledge-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
