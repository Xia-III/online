<template>
  <view class="feature-container-role1">



    <view class="content-container">
      <!-- 二维码显示区域，仅适用于角色2 -->
      <view v-if="showQRCode && currentUserRole === 2" class="qr-code-container">
        <text class="qr-code-title">活动二维码</text>

        <!-- 角色2：显示单个二维码 -->
        <view v-if="currentUserRole === 2" class="single-qr-code">
          <view class="qr-code-wrapper">
            <view v-if="modules.length" class="qr-code-modules">
              <view class="qrcode-content">
                <view v-for="(row, rowI) in modules" :key="rowI" class="qr-row">
                  <view v-for="(col, colI) in row" :key="colI" class="qr-col">
                    <view v-if="col.isBlack" class="qr-dot-black">
                      <!-- 黑色码点 -->
                    </view>
                    <view v-else class="qr-dot-white">
                      <!-- 白色码点 -->
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view v-else class="qr-placeholder">
              <text class="placeholder-text">生成中...</text>
            </view>
          </view>
          <!-- 二维码和活动币有效时间 -->
          <view class="time-info">
            <text class="time-item">币数: {{ coins }}</text>
            <text class="time-item">二维码有效时间: {{ qrCodeExpireTime }}</text>
            <text class="time-item">活动币有效时间: {{ coinsExpireTime }}</text>
          </view>
        </view>
      </view>

      <!-- 无二维码数据提示 -->
      <view v-if="noQRCodeData && !isLoading" class="no-data-container">
        <text class="no-data-text">暂无二维码数据，重新进入本页面刷新</text>
      </view>


    </view>



    <!-- 加载指示器 -->
    <view v-if="isLoading" class="loading-overlay">
      <view class="loading-content">
        <text class="loading-text">加载中...</text>
      </view>
    </view>


    <!-- 搜索和筛选区域 -->
    <view class="search-filter-section" v-if="currentUserRole === 2">
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
    <view class="total-masked-count" v-if="currentUserRole === 2">
      <text class="total-count-text">记录数量: {{ totalMaskedCount }}</text>
    </view>

    <!-- 审核记录列表 -->
    <view class="history-list" v-if="currentUserRole === 2 && historyRecords && historyRecords.length > 0">
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
    <view v-else-if="currentUserRole === 2" class="no-history">
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
            <text class="value">{{  Math.floor(selectedRecord.coins / 100)  }}</text>
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
            <text class="label">销售二维码ID:</text>
            <text class="value">{{ selectedRecord.salesQRCodeId }}</text>
          </view>
          <view class="info-row">
            <text class="label">已用金币:</text>
            <text class="value">{{ selectedRecord.usedCoins }}</text>
          </view>
          <view class="info-row">
            <text class="label">头像:</text>
            <image class="avatar-role1" :src="selectedRecord.avatar" v-if="selectedRecord.avatar" />
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
    <view class="pagination" v-if="currentUserRole === 2 && pagination.totalCount > 0">
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
      <!-- 角色2: 首页、个人 -->
      <block v-if="currentUserRole === 2">
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
      <block v-else-if="currentUserRole !== null">
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
// 使用uQRCode库生成二维码
import UQRCode from 'uqrcodejs';

export default {
  data() {
    return {
      activeTab: 'decode', // 默认激活二维码标签
      currentUserRole: null, // 当前用户角色
      qrCodeUrl: '', // 二维码链接
      qrCodeDataUrl: '', // 二维码DataURL
      qrCodeExpireTime: '', // 二维码有效时间
      coinsExpireTime: '', // 活动币有效时间
      showQRCode: false, // 是否显示二维码
      noQRCodeData: false, // 是否无二维码数据
      coins: 0, // 币数
      isQRCodeExists: false, // 是否存在二维码
      isLoading: true, // 页面加载状态
      isLoadingAddressList: false, // 地址列表加载状态


      // Toast防抖相关
      toastTimer: null, // 用于控制Toast显示的定时器

      // 二维码生成相关
      isGeneratingQRCode: false, // 防止重复生成
      modules: [], // 二维码模块数据
      uqrcodeInstance: null, // UQRCode实例引用,
      qrCodeRefreshTimer: null, // 二维码刷新定时器

      // 用户信息获取相关
      isFetchingUserInfo: false, // 是否正在获取用户信息

      // 角色2审核功能相关
      totalMaskedCount: 0,  // 全部记录数
      selectedTimeRange: 0, // 选中的时间范围，默认为全部(索引0)
      historyRecords: [],   // 审核记录
      timeRanges: ['全部', '今天', '过去7天', '过去30天'], // 时间范围选项
      isLoadingHistory: false, // 是否正在加载数据
      searchKeyword: '',    // 搜索关键词
      pagination: {          // 分页信息
        currentPage: 1,
        pageSize: 10,
        totalCount: 0
      },
      isAudited: null,      // 审核状态筛选
      addressId: null,       // 地址ID
      selectedIsAuditedIndex: 0, // 选中的审核状态索引
      showRecordDetailModal: false, // 是否显示记录详情弹窗
      selectedRecord: {}, // 选中的记录详情
      selectedRecords: [], // 批量选择的记录
      showAuditTypeSelectionModal: false, // 是否显示审核类型选择弹窗
      refreshInterval: null // 定时刷新记录的定时器
    }
  },


  onLoad() {
    // 隐藏顶部电池,时间等信息（仅在App环境中可用）
    if (typeof plus !== 'undefined') {
      plus.navigator.setFullscreen(true);
    }
    // 确保在页面加载前重置所有弹窗状态
    this.showAddressSelector = false;
    this.showAddressSelectorForEdit = false;
    this.showFullScreen = false;


    // 页面加载时获取当前用户角色
    this.isLoading = true; // 开始加载
    this.getCurrentUserRole();

    // 启动定时刷新记录的任务，每5分钟刷新一次
    this.startRefreshInterval();
  },

  onShow() {
    // 页面显示时只更新UI状态，不重新获取用户信息
    // 用户信息已在onLoad时获取，此处只需确保UI状态正确

    // 确保弹窗状态正确，避免页面切换后状态残留
    // 使用setTimeout确保状态重置在下一个事件循环中执行
    if(typeof setTimeout !== 'undefined') {
      setTimeout(() => {
        this.showAddressSelector = false;
        this.showAddressSelectorForEdit = false;
        this.showFullScreen = false;
      }, 0);
    } else {
      this.showAddressSelector = false;
      this.showAddressSelectorForEdit = false;
      this.showFullScreen = false;
    }
  },

  methods: {
    // 启动定时刷新记录的任务
    startRefreshInterval() {
      // 清除现有的定时器（如果有）
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }

      // 每5分钟（300000毫秒）刷新一次记录
      this.refreshInterval = setInterval(() => {
        console.log('定时刷新记录...');
        if (this.currentUserRole === 2 && this.addressId) {  
          this.fetchTotalMaskedCount();
        }
      }, 5 * 60 * 1000); // 5分钟 = 5 * 60 * 1000 毫秒 
    },

    switchTab(tabName) {
      this.activeTab = tabName;

      if (tabName === 'profile') {
        // 跳转到个人资料页面
        uni.redirectTo({
          url: '/pages/main/profile'
        });
      }
    },

    getCurrentUserRole() {
      // 直接从服务器获取用户信息，确保数据一致性
      this.fetchUserInfo();
    },

    getUserInfo() {
      // 直接从服务器获取用户信息以获取地址ID，确保数据一致性
      this.fetchUserInfoForAddress();
    },

    async fetchUserInfoForAddress() {
      // 防止重复请求，如果已经在获取用户信息则直接返回
      if (this.isFetchingUserInfo) {
        return;
      }

      this.isFetchingUserInfo = true;

      try {
        // 从服务器获取最新的用户信息，确保数据一致性
        const token = uni.getStorageSync('token');
        if (!token) {
          console.error('用户token不存在');
          this.showToast('用户token不存在', 'none', 2000);
          return;
        }

        // 使用封装的请求方法获取用户信息
        const response = await post('/api/v2/User/GetCurrentUser', {}, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        if (response.code === 200) {
          const userInfo = response.data;
          // 保存用户信息到本地存储
          uni.setStorageSync('userInfo', userInfo);

          if (userInfo.addressId) {
            this.addressId = userInfo.addressId;
            // 获取数据
            this.fetchTotalMaskedCount();
          } else {
            console.error('用户信息中缺少addressId');
            this.showToast('用户信息中缺少addressId', 'none', 2000);
          }
        } else {
          console.error('获取用户信息失败:', response.message);
          this.showToast(response.message || '获取用户信息失败', 'none', 2000);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        this.showToast(error.message || '请求失败', 'none', 2000);
      } finally {
        this.isFetchingUserInfo = false; // 重置获取状态
      }
    },

    async fetchUserInfo() {
      // 防止重复请求
      if (this.isFetchingUserInfo) {
        return;
      }

      this.isFetchingUserInfo = true;

      try {
        // 获取用户信息以确定角色
        const token = uni.getStorageSync('token');
        if (token) {
          // 使用封装的请求方法获取用户信息
          const response = await post('/api/v2/User/GetCurrentUser', {}, {
            'Content-Type': 'application/json-patch+json',
            'accept': '*/*'
          });

          if (response.code === 200) {
            const userInfo = response.data;
            // 保存用户信息到本地存储
            uni.setStorageSync('userInfo', userInfo);
            // 设置当前用户角色
            this.currentUserRole = userInfo.role;

            // 如果角色为2，则获取二维码
            if (userInfo.role === 2) {
              this.generateQRCode();
              // 获取用户信息以获取地址ID
              this.getUserInfo();

              // 确保获取记录列表，即使在generateQRCode失败的情况下
              if (userInfo.addressId) {
                this.addressId = userInfo.addressId;
                this.fetchTotalMaskedCount();
              }
            } else {
              // 对于其他角色，结束加载状态并跳转到登录页面
              this.isLoading = false;
              this.showToast(`角色${userInfo.role}不支持二维码功能`, 'none', 2000);
              // 如果不是角色2，跳转到登录页面
              if(typeof setTimeout !== 'undefined') {
                setTimeout(() => {
                  uni.reLaunch({
                    url: '/pages/index/index'
                  });
                }, 2000);
              } else {
                uni.reLaunch({
                  url: '/pages/index/index'
                });
              }
            }
          } else {
            console.error('获取用户信息失败:', response.message);
            this.showToast(response.message || '获取用户信息失败', 'none', 2000);
            // 获取信息失败后跳转到登录页面
            if(typeof setTimeout !== 'undefined') {
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/index/index'
                });
              }, 2000);
            } else {
              uni.reLaunch({
                url: '/pages/index/index'
              });
            }
          }
        } else {
          // 没有token，跳转到登录页面
          this.showToast('请先登录', 'none', 2000);
          if(typeof setTimeout !== 'undefined') {
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/index/index'
              });
            }, 2000);
          } else {
            uni.reLaunch({
              url: '/pages/index/index'
            });
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        this.showToast(error.message || '请求失败', 'none', 2000);
        // 获取信息失败后跳转到登录页面
        if(typeof setTimeout !== 'undefined') {
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/index/index'
            });
          }, 2000);
        } else {
          uni.reLaunch({
            url: '/pages/index/index'
          });
        }
      } finally {
        // 确保无论成功还是失败都要结束加载状态
        this.isLoading = false;
        this.isFetchingUserInfo = false; // 重置获取状态
      }
    },

    async generateQRCode() {
      try {
        // 从本地存储获取用户信息（此时用户信息已经从服务器获取并保存）
        const userInfo = uni.getStorageSync('userInfo');
        if (!userInfo) {
          console.error('用户信息不存在');
          this.showToast('用户信息不存在', 'none', 2000);
          return;
        }

        let response;

        if (userInfo.role === 2) {
          // 角色为2时的请求
          if (!userInfo.addressId) {
            console.error('用户信息中缺少addressId');
            this.showToast('用户信息中缺少addressId', 'none', 2000);
            return;
          }

          // 发送请求获取二维码数据
          response = await post('/api/v2/SalesQRCode/GetValidQRCode', {
            addressId: userInfo.addressId
          }, {
            'Content-Type': 'application/json-patch+json',
            'accept': '*/*'
          });
        } else {
          console.error('不支持的用户角色:', userInfo.role);
          this.showToast(`角色${userInfo.role}不支持二维码功能`, 'none', 2000);
          return;
        }

        if (response.code === 200) {
          if (response.data === null || response.data === undefined) {
            // 二维码过期或无数据
            this.noQRCodeData = true;
            this.showQRCode = false;
            this.showToast('暂无二维码数据，请点击右下角按钮创建', 'none', 2000);
          } else if (response.data.salesQRCodeId) {
            // 角色为2，直接使用返回的数据
            // 构造二维码链接
            const qrCodeUrl = `https://www.huanxizn.com/activityCurrency/?salesQRCodeId=${response.data.salesQRCodeId}`;

            // 保存二维码链接
            this.qrCodeUrl = qrCodeUrl;

            // 计算二维码有效时间
            this.qrCodeExpireTime = response.data.expireTime;

            // 计算活动币有效时间（创建时间加上有效小时数）
            const creationTime = new Date(response.data.creationTime);
            const coinsExpireTime = new Date(creationTime.getTime() + (response.data.coinsExpireHour * 60 * 60 * 1000));
            // 格式化为 YYYY-MM-DD HH:mm:ss 格式
            this.coinsExpireTime = this.formatDateTime(coinsExpireTime);

            // 为角色2也设置二维码列表（单个项目）
            this.qrCodeList = [{
              salesQRCodeId: response.data.salesQRCodeId,
              addressId: response.data.addressId,
              expireMin: response.data.expireMin || 60, // 二维码有效时间（分钟）
              coins: response.data.coins || 1, // 币数
              expireTime: response.data.expireTime,
              creationTime: response.data.creationTime,
              coinsExpireHour: response.data.coinsExpireHour,
              coinsExpireTime: this.coinsExpireTime,
              qrCodeDataUrl: '', // 会在createQRCode后更新
              addressName: `场地${response.data.addressId}`
            }];

            // 设置币数变量
            this.coins = response.data.coins || 0;

            // 显示二维码
            this.showQRCode = true;
            this.noQRCodeData = false;
            this.isQRCodeExists = true; // 设置二维码存在标志

            // 使用UQRCode类生成二维码
            this.createQRCode();

            // 设置二维码过期后自动刷新的定时器
            this.setQRCodeRefreshTimer(response.data.expireTime);
          } else {
            console.error('获取二维码数据失败: 数据格式不正确', response);
            this.noQRCodeData = true;
            this.showQRCode = false;
            this.showToast('获取二维码数据格式不正确', 'none', 2000);
          }
        } else {
          console.error('获取二维码数据失败:', response.message || '操作失败');
          this.noQRCodeData = true;
          this.showQRCode = false;
          this.showToast(response.message || '获取二维码数据失败', 'none', 2000);
        }
      } catch (error) {
        console.error('生成二维码时出错:', error);
        this.showToast(error.message || '生成二维码失败', 'none', 2000);
      } finally {
        // 确保无论成功还是失败都要结束加载状态
        this.isLoading = false;
      }
    },

    // 使用UQRCode类生成二维码
    async createQRCode() {
      try {
        // 1. 基础检查
        if (!this.qrCodeUrl?.trim()) {
          this.showToast('二维码内容为空', 'none');
          return;
        }

        this.isGeneratingQRCode = true;

        // 2. 创建UQRCode实例
        const qr = new UQRCode();
        qr.data = this.qrCodeUrl; // 设置二维码数据
        qr.size = 250; // 设置二维码大小
        qr.margin = 4; // 设置边距

        // 3. 生成二维码
        qr.make();

        // 4. 获取模块数据并更新到组件数据
        this.modules = [...qr.modules]; // 使用展开运算符确保响应式更新

        this.isGeneratingQRCode = false;
        this.showToast('二维码生成成功', 'success', 1000);

      } catch (err) {
        this.isGeneratingQRCode = false;
        this.showToast('生成过程出错: ' + err.message, 'none');
      }
    },


    formatDateTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); 
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0'); 
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');

      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },





    // 全屏二维码图像加载失败
    onFullScreenImageError(e) {
      this.showToast('全屏二维码加载失败', 'none', 2000);
      this.hideFullScreenQRCode();
    },

    // 更新二维码数据URL（虽然不再使用图片，但保留此方法以防后续需要）
    updateQRCodeDataUrl(newUrl) {
      // 添加时间戳参数避免缓存
      if (newUrl) {
        const separator = newUrl.includes('?') ? '&' : '?';
        this.qrCodeDataUrl = newUrl + separator + 't=' + Date.now();

        // 更新全屏二维码URL
        this.currentFullScreenQRCode = this.qrCodeDataUrl;
      }
    },

    // 防抖Toast提示
    showToast(title, icon = 'none', duration = 2000) {
      // 清除之前的定时器
      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
      }

      // 立即显示当前Toast
      uni.showToast({
        title,
        icon,
        duration
      });

      // 设置新的定时器
      if(typeof setTimeout !== 'undefined') {
        this.toastTimer = setTimeout(() => {
          this.toastTimer = null;
        }, duration);
      } else {
        this.toastTimer = null;
      }
    },

    // 设置二维码过期后自动刷新的定时器
    setQRCodeRefreshTimer(expireTimeStr) {
      // 清除之前的定时器（如果有）
      if (this.qrCodeRefreshTimer) {
        clearTimeout(this.qrCodeRefreshTimer);
        this.qrCodeRefreshTimer = null;
      }

      // 将过期时间字符串转换为Date对象
      const expireTime = new Date(expireTimeStr);
      const currentTime = new Date();

      // 计算距离过期的时间（毫秒）
      const timeDiff = expireTime.getTime() - currentTime.getTime();

      // 如果时间差大于0，则设置定时器在过期后1分钟执行
      if (timeDiff > 0) {
        // 过期时间 + 1分钟后执行（单位：毫秒）
        const delay = timeDiff + (30 * 1000); // 1分钟 = 60 * 1000 毫秒

        this.qrCodeRefreshTimer = setTimeout(() => {
          this.refreshQRCodeData();
        }, delay);

        console.log(`二维码将在 ${(delay / 1000 / 60).toFixed(2)} 分钟后刷新`);
      } else {
        // 如果二维码已经过期，立即刷新
        this.refreshQRCodeData();
      }
    },

    // 刷新二维码数据
    async refreshQRCodeData() {
      console.log('开始刷新二维码数据...');
      this.generateQRCode(); // 重新生成二维码
    },

    // 角色2审核功能相关方法
    onSearch() {
      // 搜索操作，重置到第一页并获取数据
      this.pagination.currentPage = 1;
      this.fetchTotalMaskedCount();
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
    },

    async fetchTotalMaskedCount() {
      // 防止重复请求
      if (this.isLoadingHistory) return;

      this.isLoadingHistory = true;
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
        this.isLoadingHistory = false;
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
    }
  },

  onUnload() {
    // 页面卸载时清除定时器
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    // 清除二维码刷新定时器
    if (this.qrCodeRefreshTimer) {
      clearTimeout(this.qrCodeRefreshTimer);
      this.qrCodeRefreshTimer = null;
    }
  }
}
</script>

<style>
/* 设置页面高度 */
page {
  height: 100%;
}

.feature-container-role1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-height: 100vh;
  padding: 40rpx 40rpx 100rpx; /* 增加底部边距，为底部导航栏留出空间 */
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-sizing: border-box;
  overflow: hidden; /* 防止出现滚动条 */
}


.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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

/* 二维码容器样式 */
.qr-code-container {
  width: 100%;
  max-width: 600rpx; /* 减小最大宽度 */
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  padding: 15rpx; /* 减小内边距 */
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40rpx;
  margin-bottom: 30rpx; /* 减少底部边距 */
}

.qr-code-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 15rpx;
}

.qr-code-canvas {
  width: 400rpx;
  height: 400rpx;
  margin: 20rpx 0;
}

.qr-code-image {
  width: 400rpx;
  height: 400rpx;
  margin: 20rpx 0;
}


/* 时间信息样式 */
.time-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15rpx;
  padding: 10rpx;
  background-color: #f8f9fa;
  border-radius: 15rpx;
  width: 100%;
}

.time-item {
  font-size: 24rpx;
  color: #666;
  margin: 5rpx 0;
  text-align: center;
  width: 100%;
}

/* 二维码包装器样式 */
.qr-code-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5rpx 0; /* 减小外边距 */
  border-radius: 10rpx;
}

/* 单个二维码样式 */
.single-qr-code {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* 二维码列表样式 */
.qr-code-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10rpx; /* 减小间距 */
}

/* 二维码卡片样式 */
.qr-card {
  display: flex;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  padding: 10rpx; /* 进一步减少内边距 */
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  box-sizing: border-box;
  align-items: center;
  width: 100%; /* 确保卡片宽度充分利用 */
  min-height: 75rpx; /* 降低最小高度50% */
  overflow: hidden; /* 防止内容溢出 */
}

/* 二维码左侧（图片） */
.qr-left {
  flex: 0 0 100rpx; /* 调整以适应新的图片尺寸 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 二维码图片样式 */
.qr-image {
  width: 80rpx; /* 调整以适应新的卡片高度 */
  height: 80rpx; /* 调整以适应新的卡片高度 */
}

/* 二维码右侧（信息） */
.qr-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-left: 10rpx; /* 进一步减少左边距 */
  min-width: 0; /* 允许内容收缩 */
}

/* 信息项样式 */
.qr-info {
  display: flex;
  margin-bottom: 5rpx; /* 进一步减少底部边距 */
  white-space: nowrap; /* 防止换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 溢出时显示省略号 */
}

/* 字段名称样式 */
.field-name {
  font-size: 22rpx; /* 进一步减小字体 */
  color: #666;
  white-space: nowrap; /* 防止换行 */
  flex-shrink: 0; /* 不收缩 */
  width: 80rpx; /* 进一步减小宽度 */
}

/* 字段值样式 */
.field-value {
  font-size: 22rpx; /* 进一步减小字体 */
  color: #333;
  flex: 1;
  white-space: nowrap; /* 防止换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 溢出时显示省略号 */
}

/* 无数据容器样式 */
.no-data-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex: 1; /* 占据剩余空间以实现垂直居中 */
  padding: 40rpx;
  box-sizing: border-box;
}

/* 无数据文字样式 */
.no-data-text {
  font-size: 28rpx;
  color: #999;
}

/* 顶部搜索和添加区域样式 */
.top-section {
  width: 100%;
  display: flex;
  justify-content: flex-end; /* 右对齐添加按钮 */
  align-items: center;
  margin-bottom: 20rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
}

.add-btn {
  width: 73rpx; /* 增大按钮尺寸 */
  height: 73rpx;
  border-radius: 50%;
  background-color: #667eea;
  color: white;
  font-size: 39rpx; /* 增大字体 */
  line-height: 73rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* 防止按钮在小屏幕上被压缩 */
  box-sizing: border-box;
  box-shadow: 0 4rpx 10rpx rgba(102, 126, 234, 0.3);
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

.address-selector {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.address-list {
  flex: 1;
  margin: 20rpx 0;
  max-height: calc(70vh - 180rpx); /* 调整高度以适应标题和按钮 */
}

.address-item {
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
  cursor: pointer;
}

.address-detail {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

/* 详情弹窗操作按钮样式 */
.detail-actions {
  display: flex;
  gap: 15rpx;
  margin-top: 30rpx;
  width: 100%;
}

.detail-action-btn {
  flex: 1;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 10rpx;
  font-size: 26rpx;
  color: white;
  border: none;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  background-color: #667eea;
}

.delete-btn {
  background-color: #f56c6c;
}

.close-btn {
  background-color: #909399;
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

/* 分页样式 */
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

/* 加载指示器样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.3);
} 

.loading-text {
  font-size: 28rpx;
  color: #666;
  margin-top: 20rpx;
}

/* 二维码占位符样式 */
.qr-placeholder {
  width: 180rpx; /* 减小尺寸 */
  height: 180rpx; /* 减小尺寸 */
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 10rpx;
}

.placeholder-text {
  font-size: 28rpx;
  color: #999;
}

/* 隐藏的uQRCode组件样式 */
.uqrcode-hidden {
  position: absolute;
  left: -9999px;
  opacity: 0;
  width: 0;
  height: 0;
}

/* 二维码点样式 */
.qr-dot-black {
  width: 4rpx; /* 减小尺寸 */
  height: 4rpx;
  background-color: black;
  flex-shrink: 0; /* 防止在flex容器中被压缩 */
}

.qr-dot-white {
  width: 4rpx; /* 减小尺寸 */
  height: 4rpx;
  background-color: white;
  flex-shrink: 0; /* 防止在flex容器中被压缩 */
}

/* 全屏二维码点样式 */
.qr-dot-black-large {
  width: 8rpx; /* 减小尺寸 */
  height: 8rpx;
  background-color: black;
  flex-shrink: 0; /* 防止在flex容器中被压缩 */
}

.qr-dot-white-large {
  width: 8rpx; /* 减小尺寸 */
  height: 8rpx;
  background-color: white;
  flex-shrink: 0; /* 防止在flex容器中被压缩 */
}

/* 二维码容器样式 - 作为整体卡片容器 */
.qr-code-container {
  width: 100%;
  max-width: 600rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40rpx;
}


/* 二维码模块容器样式 */
.qr-code-modules {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10rpx 0;
}


/* 二维码行样式 */
.qr-row {
  display: flex;
  flex-direction: row;
  flex-shrink: 0; /* 防止在flex容器中被压缩 */
}

/* 二维码列样式 */
.qr-col {
  display: flex;
  flex-shrink: 0; /* 防止在flex容器中被压缩 */
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
}

.filter-btn {
  padding: 10rpx 20rpx;
  margin-right: 20rpx;
  border: 1rpx solid #dcdfe6;
  background-color: #f5f7fa;
  color: #606266;
  border-radius: 10rpx;
  font-size: 24rpx;
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
  gap: 20rpx;
  margin-bottom: 10rpx;
}

.batch-audit-btn,
.one-click-audit-btn {
  padding: 10rpx 20rpx;
  border: 1rpx solid #dcdfe6;
  background-color: #f5f7fa;
  color: #606266;
  border-radius: 10rpx;
  font-size: 24rpx;
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
  gap: 20rpx;
}

.history-list .history-card:not(:last-child) {
  margin-bottom: 30rpx;
}

.history-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  box-sizing: border-box;
  cursor: pointer;
}

.select-checkbox {
  margin-right: 20rpx;
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
  flex-wrap: wrap;
  font-size: 26rpx;
  color: #333;
}

.record-nickname {
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200rpx;
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

.avatar-role1 {
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
}

.audit-pass-btn {
  background-color: #67C23A;
}

.audit-reject-btn {
  background-color: #F56C6C;
}

</style>