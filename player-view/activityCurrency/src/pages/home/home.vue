<template>
  <view class="container" :class="{ 'refreshing': isRefreshing }">
    <view class="content">
      <!-- 用户信息卡片 -->
      <view v-if="userInfo" class="user-card">
        <image :src="userInfo.avatar" class="avatar" />
        <view class="user-info">
          <text class="nickname">{{ userInfo.nickname }}</text>
          <view class="coins-info">
            <text class="coin-item">可用金币: {{ Math.floor(userInfo.availableCoins / 100) }}</text>
            <text class="coin-item">待认证金币: {{ Math.floor(userInfo.pendingCoins / 100) }}</text> 
          </view>
        </view>
      </view>

      <!-- 活动币使用说明 -->
      <view class="usage-note">
        <text class="note-text">活动币使用时间存在限制，请尽快使用</text>
      </view>

      <!-- 领取活动币按钮 -->
      <view v-if="userInfo" class="claim-button-container">
        <button class="claim-button"
                :class="{ 'claim-button-disabled': isClaiming }"
                @click="claimPendingCoins"
                :disabled="isClaiming">
          {{
            isClaiming ? '领取中...' : '领取活动币'
          }}
        </button>
      </view>
    </view>

    <!-- 消息提示 -->
    <view v-if="showMessage" class="message-toast">
      {{ messageText }}
    </view>

    <!-- 刷新指示器 -->
    <view v-if="isRefreshing" class="refresh-indicator">
      <view class="refresh-spinner"></view>
      <text class="refresh-text">正在刷新...</text>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js';

export default {
  data() {
    return {
      userInfo: null,
      salesQRCodeId: null,
      showMessage: false,
      messageText: '',
      isClaiming: false, // 控制领取按钮状态，防止重复点击
      isRefreshing: false // 控制下拉刷新状态
    }
  },
  onLoad(options) {
    console.log('主页面加载，接收到的参数:', options);

    // 获取传递过来的 salesQRCodeId 参数
    if (options && options.salesQRCodeId) {
      this.salesQRCodeId = options.salesQRCodeId;
      console.log('接收到 salesQRCodeId:', this.salesQRCodeId);

      // 在这里可以执行需要使用 salesQRCodeId 的相关逻辑
      this.handleSalesQRCodeId();
    }

    // 检查用户是否已登录（有token）和是否有salesQRCodeId
    if (!this.checkLoginStatus() || !this.salesQRCodeId) {
      // 如果未登录或没有salesQRCodeId，跳转到登录页面
      uni.navigateTo({
        url: '/pages/index/index'
      });
      return;
    }

    this.loadUserInfo();
  },
  onPullDownRefresh() {
    // 下拉刷新时重新加载用户信息
    this.loadUserInfo(true);
  },
  methods: {
    // 检查用户登录状态
    checkLoginStatus() {
      // 检查是否存在有效的 token
      let token;
      if (typeof window !== 'undefined' && window.sessionStorage) {
        // 浏览器环境，优先检查 sessionStorage
        token = window.sessionStorage.getItem('token');
        if (!token) {
          // 如果 sessionStorage 中没有，再检查 localStorage
          token = uni.getStorageSync('token');
        }
      } else {
        // 非浏览器环境，使用 uni.storage
        token = uni.getStorageSync('token');
      }

      // 检查是否存在有效的 addressId
      let addressId;
      if (typeof window !== 'undefined' && window.sessionStorage) {
        // 浏览器环境，优先检查 sessionStorage
        addressId = window.sessionStorage.getItem('addressId');
        if (!addressId) {
          // 如果 sessionStorage 中没有，再检查 localStorage
          addressId = uni.getStorageSync('addressId');
        }
      } else {
        // 非浏览器环境，使用 uni.storage
        addressId = uni.getStorageSync('addressId');
      }

      // 如果 token 和 addressId 都存在，则认为用户已登录
      if (token && addressId) {
        return true;
      } else {
        console.log('用户未登录或登录信息不完整');
        return false;
      }
    },

    // 处理接收到的 salesQRCodeId 参数
    handleSalesQRCodeId() {
      // 在这里可以添加使用 salesQRCodeId 的业务逻辑
      console.log('处理 salesQRCodeId:', this.salesQRCodeId);

      // 示例：可以向服务器发送请求，记录用户通过哪个销售二维码进入
      /*
      api.post('/api/trackSalesQRCode', {
        salesQRCodeId: this.salesQRCodeId,
        // 其他相关信息
      }).then(response => {
        console.log('销售二维码跟踪请求成功:', response);
      }).catch(error => {
        console.error('销售二维码跟踪请求失败:', error);
      });
      */
    },
    async loadUserInfo(isRefreshingParam = false) {
      try {
        // 如果是下拉刷新，显示刷新状态
        if (isRefreshingParam) {
          this.isRefreshing = true;
          uni.showNavigationBarLoading(); // 显示导航栏加载动画
        }

        // 从 sessionStorage 或 localStorage 获取 addressId
        let addressId;
        if (typeof window !== 'undefined' && window.sessionStorage) {
          // 浏览器环境，优先检查 sessionStorage
          addressId = window.sessionStorage.getItem('addressId');
          if (!addressId) {
            // 如果 sessionStorage 中没有，再检查 localStorage
            addressId = uni.getStorageSync('addressId');
          }
        } else {
          // 非浏览器环境，使用 uni.storage
          addressId = uni.getStorageSync('addressId');
        }

        // 如果没有找到 addressId，提示用户并跳转到登录页面
        if (!addressId) {
          console.log('未找到场地信息，请重新登陆');
          uni.redirectTo({
            url: '/pages/index/index'
          });
          return;
        }

        // 发送请求获取用户信息
        const response = await api.post('/api/v3/Player/GetInfo', {
          addressId: parseInt(addressId)
        }, {
          header: {
            'Content-Type': 'application/json-patch+json'
          }
        });

        if (response.data && response.data.code === 200) {
          // 成功获取用户信息
          this.userInfo = response.data.data;
          console.log('用户信息:', this.userInfo);
        } else {
          console.error('获取用户信息失败:', response);
        }
      } catch (error) {
        console.error('请求用户信息时发生错误:', error);
      } finally {
        // 停止下拉刷新动画
        if (isRefreshingParam) {
          uni.stopPullDownRefresh();
          uni.hideNavigationBarLoading(); // 隐藏导航栏加载动画
          this.isRefreshing = false; // 重置刷新状态
        }
      }
    },
    async claimPendingCoins() {
      // 防止重复点击
      if (this.isClaiming) {
        return;
      }

      // 设置领取状态为true，防止重复点击
      this.isClaiming = true;

      try {
        // 检查是否有 salesQRCodeId
        if (!this.salesQRCodeId) {
          this.showMessageFunc('缺少必要参数，无法领取');
          return;
        }

        console.log('领取活动币按钮被点击');
        console.log('使用的 salesQRCodeId:', this.salesQRCodeId);

        // 发送新的领取请求
        const response = await api.post('/api/v3/Player/ClaimCoins', {
          salesQRCodeId: parseInt(this.salesQRCodeId)
        }, {
          header: {
            'Content-Type': 'application/json-patch+json'
          }
        });

        if (response.data && response.data.code === 200) {
          console.log('领取活动币成功', response.data);

          // 显示成功消息
          const message = response.data.data?.message || '领币成功，等待审核';
          this.showMessageFunc(message);

          // 重新获取用户信息以更新金币数量
          this.loadUserInfo();
        } else if (response.data && (response.data.code === 401 || response.data.code === 403)) {
          // Token无效或未授权
          console.error('用户未登录或登录已过期:', response);
          this.showMessageFunc('登录已过期，请重新登录');
        } else {
          console.error('领取活动币失败:', response);
          this.showMessageFunc(response.data?.message || '领取失败，请稍后重试');
        }
      } catch (error) {
        console.error('领取活动币时发生错误:', error);
        this.showMessageFunc('网络错误，请检查连接');
      } finally {
        // 无论请求成功或失败，都要将领取状态设为false
        this.isClaiming = false;
      }
    },

    // 显示消息提示的方法
    showMessageFunc(text) {
      this.messageText = text;
      this.showMessage = true;

      // 3秒后自动隐藏消息
      setTimeout(() => {
        this.showMessage = false;
        this.messageText = '';
      }, 3000);
    }
  }
}
</script>

<style>
.container {
  padding: 30rpx;
  width: 100vw;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* 改为从顶部开始排列 */
  padding-top: 150rpx; /* 添加顶部内边距，使卡片位于中心偏上位置 */
  overflow: hidden; /* 防止出现滚动条 */
  box-sizing: border-box;
  position: relative; /* 为刷新指示器定位做准备 */
}

.content {
  width: 100%;
  max-width: 800rpx; /* 限制最大宽度，避免在宽屏设备上过宽 */
  padding: 30rpx;
}

.user-card {
  background-color: white;
  border-radius: 25rpx;
  padding: 50rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
}

.avatar {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  margin-right: 40rpx;
}

.user-info {
  flex: 1;
}

.nickname {
  font-size: 48rpx;
  font-weight: bold;
  display: block;
  margin-bottom: 30rpx;
}

.coins-info {
  display: flex;
  flex-direction: column;
}

.coin-item {
  font-size: 36rpx;
  margin-bottom: 15rpx;
}

.usage-note {
  margin-top: 40rpx; /* 与上面的卡片保持一定距离 */
  width: 100%;
  padding: 0 50rpx; /* 与用户卡片的内边距保持一致 */
  box-sizing: border-box;
  text-align: center; /* 居中显示 */
}

.note-text {
  font-size: 28rpx; /* 稍小的字体 */
  color: #ff6b6b; /* 使用醒目的颜色 */
  font-weight: normal;
}

.claim-button-container {
  margin-top: 100rpx; /* 减少与上面元素的距离，因为已经添加了说明文字 */
  width: 100%;
  padding: 0 50rpx; /* 与用户卡片的内边距保持一致 */
  box-sizing: border-box;
}

.claim-button {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 50rpx;
  padding: 20rpx;
  font-size: 36rpx;
  font-weight: bold;
  width: 100%;
  box-sizing: border-box;
}

.claim-button-disabled {
  background-color: #ccc;
  color: #999;
}

.loading {
  text-align: center;
  padding: 150rpx 0;
  font-size: 40rpx;
  color: #8f8f94;
}

.message-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20rpx 40rpx;
  border-radius: 10rpx;
  z-index: 9999;
  text-align: center;
  font-size: 32rpx;
  min-width: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 刷新指示器样式 */
.refresh-indicator {
  position: absolute;
  top: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 40rpx;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 50rpx;
  z-index: 10000;
}

.refresh-spinner {
  width: 30rpx;
  height: 30rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 20rpx;
}

.refresh-text {
  color: white;
  font-size: 28rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>