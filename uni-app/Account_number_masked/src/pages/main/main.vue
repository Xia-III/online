<template>
  <view class="main-container">
    <view class="header">
      <text class="title">欢迎使用系统</text>
    </view>
    <view class="content">
      <text class="message">登录成功！这是您的主页面。</text>
    </view>

    <!-- 底部导航栏 -->
    <view class="tab-bar">
      <view
        class="tab-bar-item"
        :class="{ 'active': activeTab === 'feature' }"
        @click="switchTab('feature')"
      >
        <text class="tab-text">功能</text>
      </view>
      <view
        class="tab-bar-item"
        :class="{ 'active': activeTab === 'profile' }"
        @click="switchTab('profile')"
      >
        <text class="tab-text">个人</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activeTab: 'profile' // 默认激活个人标签
    }
  },
  onLoad() {
    console.log('Main页面加载');
    // 页面加载时检查是否有token
    const token = uni.getStorageSync('token');
    console.log('Main页面获取到的Token:', token);

    if (!token) {
      console.log('未检测到token，跳转到登录页面');
      uni.showModal({
        title: '提示',
        content: '未检测到登录凭证，请重新登录',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            uni.reLaunch({
              url: '/pages/index/index'
            });
          }
        }
      });
    }
  },
  methods: {
    switchTab(tabName) {
      this.activeTab = tabName;

      if (tabName === 'profile') {
        // 跳转到个人资料页面
        uni.navigateTo({
          url: '/pages/main/profile'
        });
      } else if (tabName === 'feature') {
        // 跳转到功能页面
        uni.navigateTo({
          url: '/pages/main/feature'
        });
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
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 100rpx 40rpx 140rpx; /* 增加底部边距，为底部导航栏留出空间 */
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
  margin-bottom: 100rpx;
}

.logout-btn {
  width: 200rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  margin-top: 30rpx;
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