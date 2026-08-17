<template>
  <view class="login-container">
    <!-- 背景视图 -->
    <view class="background-view"></view>

    <!-- 内容层 -->
    <view class="login-form" :style="{ background: 'rgba(255, 255, 255, 0.8)', borderRadius: '20rpx', padding: '40rpx' }">
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

      <!-- 记住账号复选框 -->
      <label class="remember-account" @click="toggleRememberAccount">
        <checkbox
          :checked="rememberAccount"
          :disabled="isLoggingIn"
          @click="toggleRememberAccount"
          color="#667eea"
        />
        <text :class="{'disabled': isLoggingIn}">记住账号</text>
      </label>

      <button class="login-button" @click="handleLogin">登录</button>
      <view class="tips">账号由管理员提供</view>
    </view>

    <!-- 版本信息显示在右下角 -->
    <view class="version-info">{{ versionName }}</view>
  </view>
</template>

<script>
import { post, get } from '@/utils/request.js'; // 导入统一请求工具
import appVersion from '@/utils/version.js'; // 导入应用版本信息

export default {
  data() {
    return {
      accountNumber: '',
      password: '',
      rememberAccount: false, // 是否记住账号
      isLoggingIn: false, // 是否正在登录
      versionName: '0.0.0' // 默认版本号
    }
  },
  onLoad() {
    // 隐藏顶部电池,时间等信息（仅在App环境中可用）
    if (typeof plus !== 'undefined') {
      plus.navigator.setFullscreen(true);
    }

    // 获取应用版本信息
    this.getVersionInfo();

    // 版本校验
    this.checkVersion();

    // 读取已保存的账号密码 
    this.loadSavedCredentials();
  },
  methods: {
    // 处理复选框变化
    onCheckboxChange(event) {
      this.rememberAccount = event.detail.value;
      console.log('用户改变选择:', this.rememberAccount);
    },

    // 切换记住账号状态
    toggleRememberAccount() {
      if (!this.isLoggingIn) {
        this.rememberAccount = !this.rememberAccount;
        console.log('切换记住账号状态:', this.rememberAccount);
      }
    },

    // 读取已保存的账号密码
    loadSavedCredentials() {
      try {
        const savedData = uni.getStorageSync('rememberedCredentials');
        if (savedData && savedData.accountNumber) {
          this.accountNumber = savedData.accountNumber;
          this.password = savedData.password || '';
          this.rememberAccount = true; // 如果有已保存的账号密码，则默认勾选记住账号
        }
      } catch (error) {
        console.error('读取已保存的凭证失败:', error);
      }
    },

    // 保存账号密码到本地存储
    saveCredentials() {
      try {
        const credentials = {
          accountNumber: this.accountNumber,
          password: this.password,
          rememberPassword: true // 标记是否记住密码
        };
        uni.setStorageSync('rememberedCredentials', credentials);
        console.log('账号密码已保存');
      } catch (error) {
        console.error('保存凭证失败:', error);
      }
    },

    // 清除已保存的凭证
    clearSavedCredentials() {
      try {
        uni.removeStorageSync('rememberedCredentials');
        console.log('已清除保存的账号密码');
      } catch (error) {
        console.error('清除已保存的凭证失败:', error);
      }
    },

    // 版本校验
    async checkVersion() {
      console.log('【版本更新】开始执行版本校验');
      try {
        // 获取当前应用版本信息
        const currentVersion = this.versionName || '1.0.0';
        console.log('【版本更新】获取到的当前版本号:', currentVersion); 

        // 假设版本号格式为 x.y.z，将其转换为数字形式
        const versionParts = currentVersion.split('.');
        console.log('【版本更新】版本号拆分结果:', versionParts);

        let currentVersionCode = 0;
        if (versionParts.length >= 3) {
          // 将版本号转换为数字，例如 1.0.1 -> 101
          currentVersionCode = parseInt(versionParts[0]) * 100 +
                              parseInt(versionParts[1]) * 10 +
                              parseInt(versionParts[2]);
          console.log('【版本更新】计算出的版本码:', currentVersionCode);

          if (isNaN(currentVersionCode)) {
            currentVersionCode = 100; // 默认版本码
            console.log('【版本更新】版本号解析失败，使用默认版本码:', currentVersionCode);
          }
        } else {
          currentVersionCode = 100; // 默认版本码
            console.log('【版本更新】版本号格式不符合要求，使用默认版本码:', currentVersionCode);
        }

        console.log('【版本更新】准备发送版本校验请求，参数:', {
          currentVersion: currentVersion,
          currentVersionCode: currentVersionCode
        });

        // 发送版本校验请求
        const response = await this.postVersionCheck({
          currentVersion: currentVersion,
          currentVersionCode: currentVersionCode
        });
        console.log('【版本更新】版本校验请求响应:', response);

        if (response.code === 200 && response.data) {
          const { needUpdate, latestVersion, downloadUrl, updateDescription } = response.data;
          console.log('【版本更新】版本校验结果:', { needUpdate, latestVersion, downloadUrl, updateDescription });

          if (needUpdate) {
            // 需要更新，显示更新提示
            console.log('【版本更新】检测到新版本，准备显示更新对话框');
            this.showUpdateDialog(latestVersion, downloadUrl, updateDescription);
          } else {
            console.log('【版本更新】当前已是最新版本');
          }
        } else {
          console.error('【版本更新】版本校验失败:', response);
        }
      } catch (error) {
        console.error('【版本更新】版本校验请求失败:', error);
      }
    },

    // 发送版本校验请求
    async postVersionCheck(data) {
      const url = 'https://www.huanxizn.com/Sales/api/v2/AppVersion/CheckAppVersion';
      console.log('【版本更新】发送版本校验请求到:', url, '数据:', data);

      const response = await uni.request({
        url: url,
        method: 'POST',
        header: {
          'accept': '*/*',
          'Content-Type': 'application/json-patch+json'
        },
        data: data
      });
      console.log('【版本更新】版本校验请求完成，响应:', response);

      return response.data;
    },

    // 显示更新对话框
    showUpdateDialog(latestVersion, downloadUrl, updateDescription) {
      console.log('【版本更新】准备显示更新对话框，参数:', { latestVersion, downloadUrl, updateDescription });

      uni.showModal({
        title: '版本更新',
        content: `发现新版本 ${latestVersion}\n是否立即更新？`,
        confirmText: '立即更新',
        cancelText: '稍后再说',
        success: (res) => {
          console.log('【版本更新】更新对话框操作结果:', res);
          if (res.confirm) {
            // 用户选择立即更新
            console.log('【版本更新】用户选择立即更新');
            this.performUpdate(downloadUrl);
          } else {
            console.log('【版本更新】用户选择暂不更新');
          }
        }
      });
    },

    // 执行更新
    performUpdate(downloadUrl) {
      console.log('【版本更新】开始执行更新，下载链接:', downloadUrl);
      // 构造完整下载URL
      const fullDownloadUrl = `https://www.huanxizn.com/${downloadUrl}`;
      console.log('【版本更新】构造的完整下载URL:', fullDownloadUrl);

      // 不管在什么环境下，都使用系统浏览器打开下载链接
      console.log('【版本更新】使用系统浏览器打开下载链接:', fullDownloadUrl);

      // 使用uni-app的API打开外部链接
      if (typeof plus !== 'undefined') {
        // 在App环境中使用plus.runtime.openURL
        plus.runtime.openURL(fullDownloadUrl);

        // 延迟一段时间后退出应用，让用户有时间看到浏览器打开
        setTimeout(() => {
          // 退出应用
          plus.runtime.quit();
        }, 2.5 * 1000); // 延迟2.5秒后退出应用
      } else {
        // 在非App环境（如H5）中，使用window.open
        if (typeof window !== 'undefined' && window.open) {
          window.open(fullDownloadUrl, '_blank');
        } else {
          // 如果无法打开链接，提示用户复制链接
          console.log('【版本更新】无法使用window.open，提示用户复制链接');
          uni.showModal({
            title: '提示',
            content: `请复制以下链接到浏览器下载：${fullDownloadUrl}`,
            showCancel: false,
            confirmText: '确定'
          });
        }
      }
    },


    // 获取应用版本信息
    getVersionInfo() {
      try {
        // 从版本信息文件获取版本号
        this.versionName = appVersion.versionName;
      } catch (error) {
        console.error('【版本更新】获取版本信息失败:', error);
        // 如果无法获取，则使用默认版本号
        this.versionName = '0.0.0';
      }
      console.log('【版本更新】应用版本信息:', this.versionName);
    },


    async handleLogin() {
      console.log('用户选择:', this.rememberAccount);
      if (!this.accountNumber || !this.password) {
        uni.showToast({
          title: '请输入账号和密码',
          icon: 'none'
        });
        return;
      }

      // 在登录开始时记录用户的选择，避免在登录过程中状态发生变化
      const shouldRememberAccount = this.rememberAccount;
      console.log('用户选择记住账号:', shouldRememberAccount);
      // 设置登录状态，防止在登录过程中更改记住账号选项
      this.isLoggingIn = true;

      try {
        uni.showLoading({
          title: '登录中...'
        });

        // 发送登录请求
        const response = await this.loginRequest(this.accountNumber, this.password); 

        if (response.code === 200) {
          // 登录成功
          console.log('登录响应数据:', response);
          uni.setStorageSync('token', response.data); // 存储token
          console.log('Token已保存:', response.data);

          // 获取用户信息
          await this.fetchUserInfo();

          // 根据登录前的记住账号状态决定是否保存凭证
          if (shouldRememberAccount) {
            this.saveCredentials();
          } else {
            this.clearSavedCredentials();
          }

          uni.showToast({
            title: '登录成功',
            icon: 'success'
          });

          // 延迟跳转，让用户看到成功提示
          // 使用uni-app兼容的延迟跳转
          const that = this;
          try {
            // 使用uni.navigateTo或uni.reLaunch前先隐藏loading
            uni.hideLoading();

            // 检查是否在App环境中，如果是则使用更安全的方式
            if (typeof plus !== 'undefined' && plus.os.name.toLowerCase() === 'android') {
              // 在Android环境中，使用plus.timer作为备选方案
              plus.timer.setTimeout(function() {
                that.redirectByRole();
              }, 1500);
            } else if (typeof setTimeout !== 'undefined' && setTimeout !== null) {
              // 在其他环境或支持setTimeout的环境中
              setTimeout(() => {
                // 根据用户角色跳转到不同页面
                that.redirectByRole();
              }, 1500);
            } else {
              // 如果setTimeout不可用，则立即跳转
              that.redirectByRole();
            }
          } catch(e) {
            console.error('【登录】延迟跳转失败，直接跳转:', e);
            // 如果setTimeout执行失败，则立即跳转
            that.redirectByRole();
          }
        } else {
          console.log('登录失败响应:', response);
          uni.showToast({
            title: response.message || '登录失败',
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
        // 重置登录状态
        this.isLoggingIn = false;
        uni.hideLoading();
      }
    },

    // 登录成功后根据角色跳转到不同页面
    async redirectByRole() {
      try {
        // 获取用户信息以确定角色
        const userInfo = uni.getStorageSync('userInfo');
        if (userInfo && userInfo.role) {
          let targetPage = '/pages/main/role1'; // 默认跳转到role1页面

          // 根据角色确定跳转页面
          if (userInfo.role === 4) {
            // 角色4视为管理员，跳转到role2页面
            targetPage = '/pages/main/manage';
          } 
          // 其他角色都按普通用户处理，跳转到role1页面

          console.log(`登录成功，角色: ${userInfo.role}，跳转到: ${targetPage}`);
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
        } else {
          // 如果无法获取用户信息，跳转到默认页面
          console.log('无法获取用户信息，跳转到默认页面');
          uni.reLaunch({
            url: '/pages/main/main'
          });
        }
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
        const response = await post('/api/Auth/UserAuth', {
          userName: accountNumber,
          password: password
        }, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
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
        const response = await post('/api/v2/User/GetCurrentUser', {}, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        if (response.code === 200) {
          // 保存用户信息到本地存储
          uni.setStorageSync('userInfo', response.data);
          console.log('用户信息已保存:', response.data);
        } else {
          console.error('获取用户信息失败:', response);
          throw new Error(response.message || '获取用户信息失败');
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.background-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -1;
}

.login-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden; /* 防止出现滚动条 */
  z-index: 1;
}


.login-form {
  width: 100%;
  max-width: 600rpx;
  padding: 40rpx !important;
  background: rgba(255, 255, 255, 0.8) !important; /* 半透明白色背景，确保内容可读性 */
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

.remember-account {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 28rpx;
  color: #333;
}

.remember-account checkbox {
  margin-right: 10rpx;
}

.remember-account .disabled {
  color: #ccc; /* 禁用状态下的文字颜色 */
}

.version-info {
  position: fixed;
  right: 20rpx;
  bottom: 20rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  z-index: 9999;
  pointer-events: none; /* 防止遮挡其他元素的点击事件 */
}
</style>
