<template>
  <view class="login-container">
    <view class="logo-container">
      <image class="logo" src="/static/logo.jpg"></image>
    </view>
    <view class="login-form">
      <view class="input-group">
        <input
          class="input-field"
          type="text"
          v-model="accountNumber"
          placeholder="请输入账号"
          @confirm="handleLogin"
        />
      </view>
      <view class="input-group">
        <input
          class="input-field"
          type="password"
          v-model="password"
          placeholder="请输入密码"
          @confirm="handleLogin" 
        />
      </view>
      <button class="login-button" @click="handleLogin">登录</button>
      <view class="tips">账号由管理员提供</view>
    </view>
  </view>
</template>

<script>
import { post, get } from '@/utils/request.js'; // 导入统一请求工具 

export default {
  data() {
    return {
      accountNumber: '',
      password: ''
    }
  },
  methods: {
    async handleLogin() {
      if (!this.accountNumber || !this.password) {
        uni.showToast({
          title: '请输入账号和密码',
          icon: 'none'
        });
        return;
      }

      try {
        uni.showLoading({
          title: '登录中...'
        });

        // 发送登录请求
        const response = await this.loginRequest(this.accountNumber, this.password);

        if (response.code === 0) {
          // 登录成功
          console.log('登录响应数据:', response);
          uni.setStorageSync('token', response.data); // 存储token
          console.log('Token已保存:', response.data);

          // 获取用户信息
          await this.fetchUserInfo();

          uni.showToast({
            title: '登录成功',
            icon: 'success'
          });

          // 延迟跳转，让用户看到成功提示
          setTimeout(() => {
            // 根据用户角色跳转到不同页面
            this.redirectByRole();
          }, 1500);
        } else {
          console.log('登录失败响应:', response);
          uni.showToast({
            title: response.msg || '登录失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('登录错误:', error);
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        });
      } finally {
        uni.hideLoading();
      }
    },

    // 登录成功后跳转到role1页面
    redirectByRole() {
      try {
        // 无论用户角色是多少，都跳转到role1页面
        const targetPage = '/pages/main/role1';

        console.log(`登录成功，跳转到: ${targetPage}`);
        uni.reLaunch({
          url: targetPage,
          fail: (err) => {
            console.error('跳转失败:', err);
            // 如果指定页面不存在，跳转到默认页面
            uni.reLaunch({
              url: '/pages/main/main',
              fail: (err2) => {
                console.error('默认页面跳转也失败:', err2);
                uni.showToast({
                  title: '页面跳转失败',
                  icon: 'none'
                });
              }
            });
          }
        });
      } catch (error) {
        console.error('跳转页面时发生错误:', error);
        uni.reLaunch({
          url: '/pages/main/main' // 出错时跳转到默认页面
        });
      }
    },

    // 登录请求方法
    async loginRequest(accountNumber, password) {
      try {
        const response = await post(`/api/User/Login?accountNumber=${encodeURIComponent(accountNumber)}&password=${encodeURIComponent(password)}`, {}, {
          'Content-Type': 'application/json',
          'accept': 'text/plain'
        });
        return response;
      } catch (error) {
        console.error('登录请求失败:', error);
        throw error;
      }
    },

    // 获取用户信息
    async fetchUserInfo() {
      try {
        const response = await get('/api/User/UserInfo');

        if (response.code === 0) {
          // 保存用户信息到本地存储
          uni.setStorageSync('userInfo', response.data);
          console.log('用户信息已保存:', response.data);
        } else {
          console.error('获取用户信息失败:', response);
          throw new Error(response.msg || '获取用户信息失败');
        }
      } catch (error) {
        console.error('获取用户信息异常:', error);
        uni.showToast({
          title: error.message || '获取用户信息失败',
          icon: 'none'
        });
      }
    }
  }
}
</script>

<style>
/* 使用CSS自定义属性来更好地控制高度 */
page {
  height: 100%;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* 让内容从顶部开始排列 */
  width: 100%;
  min-height: 100vh;
  padding: 150rpx 40rpx 40rpx; /* 增加顶部padding，使整体内容下移 */
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-sizing: border-box;
  overflow: hidden; /* 防止出现滚动条 */
}

.logo-container {
  margin-bottom: 60rpx; /* 增加logo下方间距，进一步调整位置 */
}

.logo {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
}

.login-form {
  width: 100%;
  max-width: 600rpx;
  padding: 40rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.input-group {
  margin-bottom: 30rpx;
  width: 100%;
}

.input-field {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  border: 1px solid #e5e5e5;
  border-radius: 10rpx;
  font-size: 28rpx;
  background-color: #f9f9f9;
  box-sizing: border-box;
}

.login-button {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 32rpx;
  margin-bottom: 20rpx;
}

.tips {
  text-align: center;
  font-size: 24rpx;
  color: #999;
}
</style>
