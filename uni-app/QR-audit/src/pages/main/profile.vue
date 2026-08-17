<template>
  <view class="profile-container">
    <view class="profile-header" v-if="userInfo">
      <view class="avatar">
        <text class="avatar-text">{{ userInfo.nickname ? userInfo.nickname.charAt(0).toUpperCase() : userInfo.loginName.charAt(0).toUpperCase() }}</text>
      </view>
      <text class="user-name">{{ userInfo.nickname || userInfo.loginName }}</text>
      <text class="user-role" :class="roleClass">{{ roleText }}</text>
    </view>

    <view class="profile-content" v-if="userInfo">
      <view class="info-card">
        <view class="info-item">
          <text class="label">用户ID</text>
          <text class="value">{{ userInfo.userId }}</text>
        </view>
        <view class="info-item">
          <text class="label">账号</text>
          <text class="value">{{ userInfo.loginName }}</text>
        </view>
        <view class="info-item" v-if="userInfo.addressId != 0">
          <text class="label">地址ID</text>
          <text class="value">{{ userInfo.addressId }}</text>
        </view>
        <view class="info-item">
          <text class="label">创建时间</text>
          <text class="value">{{ userInfo.createdOn }}</text>
        </view>
      </view>
    </view>
    <view class="loading" v-else>
      <text>加载中...</text>
    </view>

    <!-- 修改昵称和密码卡片 -->
    <view class="action-cards">
      <view class="action-card" @click="showUpdateNicknameModal = true">
        <text class="action-text">修改昵称</text>
      </view>
      <view class="action-card" @click="showUpdatePasswordModal = true">
        <text class="action-text">修改密码</text>
      </view>
    </view>

    <!-- 修改昵称弹窗 -->
    <view v-if="showUpdateNicknameModal" class="modal-overlay" @click="closeUpdateNicknameModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">修改昵称</text>
        <view class="form-group-profile">
          <label>新昵称</label>
          <input
            type="text"
            placeholder="请输入新昵称"
            v-model="newNickname"
            class="form-input"
          />
        </view>
        <view class="form-buttons">
          <button class="btn-cancel" @click="closeUpdateNicknameModal">取消</button>
          <button class="btn-submit" @click="updateNickname">确认</button>
        </view>
      </view>
    </view>

    <!-- 修改密码弹窗 -->
    <view v-if="showUpdatePasswordModal" class="modal-overlay" @click="closeUpdatePasswordModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">修改密码</text>
        <view class="form-group-profile"> 
          <label>原密码</label>
          <input
            type="text"
            placeholder="请输入原密码"
            v-model="oldPassword"
            class="form-input"
          />
        </view>
        <view class="form-group-profile">
          <label>新密码</label>
          <input
            type="password"
            placeholder="请输入新密码"
            v-model="newPassword"
            class="form-input"
          />
        </view>
        <view class="form-group-profile">
          <label>确认新密码</label>
          <input
            type="password"
            placeholder="请再次输入新密码"
            v-model="confirmNewPassword"
            class="form-input"
          />
        </view>
        <view class="form-buttons">
          <button class="btn-cancel" @click="closeUpdatePasswordModal">取消</button>
          <button class="btn-submit" @click="updatePassword">确认</button>
        </view>
      </view>
    </view>

    <button class="logout-btn" @click="handleLogout">退出登录</button>

    <!-- 底部导航栏 -->
    <view class="tab-bar">
      <!-- 角色4: 二维码、审核、管理、个人 -->
      <block v-if="userRole === 4">
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'decode' }"
          @click="switchTab('decode')"
        >
          <text class="tab-text">二维码</text>
        </view>
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'history' }"
          @click="switchTab('history')"
        >
          <text class="tab-text">审核</text>
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

      <!-- 角色2: 首页、个人 -->
      <block v-else-if="userRole === 2">
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'decode' }"
          @click="switchTab('decode')"
        >
          <text class="tab-text">首页</text>
        </view>
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'profile' }"
          @click="switchTab('profile')"
        >
          <text class="tab-text">个人</text>
        </view>
      </block>

      <!-- 其他角色: 首页、个人 -->
      <block v-else-if="userRole">
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'decode' }"
          @click="switchTab('decode')"
        >
          <text class="tab-text">首页</text>
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
import { get, post, put, patch } from '@/utils/request.js';

export default {
  data() {
    return {
      userInfo: null,
      activeTab: 'profile', // 默认激活个人标签
      userRole: null, // 用户角色
      showUpdateNicknameModal: false, // 控制修改昵称弹窗显示
      showUpdatePasswordModal: false, // 控制修改密码弹窗显示
      newNickname: '', // 新昵称
      oldPassword: '', // 原密码
      newPassword: '', // 新密码
      confirmNewPassword: '' // 确认新密码
    }
  },
  computed: {
    roleText() {
      if (!this.userInfo) {
        return '';
      }
      switch (this.userInfo.role) {
        case 4:
          return '系统管理员';
        case 3:
          return '高级管理员';
        case 2:
          return '管理员';
        case 1:
          return '普通用户';
        default:
          return '未知身份';
      }
    },
    roleClass() {
      if (!this.userInfo) {
        return '';
      }
      switch (this.userInfo.role) {
        case 4:
          return 'role-admin';
        case 3:
          return 'role-manager';
        case 2:
          return 'role-manager';
        case 1:
          return 'role-user';
        default:
          return 'role-unknown';
      }
    }
  },
  onLoad() {
    // 隐藏顶部电池,时间等信息（仅在App环境中可用）
    if (typeof plus !== 'undefined') {
      plus.navigator.setFullscreen(true); 
    }
    // 页面加载时获取用户信息
    this.fetchUserInfo();
    // 同时获取用户角色并固定导航
    this.getCurrentUserRole();
  },

  onShow() {
    // 页面显示时不再更新用户角色，避免导航闪烁
    // 但如果用户角色未设置，仍需获取
    if (!this.userRole) {
      this.getCurrentUserRole();
    }
  },
  methods: {
    getCurrentUserRole() {
      // 从本地存储获取用户信息或token，然后获取角色
      // 这里假设用户信息存储在本地存储中
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo && userInfo.role) {
        this.userRole = userInfo.role;
      } else {
        // 如果本地没有存储用户信息，可能需要从API获取
        // 这里可以调用获取用户信息的API
        this.fetchUserInfoForRole();
      }
    },

    async fetchUserInfoForRole() {
      try {
        // 这里应该调用获取用户信息的API
        // 模拟获取用户信息
        const token = uni.getStorageSync('token');
        if (token) {
          // 假设有一个获取用户信息的API
          // const response = await get('/api/User/Info');
          // this.userRole = response.data.role;

          // 由于没有具体API，暂时模拟获取角色
          // 实际项目中应替换为真实的API调用
          console.log('获取用户角色信息...');
        }
      } catch (error) {
        console.error('获取用户角色信息失败:', error);
      }
    },

    async fetchUserInfo() {
      try {
        uni.showLoading({
          title: '加载中...'
        });

        // 使用封装的请求方法，会自动带上token
        const response = await post('/api/v2/User/GetCurrentUser', {}, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        }); // 获取用户信息API端点

        if (response.code === 200) {
          this.userInfo = response.data;
        } else {
          uni.showToast({
            title: response.message || '获取失败',
            icon: 'none'
          });
          // 获取信息失败后跳转到登录页面
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/index/index'
            });
          }, 1500);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        uni.showToast({
          title: error.message || '请求失败',
          icon: 'none'
        });
        // 获取信息失败后跳转到登录页面
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/index/index'
          });
        }, 1500);
      } finally {
        uni.hideLoading();
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
    async updateNickname() {
      // 验证新昵称
      if (!this.newNickname.trim()) { 
        uni.showToast({
          title: '请输入新昵称',
          icon: 'none'
        });
        return;
      }

      try {
        // 发送修改昵称请求 - 使用新的API
        const params = {
          userId: this.userInfo.userId,
          addressId: this.userInfo.addressId,
          status: this.userInfo.status,
          nickName: this.newNickname.trim(),
          expireMin: this.userInfo.expireMin || 60,           // 二维码有效时间（分钟）
          coins: this.userInfo.coins || 6,                 // 活动币数
          coinsExpireHour: this.userInfo.coinsExpireHour || 1, // 活动币有效时间（小时）
          dailyScanLimit: this.userInfo.dailyScanLimit || 1    // 活动币每天领取次数
        };

        const response = await post('/api/v2/User/Edit', params, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        if (response.code === 200) {
          uni.showToast({
            title: '昵称修改成功',
            icon: 'success'
          });

          // 更新本地用户信息
          this.userInfo.nickname = this.newNickname.trim();
          this.newNickname = ''; // 清空输入框
          this.closeUpdateNicknameModal(); // 关闭弹窗
        } else {
          uni.showToast({
            title: response.message || '修改失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('修改昵称失败:', error);
        uni.showToast({
          title: '修改失败，请重试',
          icon: 'none'
        });
      }
    },

    async updatePassword() {
      // 验证输入
      if (!this.oldPassword) {
        uni.showToast({
          title: '请输入原密码',
          icon: 'none'
        });
        return;
      }

      if (!this.newPassword) {
        uni.showToast({
          title: '请输入新密码',
          icon: 'none'
        });
        return;
      }

      if (!this.confirmNewPassword) {
        uni.showToast({
          title: '请确认新密码',
          icon: 'none'
        });
        return;
      }

      if (this.newPassword !== this.confirmNewPassword) {
        uni.showToast({
          title: '两次输入的新密码不一致',
          icon: 'none'
        });
        return;
      }

      if (this.oldPassword === this.newPassword) {
        uni.showToast({
          title: '新密码不能与原密码相同',
          icon: 'none'
        });
        return;
      }

      try {
        // 发送修改密码请求 - 使用新的API
        const params = {
          userId: this.userInfo.userId,
          nickName: this.userInfo.nickname.trim(),
          oldPassword: this.oldPassword,
          password: this.newPassword,
          addressId: this.userInfo.addressId,
          status: this.userInfo.status,
          expireMin: this.userInfo.expireMin || 60,           // 二维码有效时间（分钟）
          coins: this.userInfo.coins || 6,                 // 活动币数
          coinsExpireHour: this.userInfo.coinsExpireHour || 1, // 活动币有效时间（小时）
          dailyScanLimit: this.userInfo.dailyScanLimit || 1    // 活动币每天领取次数 
        };

        const response = await post('/api/v2/User/Edit', params, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        if (response.code === 200) {
          uni.showToast({
            title: '密码修改成功',
            icon: 'success'
          });

          // 清除本地存储的token和用户信息
          uni.removeStorageSync('token');
          uni.removeStorageSync('userInfo');

          // 跳转回登录页面
          uni.reLaunch({
            url: '/pages/index/index'
          });
        } else {
          uni.showToast({
            title: response.message || '修改失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('修改密码失败:', error);
        uni.showToast({
          title: '修改失败，请重试',
          icon: 'none'
        });
      }
    },

    closeUpdateNicknameModal() {
      this.showUpdateNicknameModal = false;
      this.newNickname = '';
    },

    closeUpdatePasswordModal() {
      this.showUpdatePasswordModal = false;
      this.oldPassword = '';
      this.newPassword = '';
      this.confirmNewPassword = '';
    },

    switchTab(tabName) {
      this.activeTab = tabName;

      if (tabName === 'profile') {
        // 当前就是个人资料页面，无需跳转
        return;
      } else if (tabName === 'decode') {
        // 根据用户角色跳转到对应的二维码页面
        if (this.userInfo && this.userInfo.role) {
          if (this.userInfo.role === 4) {
            // 角色4用户跳转到role4页面
            uni.redirectTo({
              url: '/pages/main/role4'
            });
          } else {
            // 其他用户跳转到role1页面
            uni.redirectTo({
              url: '/pages/main/role1'
            });
          }
        } else {
          uni.showToast({
            title: '正在加载用户信息...',
            icon: 'none'
          });
        }
      } else if (tabName === 'manage') {
        // 管理页面根据用户角色跳转
        if (this.userInfo && this.userInfo.role) {
          if (this.userInfo.role === 4) {
            uni.redirectTo({
              url: '/pages/main/manage'
            });
          } else {
            // 其他角色没有管理页面
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
        // 审核页面跳转到feature页面
        uni.redirectTo({
          url: '/pages/main/feature'
        });
      }
    },
    handleLogout() {
      // 清除本地存储的token和用户信息
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');

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

.profile-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  padding: 40rpx 40rpx 140rpx; /* 增加顶部边距，使整体内容下移 */
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-sizing: border-box;
  overflow: hidden; /* 防止出现滚动条 */
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
  margin-bottom: 40rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
  border: 4rpx solid #fff;
}

.avatar-text {
  font-size: 48rpx;
  color: white;
  font-weight: bold;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.user-role {
  font-size: 28rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  color: white;
}

.role-admin {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
}

.role-manager {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.role-user {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  color: #333;
}

.role-unknown {
  background: #c0c0c0;
}

.profile-content {
  margin-bottom: 20rpx;
}

.info-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  padding: 20rpx 20rpx 10rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.value {
  font-size: 28rpx;
  color: #333;
  text-align: right;
  flex: 1;
  margin-left: 20rpx;
  word-break: break-all;
  text-align: right;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40vh;
  font-size: 28rpx;
  color: #999;
}


.action-cards {
  display: flex;
  width: 80%;
  margin: 20rpx auto;
}

.action-cards .action-card:not(:last-child) {
  margin-right: 40rpx;
}

.action-card {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.action-card:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 10rpx rgba(102, 126, 234, 0.5);
}

.action-text {
  color: #fff;
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

.form-group-profile {
  margin-bottom: 30rpx;
}

.form-group-profile label {
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

.logout-btn {
  margin: 20rpx auto 0;
  width: 80%;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 107, 0.3);
  transition: all 0.3s ease;
}

.logout-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 10rpx rgba(255, 107, 107, 0.5);
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