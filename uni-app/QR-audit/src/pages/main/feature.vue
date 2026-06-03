<template>
  <view class="feature-container" :class="{ 'modal-open': showRecordDetailModal }">
    <!-- 搜索和筛选区域 -->
    <view class="search-filter-section">
      <view class="search-box">
        <input
          type="text"
          placeholder="搜索..."
          v-model="searchKeyword"
          @confirm="onSearch"
          class="search-input"
        />
        <button class="search-btn" @click="onSearch">搜索</button>
      </view>

      <!-- 筛选选项 -->
      <view class="filter-options">
        <view class="filter-buttons">
          <button
            class="filter-btn"
            :class="{ 'active': selectedIsAuditedIndex === 0 }" 
            @click="setAuditedFilter(0)"
          >
            全部
          </button>
          <button
            class="filter-btn"
            :class="{ 'active': selectedIsAuditedIndex === 1 }"
            @click="setAuditedFilter(1)"
          >
            待审核
          </button>
        </view>

        <!-- 批量操作按钮，仅在待审核状态下显示 -->
        <view v-if="selectedIsAuditedIndex === 1" class="batch-actions">
          <view class="button-row">
            <button class="batch-audit-btn" @click="showAuditTypeSelection" :disabled="selectedRecords.length === 0">
              批量审核({{ selectedRecords.length }})
            </button>
            <button class="one-click-audit-btn" @click="showOneClickAuditConfirmation">
              一键审核
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 记录数显示 -->
    <view class="total-masked-count">
      <text class="total-count-text">记录数量: {{ totalMaskedCount }}</text> 
    </view>

    <!-- 审核记录列表 -->
    <view class="history-list" v-if="historyRecords && historyRecords.length > 0">
      <view
        class="history-card"
        v-for="record in historyRecords"
        :key="record.scanBillId"
        @click="showRecordDetails(record)"
      >
        <!-- 复选框列，仅在待审核状态下显示 -->
        <view v-if="selectedIsAuditedIndex !== 0" class="select-checkbox" @click.stop="toggleSelectRecord(record)">
          <view
            class="checkbox"
            :class="{ checked: isSelected(record) }"
          >
            <text v-if="isSelected(record)" class="checkmark">✓</text>
          </view>
        </view>
        <view class="record-info-full">
          <text class="record-nickname">{{ record.nickName }}</text>
          <text class="record-separator"> | </text>
          <text class="record-coins">币数 {{ Math.floor(record.coins / 100) }}</text>
          <text class="record-separator"> | </text>
          <text class="record-status">
            <text class="status-main" :style="{ color: record.isAudited ? '#409EFF' : '#E6A23C' }">
              {{ record.isAudited ? '已审核' : '未审核' }}
            </text>
            <text v-if="record.isAudited" class="status-separator">-</text>
            <text v-if="record.isAudited" class="status-result" :style="{ color: record.isSuccess ? '#67C23A' : '#F56C6C' }">
              {{ record.isSuccess ? '通过' : '拒绝' }}
            </text>
          </text>
        </view>
        <view class="record-time-right">
          <text class="record-time-text">{{ formatDate(record.creationTime).date }} {{ formatDate(record.creationTime).time }}</text>
        </view>
      </view>
    </view>
    <view v-else class="no-history">
      <text class="no-history-text">暂无审核记录</text>
    </view>

    <!-- 记录详情弹窗 -->
    <view v-if="showRecordDetailModal" class="modal-overlay" @click="closeRecordDetailModal">
      <view class="modal-content detail-modal" @click.stop>
        <text class="modal-title">记录详情</text>
        <scroll-view class="detail-info" scroll-y="true">
          <view class="info-row">
            <text class="label">扫描账单ID:</text>
            <text class="value">{{ selectedRecord.scanBillId }}</text>
          </view>
          <view class="info-row">
            <text class="label">金币:</text>
            <text class="value">{{ selectedRecord.coins }}</text>
          </view>
          <view class="info-row">
            <text class="label">创建时间:</text>
            <text class="value">{{ selectedRecord.creationTime }}</text>
          </view>
          <view class="info-row">
            <text class="label">过期时间:</text>
            <text class="value">{{ selectedRecord.expireTime }}</text>
          </view>
          <view class="info-row">
            <text class="label">地址ID:</text>
            <text class="value">{{ selectedRecord.addressId }}</text>
          </view>
          <view class="info-row">
            <text class="label">机构ID:</text>
            <text class="value">{{ selectedRecord.agencyId }}</text>
          </view>
          <view class="info-row">
            <text class="label">玩家ID:</text>
            <text class="value">{{ selectedRecord.playerId }}</text>
          </view>
          <view class="info-row">
            <text class="label">是否审核:</text>
            <text class="value" :style="{ color: selectedRecord.isAudited ? '#67C23A' : '#F56C6C' }">
              {{ selectedRecord.isAudited ? '是' : '否' }}
            </text>
          </view>
          <view class="info-row">
            <text class="label">是否成功:</text>
            <text class="value" :style="{ color: selectedRecord.isSuccess ? '#67C23A' : '#F56C6C' }">
              {{ selectedRecord.isSuccess ? '是' : '否' }}
            </text>
          </view>
          <view class="info-row">
            <text class="label">审核时间:</text>
            <text class="value">{{ selectedRecord.auditedTime }}</text>
          </view>
          <view class="info-row">
            <text class="label">销售首页ID:</text>
            <text class="value">{{ selectedRecord.salesQRCodeId }}</text>
          </view>
          <view class="info-row">
            <text class="label">已用金币:</text>
            <text class="value">{{ selectedRecord.usedCoins }}</text>
          </view>
          <view class="info-row">
            <text class="label">头像:</text>
            <image class="avatar" :src="selectedRecord.avatar" v-if="selectedRecord.avatar" />
            <text class="value" v-else>无头像</text>
          </view>
          <view class="info-row">
            <text class="label">昵称:</text>
            <text class="value">{{ selectedRecord.nickName }}</text>
          </view>
        </scroll-view>
        <view class="form-buttons">
          <button class="btn-submit" @click="closeRecordDetailModal">关闭</button>
        </view>
      </view>
    </view>

    <!-- 审核类型选择弹窗 -->
    <view v-if="showAuditTypeSelectionModal" class="modal-overlay" @click="showAuditTypeSelectionModal = false">
      <view class="modal-content audit-type-selection-modal" @click.stop>
        <text class="modal-title">选择审核操作</text>
        <view class="audit-type-buttons">
          <button class="audit-pass-btn" @click="performDirectAudit(true)">通过</button>
          <button class="audit-reject-btn" @click="performDirectAudit(false)">拒绝</button>
        </view>
      </view>
    </view>


    <!-- 分页控件 -->
    <view class="pagination" v-if="pagination.totalCount > 0">
      <button
        class="pagination-btn"
        :disabled="pagination.currentPage <= 1"
        @click="changePage(pagination.currentPage - 1)"
      >
        上一页
      </button>
      <text class="pagination-info">
        第 {{ pagination.currentPage }} 页，共 {{ Math.ceil(pagination.totalCount / pagination.pageSize) }} 页
      </text>
      <button
        class="pagination-btn"
        :disabled="pagination.currentPage >= Math.ceil(pagination.totalCount / pagination.pageSize)"
        @click="changePage(pagination.currentPage + 1)"
      >
        下一页
      </button>
    </view>

    <!-- 底部导航栏 -->
    <view class="tab-bar">
      <!-- 角色4: 首页、审核、管理、个人 -->
      <block v-if="currentUserRole === 4">
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

      <!-- 其他角色(包括role=2): 首页、个人 -->
      <block v-else-if="currentUserRole">
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
import { post } from '@/utils/request.js';

export default {
  data() {
    return {
      activeTab: 'history', // 默认激活审核标签
      currentUserRole: null, // 当前用户角色
      totalMaskedCount: 0,  // 全部记录数
      selectedTimeRange: 0, // 选中的时间范围，默认为全部(索引0)
      historyRecords: [],   // 审核记录
      timeRanges: ['全部', '今天', '过去7天', '过去30天'], // 时间范围选项
      isLoading: false, // 是否正在加载数据 
      searchKeyword: '',    // 搜索关键词
      pagination: {          // 分页信息
        currentPage: 1,
        pageSize: 4,
        totalCount: 0
      },
      isAudited: null,      // 审核状态筛选
      addressId: null,       // 地址ID
      selectedIsAuditedIndex: 0, // 选中的审核状态索引
      showRecordDetailModal: false, // 是否显示记录详情弹窗
      selectedRecord: {}, // 选中的记录详情
      selectedRecords: [], // 批量选择的记录
      showAuditTypeSelectionModal: false, // 是否显示审核类型选择弹窗
      autoRefreshTimer: null // 自动刷新定时器
    }
  },
  onLoad() {
    // 隐藏顶部电池,时间等信息（仅在App环境中可用）
    if (typeof plus !== 'undefined') {
      plus.navigator.setFullscreen(true);
    }
    // 页面加载时获取当前用户角色
    this.getCurrentUserRole();
    // 获取用户信息以获取地址ID
    this.getUserInfo();

    // 启动自动刷新定时器（每5分钟刷新一次）
    this.startAutoRefresh();
  },

  onShow() {
    this.fetchTotalMaskedCount();
    // 页面显示时再次检查用户角色，以防万一
    if (!this.currentUserRole) {
      this.getCurrentUserRole();
    }
  },

  onUnload() {
    // 页面卸载时清理自动刷新定时器
    this.clearAutoRefresh();
  },

  methods: {
    // 启动自动刷新定时器
    startAutoRefresh() {
      // 清理可能存在的旧定时器
      this.clearAutoRefresh();

      // 设置新的定时器，每5分钟(300000毫秒)刷新一次数据
      this.autoRefreshTimer = setInterval(() => {
        this.fetchTotalMaskedCount();
      }, 5 * 60 * 1000); // 5分钟 = 5 * 60 * 1000 毫秒 
    },

    // 清理自动刷新定时器
    clearAutoRefresh() {
      console.log('清理自动刷新定时器');
      if (this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer);
        this.autoRefreshTimer = null;
      }
    },

    getCurrentUserRole() {
      // 从本地存储获取用户信息或token，然后获取角色
      // 这里假设用户信息存储在本地存储中
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo && userInfo.role) {
        this.currentUserRole = userInfo.role;
      } else {
        // 如果本地没有存储用户信息，尝试从token获取用户信息
        this.fetchUserInfo();
      }
    },

    getUserInfo() {
      // 从本地存储获取用户信息以获取地址ID
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo && userInfo.addressId) {
        this.addressId = userInfo.addressId;
        // 获取数据
        this.fetchTotalMaskedCount();
      } else {
        // 如果本地没有存储用户信息，可能需要从API获取
        // 这里可以调用获取用户信息的API
        this.fetchUserInfoForAddress();
      }
    },

    async fetchUserInfoForAddress() {
      try {
        // 获取用户信息以获取地址ID
        // 这里应该调用获取用户信息的API
        // 示例: const response = await get('/api/User/UserInfo');
        // this.addressId = response.data.addressId;

        // 由于没有具体API，暂时模拟获取地址ID
        // 实际项目中应替换为真实的API调用
        console.log('获取用户信息以获取地址ID...');
      } catch (error) {
        console.error('获取用户信息失败:', error);
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
        // 根据用户角色跳转到对应的首页页面
        if (this.currentUserRole === 4) {
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
      } else if (tabName === 'manage') {
        // 管理页面跳转到role2页面
        uni.redirectTo({
          url: '/pages/main/role2'
        });
      } else if (tabName === 'history') {
        // 当前就是审核页面，无需跳转
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

    onSearch() {
      // 搜索操作，重置到第一页并获取数据
      this.pagination.currentPage = 1;
      this.fetchTotalMaskedCount();
      // 重置自动刷新定时器
      this.startAutoRefresh();
    },

    onIsAuditedChange(e) {
      const index = parseInt(e.detail.value);
      this.selectedIsAuditedIndex = index;
      // 设置 isAudited 值：0-全部，1-待审核(false，即isAudited为false)
      if (index === 0) {
        this.isAudited = null; // 全部
      } else if (index === 1) {
        this.isAudited = false; // 待审核（即isAudited为false）
      }
      // 重置到第一页并获取数据
      this.pagination.currentPage = 1;
      this.fetchTotalMaskedCount();
    },

    setAuditedFilter(index) {
      this.selectedIsAuditedIndex = index;
      // 设置 isAudited 值：0-全部，1-待审核(false，即isAudited为false)
      if (index === 0) {
        this.isAudited = null; // 全部
      } else if (index === 1) {
        this.isAudited = false; // 待审核（即isAudited为false）
      }
      // 重置到第一页并获取数据
      this.pagination.currentPage = 1;
      this.fetchTotalMaskedCount();
      // 重置自动刷新定时器
      this.startAutoRefresh();
    },

    async fetchTotalMaskedCount() {
      // 防止重复请求
      if (this.isLoading) return;

      this.isLoading = true;
      uni.showLoading({
        title: '加载中...'
      });

      try {
        // 获取审核记录 - 使用新的API
        const params = {
          pageSize: this.pagination.pageSize,
          currentPage: this.pagination.currentPage,
          kw: this.searchKeyword || "",
          isDeleted: 0,
          status: 0,
          isAudited: this.isAudited, // 审核状态筛选
          addressId: this.addressId || 0 // 地址ID
        };

        const response = await post('/api/v2/ScanBill/ScanBillList', params, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        if (response.code === 200) {
          // 根据响应结构处理数据
          if (Array.isArray(response.data)) {
            // 如果返回的是数组，则是审核记录列表
            this.historyRecords = response.data;
            this.totalMaskedCount = response.totalCount || 0; // 使用totalCount作为总数
            this.pagination.totalCount = response.totalCount || 0;
          } else {
            // 如果返回的是数字或其他格式，清空审核记录
            this.totalMaskedCount = response.totalCount || 0;
            this.historyRecords = []; // 清空审核记录
            this.pagination.totalCount = response.totalCount || 0;
          }
          console.log('数据获取成功:', this.totalMaskedCount, this.historyRecords);
        } else {
          console.error('获取数据失败:', response.message);
          uni.showToast({
            title: response.message || '获取数据失败',
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

    // 分页相关方法
    async changePage(page) {
      if (page < 1 || page > Math.ceil(this.pagination.totalCount / this.pagination.pageSize)) {
        return; // 防止超出范围的页码
      }

      this.pagination.currentPage = page;
      await this.fetchTotalMaskedCount();
      // 重置自动刷新定时器
      this.startAutoRefresh();
    },

    // 显示记录详情
    showRecordDetails(record) {
      this.selectedRecord = record;
      this.showRecordDetailModal = true;
    },

    // 关闭记录详情弹窗
    closeRecordDetailModal() {
      this.showRecordDetailModal = false;
    },

    // 切换选择记录
    toggleSelectRecord(record) {
      const index = this.selectedRecords.findIndex(item => item.scanBillId === record.scanBillId);
      if (index > -1) {
        this.selectedRecords.splice(index, 1);
      } else {
        this.selectedRecords.push(record);
      }
    },

    // 检查记录是否已被选中
    isSelected(record) {
      return this.selectedRecords.some(item => item.scanBillId === record.scanBillId);
    },

    // 显示审核类型选择
    showAuditTypeSelection() {
      if (this.selectedRecords.length === 0) {
        uni.showToast({
          title: '请至少选择一条记录',
          icon: 'none'
        });
        return;
      }
      this.showAuditTypeSelectionModal = true;
    },

    // 直接执行审核
    async performDirectAudit(isSuccess) {
      if (this.selectedRecords.length === 0) {
        return;
      }

      uni.showLoading({
        title: '审核中...'
      });

      try {
        const scanBillIds = this.selectedRecords.map(record => record.scanBillId);
        const response = await post('/api/v2/ScanBill/AuditScanBill', {
          scanBillIds: scanBillIds,
          isSuccess: isSuccess
        }, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        if (response.code === 200) {
          uni.hideLoading();
          uni.showToast({
            title: `成功${isSuccess ? '通过' : '拒绝'} ${response.data.successCount} 条记录`,
            icon: 'success'
          });

          // 重新获取数据
          this.fetchTotalMaskedCount();

          // 清空选择
          this.selectedRecords = [];
          this.showAuditTypeSelectionModal = false;
        } else {
          uni.hideLoading();
          uni.showToast({
            title: response.message || '审核失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('批量审核请求失败:', error);
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    },

    // 显示一键审核确认弹窗
    showOneClickAuditConfirmation() {
      // 获取所有待审核记录的数量
      const pendingRecords = this.historyRecords.filter(record => !record.isAudited);
      const count = pendingRecords.length;

      // 显示确认弹窗
      uni.showModal({
        title: '一键审核',
        content: `确定要审核通过所有 ${count} 条待审核记录吗？`,
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          // 统一处理：左边按钮为取消，右边按钮为确定
          // 在uni.showModal中，cancel按钮在左，confirm按钮在右
          // 所以无论平台如何，我们都将左按钮视为取消，右按钮视为确定
          if (res.cancel) {
            // 用户点击了取消（左按钮）
            console.log('用户取消了一键审核');
          } else if (res.confirm) {
            // 用户点击了确定（右按钮）
            // 用户点击确定，执行一键审核通过操作
            this.performOneClickAudit(true);
          }
        }
      });
    },

    // 执行一键审核
    async performOneClickAudit(isSuccess) {
      // 获取所有待审核记录
      const pendingRecords = this.historyRecords.filter(record => !record.isAudited);

      if (pendingRecords.length === 0) {
        return;
      }

      uni.showLoading({
        title: '审核中...'
      });

      try {
        const scanBillIds = pendingRecords.map(record => record.scanBillId);
        const response = await post('/api/v2/ScanBill/AuditScanBill', {
          scanBillIds: scanBillIds,
          isSuccess: isSuccess
        }, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        if (response.code === 200) {
          uni.hideLoading();
          uni.showToast({
            title: `成功${isSuccess ? '通过' : '拒绝'} ${response.data.successCount} 条记录`,
            icon: 'success'
          });

          // 重新获取数据
          this.fetchTotalMaskedCount();

          // 注意：这里不修改this.selectedRecords，以避免影响批量审核功能
        } else {
          uni.hideLoading();
          uni.showToast({
            title: response.message || '审核失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        console.error('一键审核请求失败:', error);
        uni.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
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
  padding: 30rpx 40rpx 90rpx; /* 增加顶部边距，使整体内容下移 */
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


.select-checkbox {
  margin-right: 20rpx;
  flex-shrink: 0; /* 防止复选框被压缩 */
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.checkbox.checked {
  background-color: #667eea;
  border-color: #667eea;
}

.checkmark {
  color: white;
  font-size: 24rpx;
  line-height: 1;
}

.record-info-full {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center; /* 使内容居中 */
  font-size: 26rpx;
  color: #333;
  min-width: 0; /* 允许flex项目收缩到其内容的固有尺寸以下 */
  margin-right: 20rpx; /* 为时间留出空间 */
}

.record-nickname {
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1; /* 允许昵称部分扩展，但不超过可用空间 */
  min-width: 0; /* 允许收缩 */
  text-align: center; /* 使昵称文本居中 */
}

.record-separator {
  color: #ccc;
  margin: 0 10rpx;
  flex-shrink: 0;
}

.record-coins {
  color: #67C23A;
  flex-shrink: 0;
}

.record-status {
  flex-shrink: 0;
}

.status-main {
  font-weight: normal;
}

.status-separator {
  color: #ccc;
  margin: 0 5rpx;
  flex-shrink: 0;
}

.status-result {
  font-weight: normal;
}

.record-time-right {
  display: flex;
  align-items: center;
  margin-left: 20rpx;
  flex-shrink: 0;
  min-width: 180rpx;
  justify-content: flex-end;
}

.record-time-text {
  font-size: 24rpx;
  color: #666;
  text-align: right;
  white-space: nowrap;
}

/* 详情弹窗样式 */
.detail-modal {
  width: 85%;
  max-height: 60vh; /* 降低弹窗最大高度至60vh，约降低25% */
  overflow-y: auto;
}

.audit-type-selection-modal {
  width: 85%;
  max-height: 40vh;
  overflow-y: auto;
}

.detail-info {
  margin-top: 20rpx;
}


.audit-pass-btn, .audit-reject-btn {
  width: 100%;
  padding: 20rpx;
  border-radius: 10rpx;
  font-size: 32rpx;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.audit-pass-btn {
  background-color: #67C23A;
}

.audit-reject-btn {
  background-color: #F56C6C;
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

.avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
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

/* 搜索和筛选区域样式 */
.search-filter-section {
  width: calc(100% - 80rpx);
  margin: 0 auto 20rpx;
  background-color: #f0f9ff;
  border-radius: 15rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.05);
}

/* 搜索框样式 */
.search-box {
  display: flex;
  width: 100%;
  margin-bottom: 20rpx;
}

.search-input {
  flex: 1;
  height: 60rpx;
  padding: 0 20rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 30rpx 0 0 30rpx;
  font-size: 28rpx;
  background-color: #fff;
  box-sizing: border-box;
}


.filter-options {
  margin-top: 20rpx; 
}

.filter-item {
  flex: 1;
  margin: 0 10rpx;
}

.filter-label {
  display: block;
  font-size: 24rpx;
  margin-bottom: 10rpx;
  color: #666;
}

/* 筛选按钮样式 */
.filter-buttons {
  display: flex;
  gap: 10rpx; /* 缩小按钮之间的间距 */
  margin-top: 20rpx;
}

.filter-btn {
  flex: 1;
  padding: 15rpx 0;
  border-radius: 10rpx;
  background-color: #f0f0f0;
  color: #666;
  font-size: 26rpx; /* 稍微减小字体大小以适应按钮 */
  border: 1rpx solid #ddd;
  white-space: nowrap; /* 防止文字换行 */
  overflow: hidden; /* 防止内容溢出 */
  text-overflow: ellipsis; /* 文字溢出时显示省略号 */
  min-width: auto; /* 允许按钮根据内容调整大小 */
}

.filter-btn.active {
  background-color: #667eea;
  color: white;
  border-color: #667eea;
}

.batch-actions {
  margin-top: 20rpx;
  width: 100%; /* 与搜索框同宽 */
}

.button-row {
  display: flex;
  gap: 20rpx; /* 按钮之间的间距 */
  width: 100%; /* 使按钮行占满父容器 */
}

.batch-audit-btn {
  flex: 1; /* 使按钮平均分配空间 */
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 10rpx;
  padding: 15rpx 25rpx;
  font-size: 26rpx;
  min-width: auto; /* 移除最小宽度限制 */
  text-align: center;
  white-space: nowrap; /* 防止文字换行 */
}

.batch-audit-btn:disabled {
  background-color: #ccc;
  color: #666;
}

.one-click-audit-btn {
  flex: 1; /* 使按钮平均分配空间 */
  background-color: #67C23A; /* 绿色背景 */
  color: white;
  border: none;
  border-radius: 10rpx;
  padding: 15rpx 25rpx;
  font-size: 26rpx;
  text-align: center;
  white-space: nowrap; /* 防止文字换行 */
}

/* 分页控件样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20rpx;
  padding: 20rpx 0;
}

.pagination-btn {
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 10rpx;
  padding: 15rpx 25rpx;
  font-size: 28rpx;
  margin: 0 10rpx;
  min-width: 100rpx;
}

.pagination-btn:disabled {
  background-color: #ccc;
  color: #666;
}

.pagination-info {
  font-size: 28rpx;
  color: #666;
  margin: 0 20rpx;
}

/* 当弹窗打开时固定页面 */
.feature-container.modal-open {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
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

/* 搜索和筛选区域样式 */
.search-filter-section {
  width: 100%;
  margin-top: 50rpx; /* 只添加上边距 */
  margin-bottom: 30rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  box-sizing: border-box;
}

.search-box {
  display: flex;
  margin-bottom: 20rpx;
}

.search-input {
  flex: 1;
  height: 73rpx;
  line-height: 73rpx;
  padding: 0 24rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 36rpx 0 0 36rpx;
  font-size: 34rpx;
  background-color: #fff;
  box-sizing: border-box;
}

.search-btn {
  width: 97rpx;
  height: 73rpx;
  border-radius: 0 36rpx 36rpx 0;
  border: 1rpx solid #dcdfe6;
  border-left: none;
  background-color: #667eea;
  color: white;
  font-size: 29rpx;
  line-height: 1;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.filter-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-buttons {
  display: flex;
  flex-wrap: nowrap; /* 防止换行 */
}

.filter-btn {
  padding: 10rpx 20rpx; /* 统一内边距 */
  margin-right: 10rpx; /* 统一间距 */
  border: 1rpx solid #dcdfe6;
  background-color: #f5f7fa;
  color: #606266;
  border-radius: 10rpx;
  font-size: 24rpx;
  min-width: 100rpx; /* 增加最小宽度以适应"待审核"文字 */
  height: 60rpx; /* 统一按钮高度 */
  white-space: nowrap; /* 防止文字换行 */
  overflow: visible; /* 显示完整文字，不隐藏 */
  flex: 0 0 auto; /* 不伸缩，根据内容自适应宽度 */
  text-align: center; /* 文字居中 */
  box-sizing: border-box; /* 包含边框和内边距 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-btn.active {
  background-color: #667eea;
  color: white;
  border-color: #667eea;
}

.batch-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.button-row {
  display: flex;
  gap: 10rpx; /* 统一间距 */ 
}

.batch-audit-btn,
.one-click-audit-btn {
  padding: 10rpx 20rpx; /* 统一内边距 */
  border: 1rpx solid #dcdfe6;
  background-color: #f5f7fa;
  color: #606266;
  border-radius: 10rpx;
  font-size: 24rpx; /* 统一字体大小 */
  min-width: 120rpx; /* 统一最小宽度，稍微增加以避免文字溢出 */
  height: 60rpx; /* 统一按钮高度 */
  flex: 0 0 auto; /* 不伸缩，根据内容自适应宽度 */
  text-align: center; /* 文字居中 */
  box-sizing: border-box; /* 包含边框和内边距 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.batch-audit-btn:disabled {
  background-color: #ccc;
  color: #999;
  cursor: not-allowed;
}

.total-masked-count {
  width: 100%;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  box-sizing: border-box;
}

.total-count-text {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.history-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  /* 使用 margin 替代 gap，提高兼容性 */
  margin-bottom: 30rpx;
}

.history-list .history-card:not(:last-child) {
  margin-bottom: 30rpx;
}

.history-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  padding: 10rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  box-sizing: border-box;
  cursor: pointer;
  min-height: 80rpx; /* 确保卡片有足够高度 */
}

.select-checkbox {
  margin-right: 20rpx;
  flex-shrink: 0; /* 防止复选框被压缩 */
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.checkbox.checked {
  background-color: #667eea;
  border-color: #667eea;
}

.checkmark {
  color: white;
  font-size: 24rpx;
  line-height: 1;
}


.no-history {
  width: 100%;
  text-align: center;
  padding: 60rpx 0;
}

.no-history-text {
  font-size: 28rpx;
  color: #999;
}

.detail-modal {
  max-height: 80vh;
  overflow-y: auto;
}

.detail-info {
  max-height: 60vh;
}

.info-row {
  display: flex;
  margin-bottom: 20rpx;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #eee;
}

.label {
  width: 180rpx;
  font-size: 26rpx;
  color: #666;
}

.value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
  word-break: break-all;
}

.avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 10rpx;
}

.audit-type-selection-modal {
  width: 70%;
}

.audit-type-buttons {
  display: flex;
  flex-direction: column;
  margin-top: 30rpx;
}

.audit-type-buttons .audit-pass-btn:not(:last-child) {
  margin-bottom: 20rpx;
}

.audit-pass-btn,
.audit-reject-btn {
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.audit-pass-btn {
  background-color: #67C23A;
}

.audit-reject-btn {
  background-color: #F56C6C;
}

</style>