<template>
  <view class="feature-container">
    <!-- 时间范围选择 -->
    <view class="time-range-selector">
      <picker @change="onTimeRangeChange" :value="selectedTimeRange" :range="timeRanges">
        <view class="picker-view">
          <text class="picker-text">{{ timeRanges[selectedTimeRange] }}</text>
          <text class="arrow">▼</text>
        </view>
      </picker>
    </view>

    <!-- 全部解码数显示 -->
    <view class="total-masked-count">
      <text class="total-count-text">全部解码数: {{ totalMaskedCount }}</text>
    </view>

    <!-- 历史记录列表 -->
    <view class="history-list" v-if="historyRecords && historyRecords.length > 0">
      <view
        class="history-card"
        v-for="record in historyRecords"
        :key="record.id"
      >
        <view class="record-info">
          <text class="record-code">{{ record.code }}</text>
        </view>
        <view class="record-time">
          <text class="date-part">{{ formatDate(record.time).date }}</text> <text class="time-part">{{ formatDate(record.time).time }}</text>
        </view>
      </view>
    </view>
    <view v-else class="no-history">
      <text class="no-history-text">暂无历史记录</text>
    </view>

    <!-- 底部导航栏 -->
    <view class="tab-bar">
      <!-- 角色1: 解码、历史、个人 -->
      <block v-if="currentUserRole === 1">
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'decode' }"
          @click="switchTab('decode')"
        >
          <text class="tab-text">解码</text>
        </view>
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'history' }"
          @click="switchTab('history')"
        >
          <text class="tab-text">历史</text>
        </view>
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'profile' }"
          @click="switchTab('profile')"
        >
          <text class="tab-text">个人</text>
        </view>
      </block>

      <!-- 角色2: 解码、管理、历史、个人 -->
      <block v-else-if="currentUserRole === 2"> 
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'decode' }"
          @click="switchTab('decode')"
        >
          <text class="tab-text">解码</text>
        </view>
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'history' }"
          @click="switchTab('history')"
        >
          <text class="tab-text">历史</text>
        </view>
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'manage' }"
          @click="switchTab('manage')"
        >
          <text class="tab-text">管理</text>
        </view>
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'profile' }"
          @click="switchTab('profile')"
        >
          <text class="tab-text">个人</text>
        </view>
      </block>

      <!-- 角色3: 解码、管理、历史、个人 -->
      <block v-else-if="currentUserRole === 3">
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'decode' }"
          @click="switchTab('decode')"
        >
          <text class="tab-text">解码</text>
        </view>
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'history' }"
          @click="switchTab('history')"
        >
          <text class="tab-text">历史</text>
        </view>
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'manage' }"
          @click="switchTab('manage')"
        >
          <text class="tab-text">管理</text>
        </view>
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'profile' }"
          @click="switchTab('profile')"
        >
          <text class="tab-text">个人</text>
        </view>
      </block>

      <!-- 默认情况：显示加载状态 -->
      <block v-else>
        <view class="tab-bar-item">
          <text class="tab-text">加载中...</text>
        </view>
      </block>
    </view>
  </view>
</template>

<script>
import { post } from '@/utils/request.js';

export default {
  data() {
    return {
      activeTab: 'history', // 默认激活历史标签
      currentUserRole: null, // 当前用户角色
      totalMaskedCount: 0,  // 全部解码数
      selectedTimeRange: 0, // 选中的时间范围，默认为全部(索引0)
      historyRecords: [],   // 历史记录
      timeRanges: ['全部', '今天', '过去7天', '过去30天'], // 时间范围选项
      isLoading: false // 是否正在加载数据
    }
  },
  onLoad() {
    // 页面加载时获取当前用户角色
    this.getCurrentUserRole();
  },

  onShow() {
    // 页面每次显示时都更新全部解码数
    this.fetchTotalMaskedCount();
  },

  methods: {
    getCurrentUserRole() {
      // 从本地存储获取用户信息或token，然后获取角色
      // 这里假设用户信息存储在本地存储中
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo && userInfo.role) {
        this.currentUserRole = userInfo.role;
      } else {
        // 如果本地没有存储用户信息，可能需要从API获取
        // 这里可以调用获取用户信息的API
        this.fetchUserInfo();
      }
    },
    async fetchUserInfo() {
      try {
        // 这里应该调用获取用户信息的API
        // 模拟获取用户信息
        const token = uni.getStorageSync('token');
        if (token) {
          // 假设有一个获取用户信息的API
          // const response = await get('/api/User/Info');
          // this.currentUserRole = response.data.role;

          // 由于没有具体API，暂时模拟获取角色
          // 实际项目中应替换为真实的API调用
          console.log('获取用户信息...');
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    },
    switchTab(tabName) {
      this.activeTab = tabName;

      if (tabName === 'profile') {
        // 跳转到个人资料页面
        uni.redirectTo({
          url: '/pages/main/profile'
        });
      } else if (tabName === 'decode') {
        // 解码页面跳转到role1页面
        uni.redirectTo({
          url: '/pages/main/role1'
        });
      } else if (tabName === 'manage') {
        // 管理页面根据用户角色跳转
        if (this.currentUserRole) {
          if (this.currentUserRole === 3) {
            uni.redirectTo({
              url: '/pages/main/role3'
            });
          } else if (this.currentUserRole === 2) {
            uni.redirectTo({
              url: '/pages/main/role2'
            });
          } else {
            // 角色1没有管理页面
            uni.showToast({
              title: '权限不足',
              icon: 'none'
            });
          }
        } else {
          uni.showToast({
            title: '正在加载用户信息...',
            icon: 'none'
          });
        }
      } else if (tabName === 'history') {
        // 当前就是历史页面，无需跳转
        return;
      }
    },

    formatDate(dateString) {
      // 格式化日期
      if (!dateString) return { date: '', time: '' };
      const date = new Date(dateString);

      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return { date: dateString, time: '' }; // 如果日期无效，返回原始字符串
      }

      // 格式化为 YYYY/M/D H:mm:ss 格式，其中时分秒为蓝色
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 月份从0开始，需要+1
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();

      const datePart = `${year}/${month}/${day}`;
      const timePart = `${hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

      return { date: datePart, time: timePart };
    },

    onTimeRangeChange(e) {
      this.selectedTimeRange = parseInt(e.detail.value);
      // 根据选中的时间范围更新解码数
      this.fetchTotalMaskedCount();
    },

    async fetchTotalMaskedCount() {
      // 防止重复请求
      if (this.isLoading) return;

      this.isLoading = true;
      uni.showLoading({
        title: '加载中...'
      });

      try {
        // 获取历史记录
        // 请求路径: /api/Masked/FindAll
        // 请求方式: post
        // 根据选中的时间范围添加参数
        let params = '';
        if (this.selectedTimeRange === 0) { // 全部
          params = ''; // 不传递day参数
        } else if (this.selectedTimeRange === 1) { // 今天 (最近24小时)
          params = '?day=0'; // day为0对应今天
        } else if (this.selectedTimeRange === 2) { // 过去7天
          params = '?day=7'; // day为7对应过去7天
        } else if (this.selectedTimeRange === 3) { // 过去30天
          params = '?day=30'; // day为30对应过去30天
        }

        const response = await post('/api/Masked/FindAll' + params);

        if (response.code === 0) {
          // 根据响应结构处理数据
          if (Array.isArray(response.data)) {
            // 如果返回的是数组，则是历史记录列表
            this.historyRecords = response.data;
            this.totalMaskedCount = response.data.length; // 使用数组长度作为总数
          } else {
            // 如果返回的是数字或其他格式，清空历史记录
            this.totalMaskedCount = response.data || 0;
            this.historyRecords = []; // 清空历史记录
          }
          console.log('数据获取成功:', this.totalMaskedCount, this.historyRecords);
        } else {
          console.error('获取数据失败:', response.msg);
          uni.showToast({
            title: response.msg || '获取数据失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取数据请求失败:', error);
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      } finally {
        this.isLoading = false;
        uni.hideLoading();
      }
    },
    handleLogout() {
      // 清除本地存储的token
      uni.removeStorageSync('token');

      // 跳转回登录页面
      uni.reLaunch({
        url: '/pages/index/index'
      });
    }
  }
}
</script>

<style>
/* 设置页面高度 */
page {
  height: 100%;
}

.feature-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 80rpx 40rpx 140rpx; /* 增加顶部边距，使整体内容下移 */
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-sizing: border-box;
  overflow: hidden; /* 防止出现滚动条 */
}

.header {
  width: 100%;
  text-align: center;
  margin-bottom: 100rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}

.content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.message {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 60rpx;
}

/* 顶部搜索和添加区域样式 */
.top-section {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
}

.search-box {
  display: flex;
  flex: 1;
  margin-right: 20rpx;
}

.search-input {
  flex: 1;
  height: 73rpx; /* 再增大10% (66rpx * 1.1 ≈ 72.6，取73) */
  line-height: 73rpx; /* 再增大10% (66rpx * 1.1 ≈ 72.6，取73) */
  padding: 0 24rpx; /* 再增大10% (22rpx * 1.1 ≈ 24.2，取24) */
  border: 1rpx solid #dcdfe6;
  border-radius: 36rpx 0 0 36rpx; /* 再增大10% (33rpx * 1.1 ≈ 36.3，取36) */
  font-size: 34rpx; /* 再增大10% (31rpx * 1.1 ≈ 34.1，取34) */
  background-color: #fff;
  box-sizing: border-box;
}

.search-btn {
  width: 97rpx; /* 再增大10% (88rpx * 1.1 ≈ 96.8，取97) */
  height: 73rpx; /* 再增大10% (66rpx * 1.1 ≈ 72.6，取73) */
  border-radius: 0 36rpx 36rpx 0; /* 再增大10% (33rpx * 1.1 ≈ 36.3，取36) */
  border: 1rpx solid #dcdfe6;
  border-left: none;
  background-color: #667eea;
  color: white;
  font-size: 29rpx; /* 再增大10% (26rpx * 1.1 ≈ 28.6，取29) */
  line-height: 1;
  box-sizing: border-box;
}

.add-btn {
  width: 73rpx; /* 再增大10% (66rpx * 1.1 ≈ 72.6，取73) */
  height: 73rpx; /* 再增大10% (66rpx * 1.1 ≈ 72.6，取73) */
  border-radius: 50%;
  background-color: #667eea;
  color: white;
  font-size: 39rpx; /* 再增大10% (35rpx * 1.1 ≈ 38.5，取39) */
  line-height: 73rpx; /* 再增大10% (66rpx * 1.1 ≈ 72.6，取73) */
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* 防止按钮在小屏幕上被压缩 */
  box-sizing: border-box;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 20rpx;
  width: 80%;
  max-width: 600rpx;
  padding: 40rpx;
  box-sizing: border-box;
  position: relative;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  display: block;
  text-align: center;
}

.form-group {
  margin-bottom: 30rpx;
}

.form-group label {
  display: block;
  font-size: 28rpx;
  margin-bottom: 10rpx;
  color: #333;
}

.form-input {
  width: 100%;
  height: 60rpx;
  padding: 0 20rpx; 
  border: 1rpx solid #dcdfe6;
  border-radius: 10rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.form-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  margin: 0 10rpx;
}

.btn-cancel {
  background-color: #f5f7fa;
  color: #606266;
  border: 1rpx solid #dcdfe6;
}

.btn-submit {
  background-color: #667eea;
  color: white;
  border: none;
}

/* 时间范围选择样式 */
.time-range-selector {
  width: calc(100% - 80rpx);
  margin: 0 auto 20rpx;
  background-color: #f0f9ff;
  border-radius: 15rpx;
  padding: 10rpx 20rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);
}

.picker-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
}

.picker-text { 
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.arrow {
  font-size: 24rpx;
  color: #999;
}

/* 全部解码数显示样式 */
.total-masked-count {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 25rpx;
  margin: 0 auto 30rpx;
  background-color: #f0f9ff;
  border-radius: 15rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);
  width: calc(100% - 80rpx); /* 与用户卡片宽度一致，减去容器的左右padding */ 
}

.total-count-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #409eff;
}

/* 历史记录列表样式 */
.history-list {
  width: 100%;
  max-width: 600rpx;
  margin-bottom: 30rpx;
  overflow-y: auto; /* 仅在列表区域出现滚动条 */
  max-height: calc(100vh - 470rpx); /* 根据实际需要调整高度，减去其他元素的高度，包括增加的顶部padding */
}

/* 日期时间样式 */
.date-part {
  color: #333; /* 保持默认颜色 */
}

.time-part {
  color: #409eff; /* 设置为蓝色 */
}

.history-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 15rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.record-info {
  flex: 1;
}

.record-code {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.record-time {
  flex-shrink: 0;
  margin-left: 20rpx;
}

.time-text {
  font-size: 24rpx;
  color: #999;
}

.no-history {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100rpx;
  width: 100%;
  max-width: 600rpx;
  margin: 0 auto 30rpx;
}

.no-history-text {
  font-size: 28rpx;
  color: #999;
}

/* 底部导航栏样式 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  display: flex;
  background-color: #fff;
  border-top: 1rpx solid #eaeaea;
  z-index: 999;
}

.tab-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  cursor: pointer;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
}

.tab-bar-item.active .tab-text {
  color: #667eea;
  font-weight: bold;
}

</style>