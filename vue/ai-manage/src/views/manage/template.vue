<template>
  <div class="container">
    <!-- 顶部搜索框 - 固定定位 -->
    <div class="search-container">
      <div class="search-wrapper">
        <van-search 
          v-model="keyword" 
          shape="round" 
          placeholder="请输入搜索关键词"
          @search="onSearch"
          @update:model-value="onInput"
          @keydown.enter="onSearch"
        />
        <el-button type="primary" class="search-btn" @click="onSearch">
          搜索
        </el-button>
      </div>
    </div>

    <!-- 底部导航 -->
    <van-tabbar v-model="activeTab" class="tabbar">
      <van-tabbar-item icon="edit" :active="activeTab === 0" @click="switchTab(0)">
        知识库
      </van-tabbar-item>
      <van-tabbar-item icon="notes-o" :active="activeTab === 1" @click="switchTab(1)">
        管理
      </van-tabbar-item>
      <van-tabbar-item icon="home-o" :active="activeTab === 2" @click="switchTab(2)">
        用户
      </van-tabbar-item>
      <van-tabbar-item icon="user-o" :active="activeTab === 3" @click="switchTab(3)">
        个人中心
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Tabbar, TabbarItem, Search } from 'vant';
import { ElButton } from 'element-plus';

// 状态管理
const activeTab = ref(1);
const keyword = ref(''); // 搜索框绑定的值
const router = useRouter();
const route = useRoute(); // 获取当前路由实例

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

// 监听路由变化 - 当从其他页面进入当前页面时触发
watch(
  () => route.path,
  (newPath) => {
    setTabByRoute(newPath);
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
  // 搜索功能保留但简化
  console.log('搜索关键词:', keyword.value);
};

// 输入框内容变化处理
const onInput = (value) => {
  keyword.value = value;
};
</script>

<style scoped>
/* 仅保留与顶部和底部导航相关的样式 */
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

/* 搜索框和按钮容器 */
.search-wrapper {
  display: flex;
  gap: 1px;
  width: 100%;
  align-items: center;
}

/* 搜索框样式调整 */
:deep(.van-search) {
  flex: 1;
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

:deep(.el-button) {
  padding: 12px 30px;
  font-size: 32px;
  border-radius: 8px;
}
</style>
