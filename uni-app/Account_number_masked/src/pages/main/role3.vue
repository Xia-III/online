<template>
  <view class="feature-container">
    <!-- 顶部搜索和添加区域 -->
    <view class="top-section">
      <view class="search-box">
        <input
          type="text"
          placeholder="搜索用户..."
          v-model="searchKeyword"
          @confirm="onSearch"
          class="search-input"
        />
        <button class="search-btn" @click="onSearch">搜索</button>
      </view>
      <!-- 只有角色为2或3的用户才能看到添加按钮 -->
      <button class="add-btn" @click="onAdd">+</button>
    </view>

    <!-- 全部解码数显示 -->
    <view class="total-masked-count">
      <text class="total-count-text">全部解码数: {{ totalMaskedCount }}</text>
    </view>

    <!-- 管理员列表 -->
    <view class="admin-list">
      <view
        class="admin-card"
        :class="{'admin-card-active': admin.status === 1, 'admin-card-inactive': admin.status === 0}"
        v-for="admin in adminList"
        :key="admin.userId"
      >
        <view class="card-header" @click="showUserHistory(admin)">
          <view class="user-info">
            <text class="username">{{ admin.username || admin.accountNumber }}</text>
            <text class="masked-count">解码总数: {{ admin.maskedCount || 0 }}</text>
          </view>
          <view class="dropdown-container" @click.stop="toggleSubUsers(admin)">
            <text class="dropdown-icon" :class="{ 'loading': admin.loadingSubUsers }">{{ admin.loadingSubUsers ? '◉' : (admin.showSubUsers ? '▲' : '▼') }}</text>
          </view>
          <button class="detail-btn" @click.stop="showAdminDetail(admin)">详情</button>
        </view>

        <!-- 子用户列表 -->
        <view v-if="admin.showSubUsers" class="sub-users-list">
          <view
            class="sub-user-card"
            v-for="subUser in admin.subUsers"
            :key="subUser.userId"
          >
            <view class="sub-user-info" @click="showUserHistory(subUser)">
              <text class="sub-username">{{ subUser.username || subUser.accountNumber }}</text>
              <text class="sub-masked-count">解码次数: {{ subUser.maskedCount || 0 }}</text>
            </view>
            <button class="sub-detail-btn" @click.stop="showAdminDetail(subUser)">详情</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加用户弹窗 -->
    <view v-if="showAddForm" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">添加用户</text>
        <view class="form-group">
          <label>账号 *</label>
          <input
            type="text"
            placeholder="请输入账号"
            v-model="newUser.account"
            class="form-input"
          />
        </view>
        <view class="form-group">
          <label>密码 *</label>
          <input
            type="text"
            placeholder="请输入密码"
            v-model="newUser.password"
            class="form-input"
          />
        </view>
        <view class="form-group">
          <label>昵称</label>
          <input
            type="text"
            placeholder="请输入昵称（可选）"
            v-model="newUser.nickname"
            class="form-input"
          />
        </view>
        <view class="form-buttons">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-submit" @click="submitUser">提交</button>
        </view>
      </view>
    </view>

    <!-- 管理员详情弹窗 -->
    <view v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <view class="modal-content detail-modal" @click.stop>
        <text class="modal-title">管理员详情</text>
        <view class="detail-info">
          <view class="info-row">
            <text class="label">用户ID:</text>
            <text class="value">{{ selectedAdmin.userId }}</text>
          </view>
          <view class="info-row">
            <text class="label">账号:</text>
            <text class="value">{{ selectedAdmin.accountNumber }}</text>
          </view>
          <view class="info-row">
            <text class="label">密码:</text>
            <text class="value">{{ selectedAdmin.password }}</text>
          </view>
          <view class="info-row">
            <text class="label">用户名:</text>
            <text class="value">{{ selectedAdmin.username || '未设置用户名' }}</text> 
          </view>
          <view class="info-row">
            <text class="label">角色:</text>
            <text class="value">{{ selectedAdmin.role === 2 ? '管理员' : (selectedAdmin.role === 3 ? '超级管理员' : '普通用户') }}</text>
          </view>
          <view class="info-row" v-if="selectedAdmin.role !== 2">
            <text class="label">授权管理员ID:</text>
            <text class="value">{{ selectedAdmin.authoizeAdminId }}</text>
          </view>
          <view class="info-row">
            <text class="label">状态:</text>
            <text class="value" :style="{ color: selectedAdmin.status === 1 ? '#67C23A' : '#F56C6C' }">
              {{ selectedAdmin.status === 1 ? '正常' : '禁用' }}
            </text>
          </view>
          <view class="info-row">
            <text class="label">密码:</text>
            <text class="value">{{ selectedAdmin.password }}</text>
          </view>
          <view class="info-row">
            <text class="label">创建时间:</text>
            <text class="value">{{ formatDate(selectedAdmin.createTime).date }} <text class="time-part">{{ formatDate(selectedAdmin.createTime).time }}</text></text>
          </view>
        </view>
        <view class="form-buttons">
          <button class="btn-update" @click="updateAdmin">修改</button>
          <button
            class="btn-toggle-status"
            :style="{ backgroundColor: selectedAdmin.status === 1 ? '#f56c6c' : '#67c23a' }"
            @click="toggleStatus"
          >
            {{ selectedAdmin.status === 1 ? '禁用' : '解禁' }}
          </button>
          <button class="btn-delete" @click="deleteAdmin">删除</button>
        </view>
      </view>
    </view>

    <!-- 修改用户信息弹窗 -->
    <view v-if="showUpdateModal" class="modal-overlay" @click="closeUpdateModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">修改用户信息</text>
        <view class="form-group">
          <label>用户名</label>
          <input
            type="text"
            placeholder="请输入用户名"
            v-model="updateForm.username"
            class="form-input"
          />
        </view>
        <view class="form-group">
          <label>密码</label>
          <input
            type="text"
            placeholder="请输入密码"
            v-model="updateForm.password"
            class="form-input"
          />
        </view>
        <view class="form-buttons">
          <button class="btn-cancel" @click="closeUpdateModal">取消</button>
          <button class="btn-submit" @click="submitUpdate">提交</button>
        </view>
      </view>
    </view>

    <!-- 用户历史记录弹窗 -->
    <view v-if="showHistoryModal" class="modal-overlay" @click="closeHistoryModal">
      <view class="modal-content history-modal" @click.stop>
        <text class="modal-title">{{ selectedUser.username || selectedUser.accountNumber }}的历史记录</text>
        <view class="history-list" v-if="selectedUserHistory && selectedUserHistory.length > 0">
          <view
            class="history-card"
            v-for="record in selectedUserHistory"
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
        <view class="form-buttons">
          <button class="btn-submit" @click="closeHistoryModal">关闭</button>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <view class="tab-bar">
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
    </view>
  </view>
</template>

<script>
import { post, get, del, put } from '@/utils/request.js';

export default {
  data() {
    return {
      activeTab: 'manage', // 默认激活管理标签
      searchKeyword: '',    // 搜索关键词
      showAddForm: false,   // 控制添加表单显示
      showDetailModal: false, // 控制详情弹窗显示
      showUpdateModal: false, // 控制修改弹窗显示
      selectedAdmin: {},    // 选中的管理员详情
      updateForm: {         // 修改表单数据
        username: '',
        password: ''
      },
      adminList: [],        // 管理员列表
      currentUserRole: 3, // 角色3
      totalMaskedCount: 0,  // 全部解码数
      showHistoryModal: false, // 控制历史记录弹窗显示
      selectedUser: {}, // 选中的用户信息
      selectedUserHistory: [], // 选中用户的历史记录
      newUser: {            // 新用户数据
        account: '',
        password: '',
        nickname: ''
      }
    }
  },
  created() {
    // 组件创建时立即获取管理员列表和全部解码数
    this.fetchAdminList();
    this.fetchTotalMaskedCount();
  },
  methods: {
    switchTab(tabName) {
      this.activeTab = tabName;

      if (tabName === 'profile') {
        // 跳转到个人资料页面
        uni.redirectTo({
          url: '/pages/main/profile'
        });
      } else if (tabName === 'decode') {
        // 跳转到解码页面（role1页面）
        uni.redirectTo({
          url: '/pages/main/role1'
        });
      } else if (tabName === 'manage') {
        // 当前就是管理页面（role3页面），无需跳转
        return;
      } else if (tabName === 'history') {
        // 跳转到历史页面（feature页面）
        uni.redirectTo({
          url: '/pages/main/feature'
        });
      }
    },
    onLoad() {
      // 页面加载时获取管理员列表
      this.fetchAdminList();
    },

    onShow() {
      // 页面每次显示时都刷新管理员列表和全部解码数
      this.fetchAdminList();
      this.fetchTotalMaskedCount();
    },

    async fetchAdminList() {
      try {
        // 获取管理员列表
        // 如果有搜索关键词，则按用户名搜索；否则获取所有管理员
        let params = {};
        if (this.searchKeyword && this.searchKeyword.trim() !== '') {
          params = { username: this.searchKeyword.trim() };
        }

        const response = await get('/api/User/FindAdminByUsername', params);

        if (response.code === 0) {
          // 初始化管理员列表
          let adminList = response.data || [];

          // 为每个管理员获取解码次数
          for (let i = 0; i < adminList.length; i++) {
            const admin = adminList[i];

            try {
              // 获取解码次数
              const maskedResponse = await post(`/api/Masked/FindAdminCount?UserId=${admin.userId}&Role=${admin.role}`);

              if (maskedResponse.code === 0) {
                // 添加解码次数到管理员数据
                admin.maskedCount = maskedResponse.data || 0;
              } else {
                // 如果获取解码次数失败，默认为0
                admin.maskedCount = 0;
              }
            } catch (error) {
              console.error(`获取用户 ${admin.userId} 的解码次数失败:`, error);
              // 如果请求出错，默认解码次数为0
              admin.maskedCount = 0;
            }
          }

          // 初始化管理员列表，添加子用户相关属性
          const initializedAdminList = adminList.map(admin => {
            return {
              ...admin,
              showSubUsers: false, // 是否显示子用户列表
              subUsers: null // 子用户列表
            };
          });

          this.adminList = initializedAdminList;
          console.log('管理员列表获取成功:', this.adminList); // 添加调试信息

          // 获取管理员列表后，更新全部解码数
          await this.fetchTotalMaskedCount();
        } else {
          uni.showToast({
            title: response.msg || '获取管理员列表失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取管理员列表失败:', error);
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    },

    async fetchTotalMaskedCount() {
      try {
        // 获取全部解码数
        // 请求路径: /api/Masked/FindAdminCount
        // 请求方式: post
        // 不需要传递参数
        const response = await post('/api/Masked/FindAdminCount');

        if (response.code === 0) {
          this.totalMaskedCount = response.data || 0;
          console.log('全部解码数获取成功:', this.totalMaskedCount);
        } else {
          console.error('获取全部解码数失败:', response.msg);
        }
      } catch (error) {
        console.error('获取全部解码数请求失败:', error);
      }
    },

    async onSearch() {
      // 处理搜索逻辑
      console.log('搜索:', this.searchKeyword);
      await this.fetchAdminList();
      await this.fetchTotalMaskedCount(); // 搜索后也更新全部解码数
    },
    onAdd() {
      // 显示添加用户表单
      this.showAddForm = true;
      // 重置表单数据
      this.newUser = {
        account: '',
        password: '',
        nickname: ''
      };
    },
    closeModal() {
      // 关闭弹窗
      this.showAddForm = false;
    },
    async submitUser() {
      // 验证必填字段
      if (!this.newUser.account) {
        uni.showToast({
          title: '请输入账号',
          icon: 'none'
        });
        return;
      }

      if (!this.newUser.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        });
        return;
      }

      try {
        // 发送请求 - 使用新的API路径和参数传递方式
        const response = await post(`/api/User/AddAdmin?accountNumber=${encodeURIComponent(this.newUser.account)}&password=${encodeURIComponent(this.newUser.password)}&username=${encodeURIComponent(this.newUser.nickname)}`);

        // 提交成功
        uni.showToast({
          title: '用户添加成功',
          icon: 'success'
        });

        // 关闭表单
        this.showAddForm = false;

        // 重新获取用户列表
        this.fetchAdminList();
        this.fetchTotalMaskedCount();
      } catch (error) {
        console.error('提交用户失败:', error);
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        });
      }
    },
    showAdminDetail(admin) {
      // 显示管理员详情
      this.selectedAdmin = admin;
      this.showDetailModal = true;
    },

    closeDetailModal() {
      // 关闭详情弹窗
      this.showDetailModal = false;
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

    async deleteAdmin() {
      // 先关闭详情弹窗以避免层级问题
      this.closeDetailModal();

      // 确认删除操作
      uni.showModal({
        title: '确认删除',
        content: `确定要删除用户 "${this.selectedAdmin.username || this.selectedAdmin.accountNumber}" 吗？`,
        confirmText: '确定',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            try {
              // 发送删除请求，使用查询参数传递userId
              const response = await del(`/api/User/DeleteById?userId=${this.selectedAdmin.userId}`);

              if (response.code === 0) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                });

                // 重新获取管理员列表
                this.fetchAdminList();
              } else {
                uni.showToast({
                  title: response.msg || '删除失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              console.error('删除管理员失败:', error);
              uni.showToast({
                title: '删除失败，请重试',
                icon: 'none'
              });
            }
          } else {
            // 如果用户取消删除，重新打开详情弹窗
            this.showAdminDetail(this.selectedAdmin);
          }
        }
      });
    },

    updateAdmin() {
      // 填充修改表单数据
      this.updateForm = {
        username: this.selectedAdmin.username || '',
        password: this.selectedAdmin.password || ''
      };

      // 关闭详情弹窗，打开修改弹窗
      this.closeDetailModal();
      this.showUpdateModal = true;
    },

    closeUpdateModal() {
      // 关闭修改弹窗
      this.showUpdateModal = false;
    },

    async submitUpdate() {
      // 验证必填字段
      if (!this.updateForm.username) {
        uni.showToast({
          title: '请输入用户名',
          icon: 'none'
        });
        return;
      }

      if (!this.updateForm.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        });
        return;
      }

      try {
        // 发送修改请求
        const response = await put(`/api/User/UpdateUser?UserId=${this.selectedAdmin.userId}&Username=${encodeURIComponent(this.updateForm.username)}&Password=${encodeURIComponent(this.updateForm.password)}`);

        if (response.code === 0) {
          uni.showToast({
            title: '修改成功',
            icon: 'success'
          });

          // 关闭修改弹窗
          this.closeUpdateModal();

          // 重新获取管理员列表
          this.fetchAdminList();
        } else {
          uni.showToast({
            title: response.msg || '修改失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('修改用户信息失败:', error);
        uni.showToast({
          title: '修改失败，请重试',
          icon: 'none'
        });
      }
    },

    async toggleStatus() {
      // 先关闭详情弹窗以避免层级问题
      this.closeDetailModal();

      uni.showModal({
        title: '确认操作',
        content: `确定要${this.selectedAdmin.status === 1 ? '禁用' : '解禁'}用户"${this.selectedAdmin.username || this.selectedAdmin.accountNumber}"吗？`,
        confirmText: '确定',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            try {
              // 发送切换状态请求
              // 根据用户当前状态切换（1为正常，0为禁用）
              const newStatus = this.selectedAdmin.status === 1 ? 0 : 1;
              const response = await put(`/api/User/UpdateUserStatus?userId=${this.selectedAdmin.userId}&status=${newStatus}`);

              if (response.code === 0) {
                uni.showToast({
                  title: this.selectedAdmin.status === 1 ? '禁用成功' : '解禁成功',
                  icon: 'success'
                });

                // 重新获取管理员列表
                this.fetchAdminList();
              } else {
                uni.showToast({
                  title: response.msg || (this.selectedAdmin.status === 1 ? '禁用失败' : '解禁失败'),
                  icon: 'none'
                });
              }
            } catch (error) {
              console.error(this.selectedAdmin.status === 1 ? '禁用' : '解禁', '用户失败:', error);
              uni.showToast({
                title: this.selectedAdmin.status === 1 ? '禁用失败，请重试' : '解禁失败，请重试',
                icon: 'none'
              });
            }
          } else {
            // 如果用户取消操作，重新打开详情弹窗
            this.showAdminDetail(this.selectedAdmin);
          }
        }
      });
    },

    async showUserHistory(user) {
      try {
        // 保存选中的用户信息
        this.selectedUser = user;

        // 发送请求获取用户历史记录
        // 请求路径: /api/Masked/FindAll?userId=005
        // 请求方式: post
        // 注意参数传递方式
        const response = await post(`/api/Masked/FindAll?userId=${encodeURIComponent(user.userId)}`);

        if (response.code === 0) {
          this.selectedUserHistory = response.data || [];
          this.showHistoryModal = true;
        } else {
          uni.showToast({
            title: response.msg || '获取历史记录失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取用户历史记录失败:', error);
        uni.showToast({
          title: '获取历史记录失败，请重试',
          icon: 'none'
        });
      }
    },

    closeHistoryModal() {
      this.showHistoryModal = false;
      this.selectedUserHistory = [];
    },

    async toggleSubUsers(user) {
      // 如果还没有加载子用户信息，则加载
      if (!user.subUsers) {
        // 检查是否已经在加载中
        if (user.loadingSubUsers) {
          return; // 如果正在加载，则不执行任何操作
        }

        await this.loadSubUsers(user);
      }

      // 切换显示/隐藏子用户列表
      this.$set(user, 'showSubUsers', !user.showSubUsers);
    },

    async loadSubUsers(user) {
      // 设置加载状态，防止重复点击
      this.$set(user, 'loadingSubUsers', true);

      try {
        uni.showLoading({
          title: '加载子用户中...'
        });

        // 发送请求获取子用户信息
        // 请求路径: /api/User/FindUserByUsername?userId=03
        // 请求方式: get
        // 参数传递方式: 通过URL查询参数传递
        const response = await get(`/api/User/FindUserByUsername?userId=${encodeURIComponent(user.userId)}`);

        if (response.code === 0) {
          // 初始化子用户的显示状态
          const subUsers = response.data || [];
          subUsers.forEach(subUser => {
            subUser.maskedCount = 0; // 默认解码次数为0，后续可以获取
          });

          // 设置子用户信息
          this.$set(user, 'subUsers', subUsers);

          // 同时获取每个子用户的解码次数
          await this.loadSubUsersMaskedCounts(user);
        } else {
          uni.showToast({
            title: response.msg || '获取子用户失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取子用户失败:', error);
        uni.showToast({
          title: '获取子用户失败，请重试',
          icon: 'none'
        });
      } finally {
        // 移除加载状态
        this.$set(user, 'loadingSubUsers', false);
        uni.hideLoading();
      }
    },

    async loadSubUsersMaskedCounts(user) {
      // 为每个子用户获取解码次数
      if (user.subUsers && user.subUsers.length > 0) {
        for (let i = 0; i < user.subUsers.length; i++) {
          const subUser = user.subUsers[i];
          try {
            const response = await post(`/api/Masked/FindAdminCount?UserId=${subUser.userId}&Role=${subUser.role}`);

            if (response.code === 0) {
              this.$set(subUser, 'maskedCount', response.data || 0);
            } else {
              this.$set(subUser, 'maskedCount', 0);
            }
          } catch (error) {
            console.error(`获取子用户 ${subUser.userId} 的解码次数失败:`, error);
            this.$set(subUser, 'maskedCount', 0);
          }
        }
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
  width: calc(100% - 80rpx); /* 与管理员卡片宽度一致，减去容器的左右padding */
}

.total-count-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #409eff;
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

.picker {
  width: 100%;
  height: 60rpx;
  line-height: 60rpx;
  padding: 0 20rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 10rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  background-color: #f9f9f9;
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

.btn-update {
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  margin: 0 10rpx;
  flex: 1;
}

.btn-toggle-status {
  color: white;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  margin: 0 10rpx;
  flex: 1;
}

.btn-delete {
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  margin: 0 10rpx;
  flex: 1;
}

/* 管理员列表样式 */
.admin-list {
  width: 100%;
  margin-bottom: 30rpx;
  overflow-y: auto; /* 仅在列表区域出现滚动条 */
  max-height: calc(100vh - 470rpx); /* 根据实际需要调整高度，减去其他元素的高度，包括增加的顶部padding */
}

.admin-card {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.admin-card-active {
  background-color: #f0f9eb; /* 浅绿色背景，表示正常状态 */
}

.admin-card-inactive {
  background-color: #fef0ef; /* 浅红色背景，表示禁用状态 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-info .username {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.user-info .masked-count {
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}


.detail-btn {
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  line-height: 1;
}

.detail-modal {
  width: 85%;
  max-height: 80vh;
  overflow-y: auto;
}

.detail-info {
  margin-top: 20rpx;
}

.info-row {
  display: flex;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.info-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.label {
  width: 200rpx;
  font-size: 28rpx;
  color: #666;
  flex-shrink: 0;
}

.value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  word-break: break-all;
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

/* 下拉指示符样式 */
.dropdown-container {
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
}

.dropdown-icon {
  font-size: 32rpx;
  color: #999;
  transition: transform 0.3s ease;
}

.dropdown-icon.loading {
  color: #667eea; /* 加载时改变颜色 */
  animation: spin 1s linear infinite; /* 添加旋转动画 */
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 子用户列表样式 */
.sub-users-list {
  margin-top: 20rpx;
  padding-left: 40rpx;
  border-left: 2rpx solid #eee;
}

.sub-user-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 15rpx;
}

.sub-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sub-username {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.sub-masked-count {
  font-size: 24rpx;
  color: #999;
  margin-top: 5rpx;
}

.sub-detail-btn {
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 10rpx 15rpx;
  font-size: 24rpx;
  line-height: 1;
  margin-left: 10rpx;
}

/* 历史记录列表样式 */
.history-list {
  width: 100%;
  max-width: 600rpx;
  margin-bottom: 30rpx;
  max-height: 400rpx;
  overflow-y: auto;
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

.history-modal {
  max-height: 80vh;
  overflow-y: auto;
}
</style>