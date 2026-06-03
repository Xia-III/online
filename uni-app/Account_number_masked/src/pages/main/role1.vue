<template>
  <view class="feature-container">
    <view class="header">
      <text class="title">解码器</text>
    </view>

    <view class="decoder-container">
      <view class="input-group">
        <text class="input-label">参数1 :</text>
        <input
          type="number"
          class="input-field"
          v-model="param1"
          placeholder="请输入第一个参数"
        />
      </view>

      <view class="input-group">
        <text class="input-label">参数2 :</text> 
        <input
          type="number"
          class="input-field"
          v-model="param2"
          placeholder="请输入第二个参数"
        />
      </view>

      <view class="input-group">
        <text class="input-label">天数 :</text>
        <input
          type="number"
          class="input-field"
          v-model="param3"
          placeholder="请输入天数"
        />
      </view>

      <button class="decode-btn" @click="decode">解码</button>

      <view class="result-container" v-if="result">
        <text class="result-label">解码结果:</text>
        <text class="result-value" style="color: green;">{{ result }}</text>
      </view>
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

      <!-- 角色2或3: 解码、历史、管理、个人 -->
      <block v-else-if="currentUserRole === 2 || currentUserRole === 3">
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

      <!-- 加载状态 -->
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
      activeTab: 'decode', // 默认激活解码标签
      currentUserRole: null, // 当前用户角色 
      param1: '',
      param2: '',
      param3: '',
      result: ''
    }
  },

  onLoad() {
    // 页面加载时获取当前用户角色
    this.getCurrentUserRole();
  },
  methods: {
    async decode() {
      // 验证输入
      if (!this.param1 || !this.param2 || !this.param3) {
        uni.showToast({
          title: '请输入所有参数',
          icon: 'none'
        });
        return;
      }

      // 将输入转换为数字
      const num1 = parseInt(this.param1);
      const num2 = parseInt(this.param2);
      const num3 = parseInt(this.param3);

      // 验证输入是否为有效数字
      if (isNaN(num1) || isNaN(num2) || isNaN(num3)) {
        uni.showToast({
          title: '请输入有效的数字',
          icon: 'none'
        });
        return;
      }


      try {
        // 发送解码请求
        const response = await post(`/api/Masked/Decode?param1=${encodeURIComponent(num1)}&param2=${encodeURIComponent(num2)}&param3=${encodeURIComponent(num3)}`);

        if (response.code === 0) {
          // 设置结果
          this.result = response.data || '';

          uni.showToast({
            title: '解码成功',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: response.msg || '解码失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('解码失败:', error);
        uni.showToast({
          title: '解码失败，请重试',
          icon: 'none'
        });
      }
    },
    switchTab(tabName) {
      this.activeTab = tabName;

      if (tabName === 'profile') {
        // 跳转到个人资料页面
        uni.redirectTo({
          url: '/pages/main/profile'
        });
      } else if (tabName === 'history') {
        // 跳转到历史页面（feature页面）
        uni.redirectTo({
          url: '/pages/main/feature'
        });
      } else if (tabName === 'decode') {
        // 当前就是解码页面，无需跳转
        return;
      } else if (tabName === 'manage') {
        // 管理页面根据用户角色跳转
        if (this.currentUserRole === 2) {
          uni.redirectTo({
            url: '/pages/main/role2'
          });
        } else if (this.currentUserRole === 3) {
          uni.redirectTo({
            url: '/pages/main/role3'
          });
        } else {
          // 角色1没有管理页面
          uni.showToast({
            title: '权限不足',
            icon: 'none'
          });
        }
      }
    },

    getCurrentUserRole() {
      // 从本地存储获取用户信息，然后获取角色
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
  justify-content: flex-start;
  width: 100%;
  min-height: 100vh;
  padding: 150rpx 40rpx 140rpx; /* 增加顶部边距，使整体内容下移 */
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-sizing: border-box;
  overflow: hidden; /* 防止出现滚动条 */
}

.header {
  width: 100%;
  text-align: center;
  margin-bottom: 60rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
}

.decoder-container {
  width: 100%;
  max-width: 600rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  box-sizing: border-box;
}

.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 30rpx;
}

.input-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
  font-weight: 500;
}

.input-field {
  height: 60rpx;
  padding: 0 20rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 10rpx;
  font-size: 28rpx;
  background-color: #fff;
  box-sizing: border-box;
}

.decode-btn {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin: 30rpx 0;
  box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.decode-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 10rpx rgba(102, 126, 234, 0.5);
}

.result-container {
  margin-top: 30rpx;
  padding: 30rpx;
  background: #f8f9fa;
  border-radius: 15rpx;
  text-align: center;
}

.result-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 15rpx;
  font-weight: 500;
}

.result-value {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  letter-spacing: 5rpx;
}

/* 底部导航栏样式 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  display: flex;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1rpx solid rgba(0, 0, 0, 0.1);
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
  transition: all 0.3s ease;
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