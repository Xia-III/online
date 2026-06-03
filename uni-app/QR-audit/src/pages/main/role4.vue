<template>
  <view class="feature-container-role4" :class="{ 'modal-open': isModalOpen }">

    <view class="content-container">
      <!-- 二维码显示区域，根据角色显示不同内容 -->
      <view v-if="showQRCode && currentUserRole === 4" class="qr-code-container">
        <text class="qr-code-title">活动二维码列表</text>

        <!-- 角色4：显示二维码列表 -->
        <view class="qr-code-list">
          <view v-for="(item, index) in qrCodeList" :key="index" class="qr-card" @click="showFullScreenQRCodeByIndex(index)">
            <view class="qr-left">
              <view v-if="item.modules && item.modules.length > 0" class="qr-modules">
                <view class="qr-modules-content">
                  <view v-for="(row, rowI) in item.modules" :key="rowI" class="qr-row-small">
                    <view v-for="(col, colI) in row" :key="colI" class="qr-col-small">
                      <view v-if="col.isBlack"
                            class="qr-dot-black-small"
                            :style="{ width: qrDotSizeSmall + 'rpx', height: qrDotSizeSmall + 'rpx' }"></view>
                      <view v-else
                            class="qr-dot-white-small"
                            :style="{ width: qrDotSizeSmall + 'rpx', height: qrDotSizeSmall + 'rpx' }"></view>
                    </view>
                  </view>
                </view>
              </view>
              <view v-else
                    class="qr-placeholder-small"
                    :style="{ width: Math.min(qrDotSizeSmall * 25, 150) + 'rpx', height: Math.min(qrDotSizeSmall * 25, 150) + 'rpx' }">
                <text class="placeholder-text">生成中...</text>
              </view>
            </view>
            <view class="qr-right">
              <view class="qr-info">
                <text class="field-name">场地:</text>
                <text class="field-value">{{ item.addressName }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 无二维码数据提示 -->
      <view v-if="noQRCodeData && !isLoading" class="no-data-container">
        <text class="no-data-text">暂无二维码数据，点击添加按钮进行创建</text> 
      </view>

      <!-- 全屏二维码弹窗 -->
      <view v-if="showFullScreen" class="fullscreen-overlay">
        <view class="fullscreen-content">
          <!-- 显示二维码模块 -->
          <view v-if="currentQRCodeDetail && currentQRCodeDetail.modules && currentQRCodeDetail.modules.length > 0" class="fullscreen-qrcode-modules">
            <view class="fullscreen-qrcode-modules-content">
              <view v-for="(row, rowI) in currentQRCodeDetail.modules" :key="rowI" class="qr-row-fullscreen" :style="{ maxWidth: '100%', width: 'fit-content' }">
                <view v-for="(col, colI) in row" :key="colI" class="qr-col-fullscreen">
                  <view v-if="col.isBlack"
                        class="qr-dot-black-fullscreen"
                        :style="{ width: qrDotSizeFullscreen + 'rpx', height: qrDotSizeFullscreen + 'rpx', maxWidth: '100%' }"></view>
                  <view v-else
                        class="qr-dot-white-fullscreen"
                        :style="{ width: qrDotSizeFullscreen + 'rpx', height: qrDotSizeFullscreen + 'rpx', maxWidth: '100%' }"></view>
                </view>
              </view>
            </view>
          </view>
          <view v-else
                class="qr-placeholder-fullscreen"
                :style="{ width: Math.min(qrDotSizeFullscreen * 25, 200) + 'rpx', height: Math.min(qrDotSizeFullscreen * 25, 200) + 'rpx', maxWidth: '100%' }">
            <text class="placeholder-text">生成中...</text>
          </view>

          <!-- 当角色为4时显示详细信息 -->
          <view v-if="currentQRCodeDetail" class="fullscreen-detail">
            <view class="detail-item">
              <text class="detail-label">场地ID:</text>
              <text class="detail-value">{{ currentQRCodeDetail.addressId }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">场地名称:</text>
              <text class="detail-value wrap">{{ currentQRCodeDetail.addressName }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">币数:</text>
              <text class="detail-value no-wrap">{{ currentQRCodeDetail.coins }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">二维码有效时间:</text>
              <text class="detail-value no-wrap">{{ currentQRCodeDetail.expireTime }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">活动币有效时间:</text>
              <text class="detail-value no-wrap">{{ currentQRCodeDetail.coinsExpireTime }}</text>
            </view>
          </view>
          <!-- 操作按钮区域 -->
          <view class="detail-actions">
            <!-- 关闭按钮始终显示 -->
            <button class="detail-action-btn close-btn" @click="hideFullScreenQRCode">关闭</button>
            <!-- 角色4的编辑和删除按钮 -->
            <block v-if="currentQRCodeDetail">
              <button class="detail-action-btn edit-btn" @click="showEditModal">修改</button>
              <button class="detail-action-btn delete-btn" @click="showDeleteConfirmation">删除</button>
            </block>
          </view>
        </view>
      </view>

      <!-- 分页控件 -->
      <view class="pagination" v-if="showQRCode && qrCodeList.length > 0">
        <button
          class="pagination-btn"
          :disabled="currentPage <= 1"
          @click="prevPage"
        >
          上一页
        </button>
        <text class="pagination-info">
          第 {{ currentPage }} 页，共 {{ Math.ceil(total / pageSize) }} 页
        </text>
        <button
          class="pagination-btn"
          :disabled="currentPage >= Math.ceil(total / pageSize)"
          @click="nextPage"
        >
          下一页
        </button>
      </view>
    </view>

    <!-- 悬浮按钮 -->
    <view class="fab-button" @click="onFabButtonClick">
      <text class="fab-icon">+</text>
    </view>

    <!-- 添加弹窗 -->
    <view v-if="showAddModal && !showAddressSelector" class="modal-overlay" @click="closeAddModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">添加二维码</text>
 
        <!-- 场地选择 -->
        <view class="form-group-role4">
          <label>选择场地 *</label>
          <view class="picker" @click="showAddressSelectorModal">
            {{ selectedAddress ? selectedAddress.name : '请选择场地' }}
          </view>
        </view>

        <!-- 二维码有效时间 -->
        <view class="form-group-role4">
          <label>二维码有效时间(分钟) *</label>
          <input
            type="number"
            placeholder="请输入有效时间(分钟)"
            v-model="newQRCode.expireMin"
            class="form-input"
          />
        </view>

        <!-- 币数 -->
        <view class="form-group-role4">
          <label>币数 *</label>
          <input
            type="number"
            placeholder="请输入币数"
            v-model="newQRCode.coins"
            class="form-input"
          />
        </view>

        <!-- 金币有效时间 -->
        <view class="form-group-role4">
          <label>金币有效时间(小时) *</label>
          <input
            type="number"
            placeholder="请输入有效时间(小时)"
            v-model="newQRCode.coinsExpireHour"
            class="form-input"
          />
        </view>

        <view class="form-buttons">
          <button class="btn-cancel" @click="closeAddModal">取消</button>
          <button class="btn-submit" @click="submitQRCode">提交</button>
        </view>
      </view>
    </view>

    <!-- 场地选择弹窗 -->
    <view v-if="showAddressSelector && !isLoadingAddressList" class="modal-overlay" @click="closeAddressSelector">
      <view class="modal-content address-selector" @click.stop>
        <text class="modal-title">选择场地</text>
        <view class="search-box-address-selector">
          <input
            type="text"
            placeholder="搜索场地..."
            v-model="addressSearchKeyword"
            class="search-input-address-selector"
          />
        </view>
        <scroll-view class="address-list" scroll-y="true" v-if="filteredAddressList && filteredAddressList.length > 0">
          <view
            class="address-item"
            v-for="(address, index) in filteredAddressList"
            :key="address.addressId"
            @click="selectAddress(address)"
          >
            <text>{{ address.name }}</text>
            <text class="address-detail">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.street }}</text>
          </view>
        </scroll-view>
        <view v-else class="no-data-content">
          <text class="no-data-text">暂无场地数据</text>
        </view>
      </view>
    </view>

    <!-- 编辑表单 -->
    <view v-if="showEditForm" class="modal-overlay" @click="closeEditModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">编辑二维码</text>

        <!-- 场地选择 -->
        <view class="form-group-role4">
          <label>选择场地 *</label>
          <view class="picker" @click="showAddressSelectorForEdit">
            {{ getSelectedAddressName(editQRCode.addressId) }}
          </view>
        </view>

        <!-- 二维码有效时间 -->
        <view class="form-group-role4">
          <label>二维码有效时间(分钟) *</label>
          <input
            type="number"
            placeholder="请输入有效时间(分钟)"
            v-model="editQRCode.expireMin"
            class="form-input"
          />
        </view>

        <!-- 币数 -->
        <view class="form-group-role4">
          <label>币数 *</label>
          <input
            type="number"
            placeholder="请输入币数"
            v-model="editQRCode.coins"
            class="form-input"
          />
        </view>

        <!-- 金币有效时间 -->
        <view class="form-group-role4">
          <label>金币有效时间(小时) *</label>
          <input
            type="number"
            placeholder="请输入有效时间(小时)"
            v-model="editQRCode.coinsExpireHour"
            class="form-input"
          />
        </view>

        <view class="form-buttons">
          <button class="btn-cancel" @click="closeEditModal">取消</button>
          <button class="btn-submit" @click="submitEdit">提交</button>
        </view>
      </view>
    </view>

    <!-- 编辑用的场地选择弹窗 -->
    <view v-if="showEditAddressSelector" class="modal-overlay" @click="closeAddressSelectorForEdit">
      <view class="modal-content address-selector" @click.stop>
        <text class="modal-title">选择场地</text>
        <view class="search-box-address-selector">
          <input
            type="text"
            placeholder="搜索场地..."
            v-model="editAddressSearchKeyword"
            class="search-input-address-selector"
          />
        </view>
        <scroll-view class="address-list" scroll-y="true">
          <view
            class="address-item"
            v-for="(address, index) in filteredEditAddressList"
            :key="address.addressId"
            @click="selectAddressForEdit(address)"
          >
            <text>{{ address.name }}</text>
            <text class="address-detail">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.street }}</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 加载指示器 -->
    <view v-if="isLoading" class="loading-overlay">
      <view class="loading-content">
        <text class="loading-text">加载中...</text>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <view class="tab-bar">
      <!-- 角色4: 二维码、审核、管理、个人 -->
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
    </view>
  </view>
</template>

<script>
import { post } from '@/utils/request.js';
import uQRCode from 'uqrcodejs';

export default {
  data() {
    return {
      activeTab: 'decode', // 默认激活二维码标签
      currentUserRole: 4, // 固定为角色4
      qrCodeList: [], // 二维码列表
      currentFullScreenQRCode: '', // 当前全屏显示的二维码
      currentQRCodeDetail: null, // 当前全屏显示的二维码详细信息
      noQRCodeData: false, // 是否无二维码数据
      showAddModal: false, // 控制添加弹窗显示
      showAddressSelector: false, // 控制地址选择器显示
      addressList: [], // 地址列表
      selectedAddress: null, // 选中的地址
      newQRCode: { // 新二维码数据
        salesQRCodeId: 0, // 0表示创建，非0表示修改
        addressId: 0,
        expireMin: 1,
        coins: 1,
        coinsExpireHour: 1
      },
      isModalOpen: false, // 控制是否显示弹窗（用于固定页面）
      showEditForm: false, // 控制编辑表单显示
      showEditAddressSelector: false, // 控制编辑用的地址选择器显示
      editQRCode: { // 编辑的二维码数据
        salesQRCodeId: 0,
        addressId: 0,
        expireMin: 1,
        coins: 1,
        coinsExpireHour: 1
      },
      isQRCodeExists: false, // 是否存在二维码
      isLoading: true, // 页面加载状态
      isLoadingAddressList: false, // 地址列表加载状态

      // 分页相关数据
      currentPage: 1, // 当前页码
      pageSize: 2, // 每页显示数量
      total: 0, // 总记录数
      totalPages: 0, // 总页数
      hasMore: false, // 是否还有更多数据,
      showQRCode: false, // 是否显示二维码
      showFullScreen: false, // 是否显示全屏二维码

      // 添加一个标识符，用于取消异步操作
      abortController: null, // 用于取消请求

      // 屏幕宽度相关数据
      screenWidth: 0, // 屏幕宽度
      qrDotSizeSmall: 6, // 小尺寸二维码点的大小(rpx)
      qrDotSizeFullscreen: 16, // 全屏二维码点的大小(rpx),

      // 场地选择搜索相关
      addressSearchKeyword: '', // 添加用的场地搜索关键字
      editAddressSearchKeyword: '', // 编辑用的场地搜索关键字
      autoRefreshTimer: null // 自动刷新定时器
    }
  },

  onLoad() {
    // 隐藏顶部电池,时间等信息（仅在App环境中可用）
    if (typeof plus !== 'undefined') {
      plus.navigator.setFullscreen(true);
    }

    // 确保在页面加载前重置所有弹窗状态
    this.resetModalStates();

    // 获取屏幕宽度并设置二维码大小
    this.getScreenInfo();

    // 页面加载时获取当前用户角色
    this.isLoading = true; // 开始加载
    this.getCurrentUserRole();

    // 启动自动刷新定时器（每5分钟刷新一次）
    this.startAutoRefresh();
  },

  onUnload() {
    // 页面卸载时清理可能仍在进行的异步操作
    this.abortController && this.abortController.abort();
    // 页面卸载时清理自动刷新定时器
    this.clearAutoRefresh();
  },

  onHide() {
    // 页面隐藏时清理可能仍在进行的异步操作
    this.abortController && this.abortController.abort();
    // 页面隐藏时也清理自动刷新定时器（如通过底部导航切换页面）
    this.clearAutoRefresh();
  },

  onShow() {
    // 页面显示时再次检查用户角色，以防万一
    if (!this.currentUserRole) {
      this.isLoading = true; // 开始加载
      this.getCurrentUserRole();
    }

    // 重新获取屏幕信息并设置二维码大小（以防设备旋转等场景）
    this.getScreenInfo();

    // 确保弹窗状态正确，避免页面切换后状态残留
    // 但只在没有正在进行的操作时才重置状态
    this.$nextTick(() => {
      // 检查是否没有任何弹窗正在显示，才重置状态
      if (!this.showAddModal && !this.showAddressSelector && !this.showEditForm &&
          !this.showEditAddressSelector && !this.showFullScreen) {
        this.resetModalStates();
      }
    });
    // 重新启动自动刷新定时器
    this.startAutoRefresh();
    // 注意：不再在onShow中重复加载二维码列表，因为onLoad已经加载过了
    // 如果需要刷新数据，可以通过下拉刷新等方式实现
  },

  computed: {
    // 过滤后的场地列表（用于添加）
    filteredAddressList() {
      if (!this.addressSearchKeyword) {
        return this.addressList;
      }
      const keyword = this.addressSearchKeyword.toLowerCase();
      return this.addressList.filter(address =>
        address.name.toLowerCase().includes(keyword) ||
        (address.province && address.province.toLowerCase().includes(keyword)) ||
        (address.city && address.city.toLowerCase().includes(keyword)) ||
        (address.district && address.district.toLowerCase().includes(keyword)) ||
        (address.street && address.street.toLowerCase().includes(keyword))
      );
    },

    // 过滤后的场地列表（用于编辑）
    filteredEditAddressList() {
      if (!this.editAddressSearchKeyword) {
        return this.addressList;
      }
      const keyword = this.editAddressSearchKeyword.toLowerCase();
      return this.addressList.filter(address =>
        address.name.toLowerCase().includes(keyword) ||
        (address.province && address.province.toLowerCase().includes(keyword)) ||
        (address.city && address.city.toLowerCase().includes(keyword)) ||
        (address.district && address.district.toLowerCase().includes(keyword)) ||
        (address.street && address.street.toLowerCase().includes(keyword))
      );
    }
  },
  methods: {
    // 获取屏幕信息并设置二维码大小
    getScreenInfo() {
      const systemInfo = uni.getSystemInfoSync();
      this.screenWidth = systemInfo.screenWidth;

      // 根据屏幕宽度设置二维码点的大小
      if (this.screenWidth <= 960) {
        // 小屏幕设备
        this.qrDotSizeSmall = 5; // 减小点的大小
        this.qrDotSizeFullscreen = 10; // 减小全屏点的大小
      } else {
        // 大屏幕设备
        this.qrDotSizeSmall = 6; // 标准点的大小
        this.qrDotSizeFullscreen = 14; // 标准全屏点的大小
      }
    },

    // 悬浮按钮点击事件
    async onFabButtonClick() {
      // 角色4只能添加二维码
      await this.onAdd();
    },

    switchTab(tabName) {
      this.activeTab = tabName;

      if (tabName === 'profile') {
        // 跳转到个人资料页面
        uni.redirectTo({
          url: '/pages/main/profile'
        });
      } else if (tabName === 'decode') {
        // 当前就是二维码页面，无需跳转
        return;
      } else if (tabName === 'history') {
        // 跳转到审核页面（feature页面）
        uni.redirectTo({
          url: '/pages/main/feature'
        });
      } else if (tabName === 'manage') {
        // 管理页面跳转到role2页面
        uni.redirectTo({
          url: '/pages/main/role2'
        });
      }
    },

    getCurrentUserRole() {
      // 从本地存储获取用户信息，然后获取角色
      const userInfo = uni.getStorageSync('userInfo');
      if (userInfo && userInfo.role) {
        this.currentUserRole = userInfo.role;
        
        // 如果角色为4，则加载二维码列表（带分页）
        if (userInfo.role === 4) {
          this.loadQRCodeList();
        } else {
          // 如果不是角色4，跳转到登录页面
          uni.reLaunch({
            url: '/pages/index/index'
          });
        }
      } else {
        // 如果本地没有存储用户信息，尝试从token获取用户信息
        this.fetchUserInfo();
      }
    },

    async fetchUserInfo() {
      try {
        // 获取用户信息以确定角色
        const token = uni.getStorageSync('token');
        if (token) {
          // 使用封装的请求方法获取用户信息
          const response = await post('/api/v2/User/GetCurrentUser', {}, {
            'Content-Type': 'application/json-patch+json',
            'accept': '*/*'
          });

          // 检查页面是否仍然存在，避免在页面已销毁后设置数据
          if (!this._isDestroyed && !this._isBeingDestroyed) {
            if (response.code === 200) {
              const userInfo = response.data;
              // 保存用户信息到本地存储
              uni.setStorageSync('userInfo', userInfo);
              // 设置当前用户角色
              this.currentUserRole = userInfo.role;

              // 如果角色为4，则加载二维码列表（带分页）
              if (userInfo.role === 4) {
                this.loadQRCodeList();
              } else {
                // 如果不是角色4，跳转到登录页面
                uni.reLaunch({
                  url: '/pages/index/index'
                });
              }
            } else {
              console.error('获取用户信息失败:', response.message);
              // 获取信息失败后跳转到登录页面
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/index/index'
                });
              }, 1500);
            }
          }
        } else {
          // 没有token，跳转到登录页面
          uni.reLaunch({
            url: '/pages/index/index'
          });
        }
      } catch (error) {
        // 检查页面是否仍然存在，避免在页面已销毁后设置数据
        if (!this._isDestroyed && !this._isBeingDestroyed) {
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
        }
      } finally {
        // 检查页面是否仍然存在，避免在页面已销毁后设置数据
        if (!this._isDestroyed && !this._isBeingDestroyed) {
          // 确保无论成功还是失败都要结束加载状态
          this.isLoading = false;
        }
      }
    },

    // 更新地址名称
    async updateAddressNames() {
      // 如果地址列表已存在且不为空，直接使用它
      if (this.addressList && this.addressList.length > 0) {
        // 创建地址映射表
        const addressMap = {};
        this.addressList.forEach(address => {
          addressMap[address.addressId] = address.name;
        });

        // 更新二维码列表中的地址名称
        this.qrCodeList = this.qrCodeList.map(item => {
          const addressName = addressMap[item.addressId] || `场地${item.addressId}`;
          return {
            ...item,
            addressName: addressName
          };
        });
        return; // 直接返回，不需要再次请求
      }

      this.isLoadingAddressList = true; // 开始加载地址列表
      try {
        // 发送请求获取地址列表
        const response = await post('/api/v2/User/AddressList', {}, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        // 检查页面是否仍然存在，避免在页面已销毁后设置数据
        if (!this._isDestroyed && !this._isBeingDestroyed) {
          if (response.code === 200 && Array.isArray(response.data)) {
            // 保存地址列表到本地，以便后续使用
            this.addressList = response.data;

            // 创建地址映射表
            const addressMap = {};
            response.data.forEach(address => {
              addressMap[address.addressId] = address.name;
            });

            // 更新二维码列表中的地址名称
            this.qrCodeList = this.qrCodeList.map(item => {
              const addressName = addressMap[item.addressId] || `场地${item.addressId}`;
              return {
                ...item,
                addressName: addressName
              };
            });
          } else {
            console.error('获取地址列表失败:', response.message);
          }
        }
      } catch (error) {
        // 检查页面是否仍然存在，避免在页面已销毁后设置数据
        if (!this._isDestroyed && !this._isBeingDestroyed) {
          console.error('更新地址名称时出错:', error);
          uni.showToast({
            title: error.message || '获取地址列表失败',
            icon: 'none'
          });
        }
      } finally {
        // 检查页面是否仍然存在，避免在页面已销毁后设置数据
        if (!this._isDestroyed && !this._isBeingDestroyed) {
          this.isLoadingAddressList = false; // 结束加载地址列表
        }
      }
    },

    // 显示全屏二维码
    showFullScreenQRCode() {
      if (this.qrCodeList.length > 0) {
        this.currentQRCodeDetail = this.qrCodeList[0]; // 设置详细信息
        this.showFullScreen = true;
      }
    },

    // 根据索引显示全屏二维码
    showFullScreenQRCodeByIndex(index) {
      if (this.qrCodeList[index]) {
        this.currentQRCodeDetail = this.qrCodeList[index]; // 设置详细信息
        this.showFullScreen = true;

        // 确保在显示全屏二维码后，内容适应屏幕
        this.$nextTick(() => {
          // 可以在这里添加额外的尺寸调整逻辑
          this.adjustFullscreenContent();
        });
      }
    },

    // 调整全屏内容以适应屏幕
    adjustFullscreenContent() {
      // 此方法可以用来动态调整全屏内容的尺寸
      // 目前主要是确保样式正确应用，防止滚动条出现
    },

    // 隐藏全屏二维码
    hideFullScreenQRCode() {
      this.showFullScreen = false;
    },

    // 处理添加按钮点击事件
    async onAdd() {
      // 角色4（系统管理员）可以添加二维码
      try {
        // 每次点击添加按钮时都重新获取最新的地址列表
        const response = await post('/api/v2/User/AddressList', {}, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        // 检查页面是否仍然存在，避免在页面已销毁后设置数据
        if (!this._isDestroyed && !this._isBeingDestroyed) {
          if (response.code === 200) {
            this.addressList = response.data || [];

            // 重置表单数据
            this.newQRCode = {
              salesQRCodeId: 0, // 0表示创建
              addressId: 0,
              expireMin: 1,
              coins: 1,
              coinsExpireHour: 1
            };
            this.selectedAddress = null;

            // 显示添加弹窗
            this.showAddModal = true;
            this.isModalOpen = true; // 更新模态框状态

            // 确保其他弹窗都已关闭
            this.showAddressSelector = false;
            this.showEditForm = false;
            this.showEditAddressSelector = false;
          } else {
            uni.showToast({
              title: response.message || '获取地址列表失败',
              icon: 'none',
              duration: 2000
            });
            // 关闭添加弹窗，避免显示空弹窗
            this.showAddModal = false;
            this.updateModalState(); // 更新模态框状态
          }
        }
      } catch (error) {
        // 检查页面是否仍然存在，避免在页面已销毁后设置数据
        if (!this._isDestroyed && !this._isBeingDestroyed) {
          console.error('获取地址列表失败:', error);
          uni.showToast({
            title: '网络错误，请重试',
            icon: 'none',
            duration: 2000
          });
          // 关闭添加弹窗，避免显示空弹窗
          this.showAddModal = false;
          this.updateModalState(); // 更新模态框状态
        }
      }
    },

    // 关闭添加弹窗
    closeAddModal() {
      this.showAddModal = false;
      this.updateModalState(); // 更新模态框状态
      this.resetFormData();
    },

    // 重置表单数据
    resetFormData() {
      this.newQRCode = {
        salesQRCodeId: 0,
        addressId: 0,
        expireMin: 1,
        coins: 1,
        coinsExpireHour: 1
      };
      this.selectedAddress = null;
    },

    // 提交二维码数据
    async submitQRCode() {
      // 验证必填字段
      if (!this.selectedAddress) {
        uni.showToast({
          title: '请选择场地',
          icon: 'none'
        });
        return;
      }

      if (!this.newQRCode.expireMin || this.newQRCode.expireMin <= 0) {
        uni.showToast({
          title: '请输入有效的二维码有效时间',
          icon: 'none'
        });
        return;
      }

      if (!this.newQRCode.coins || this.newQRCode.coins <= 0) {
        uni.showToast({
          title: '请输入有效的币数',
          icon: 'none'
        });
        return;
      }

      if (!this.newQRCode.coinsExpireHour || this.newQRCode.coinsExpireHour <= 0) {
        uni.showToast({
          title: '请输入有效的金币有效时间',
          icon: 'none'
        });
        return;
      }

      // 设置选中的地址ID
      this.newQRCode.addressId = this.selectedAddress.addressId;

      try {
        // 根据用户角色选择API端点
        const apiEndpoint = '/api/v2/SalesQRCode/SaveSalesQRCode';

        // 发送请求创建二维码
        const response = await post(apiEndpoint, this.newQRCode, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        // 检查页面是否仍然存在，避免在页面已销毁后设置数据
        if (!this._isDestroyed && !this._isBeingDestroyed) {
          if (response.code === 200) {
            uni.showToast({
              title: '二维码创建成功',
              icon: 'success'
            });

            // 关闭弹窗
            this.closeAddModal();

            // 重新加载二维码列表以显示最新数据
            this.loadQRCodeList();
          } else {
            uni.showToast({
              title: response.message || '创建失败',
              icon: 'none'
            });
          }
        }
      } catch (error) {
        // 检查页面是否仍然存在，避免在页面已销毁后设置数据
        if (!this._isDestroyed && !this._isBeingDestroyed) {
          console.error('创建二维码失败:', error);
          uni.showToast({
            title: '网络错误，请重试',
            icon: 'none'
          });
        }
      }
    },

    // 显示地址选择器弹窗
    async showAddressSelectorModal() {
      // 如果地址列表已存在且不为空，直接显示地址选择器
      if (this.addressList && this.addressList.length > 0) {
        // 只有在添加弹窗已显示的情况下才切换到地址选择器
        if (this.showAddModal) {
          this.showAddModal = false;
          this.showAddressSelector = true;
          this.isModalOpen = true; // 更新模态框状态
        }
        return; // 直接返回，不需要再次请求
      }

      // 先获取地址列表
      this.isLoadingAddressList = true; // 开始加载地址列表
      this.addressList = []; // 初始化为空数组

      try {
        const response = await post('/api/v2/User/AddressList', {}, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        // 检查页面是否仍然存在，避免在页面已销毁后设置数据
        if (!this._isDestroyed && !this._isBeingDestroyed) {
          if (response.code === 200) {
            this.addressList = response.data || []; // 保存获取到的地址列表

            // 只有在添加弹窗已显示的情况下才切换到地址选择器
            if (this.showAddModal) {
              this.showAddModal = false;
              this.showAddressSelector = true;
              this.isModalOpen = true; // 更新模态框状态
            }
          } else {
            uni.showToast({
              title: response.message || '获取地址列表失败',
              icon: 'none',
              duration: 2000
            });
            // 关闭地址选择器，避免显示空弹窗
            this.showAddressSelector = false;
            this.showAddModal = true; // 重新显示添加弹窗
            this.updateModalState(); // 更新模态框状态
          }
        }
      } catch (error) {
        // 检查页面是否仍然存在，避免在页面已销毁后设置数据
        if (!this._isDestroyed && !this._isBeingDestroyed) {
          console.error('获取地址列表失败:', error);
          uni.showToast({
            title: '网络错误，请重试',
            icon: 'none',
            duration: 2000
          });
          // 关闭地址选择器，避免显示空弹窗
          this.showAddressSelector = false;
          this.showAddModal = true; // 重新显示添加弹窗
          this.updateModalState(); // 更新模态框状态
        }
      } finally {
        // 检查页面是否仍然存在，避免在页面已销毁后设置数据
        if (!this._isDestroyed && !this._isBeingDestroyed) {
          this.isLoadingAddressList = false; // 结束加载地址列表
        }
      }
    },

    // 关闭地址选择器
    closeAddressSelector() {
      this.showAddressSelector = false;
      // 重新显示添加弹窗
      this.showAddModal = true;
      this.updateModalState(); // 更新模态框状态
    },

    // 选择地址
    selectAddress(address) {
      this.selectedAddress = address;
      this.newQRCode.addressId = address.addressId;
      this.showAddressSelector = false;
      // 重新显示添加弹窗
      this.showAddModal = true;
      this.updateModalState(); // 更新模态框状态
    },

    // 重置所有弹窗状态
    resetModalStates() {
      this.showAddModal = false;
      this.showAddressSelector = false;
      this.showEditForm = false;
      this.showEditAddressSelector = false;
      this.showFullScreen = false;
      this.isModalOpen = false;
    },

    // 更新模态框状态
    updateModalState() {
      this.isModalOpen = this.showAddModal || this.showAddressSelector || this.showEditForm || this.showEditAddressSelector;
    },

    // 显示编辑弹窗
    async showEditModal() {
      if (this.currentQRCodeDetail) {
        try {
          // 每次点击修改按钮时都重新获取最新的地址列表
          const response = await post('/api/v2/User/AddressList', {}, {
            'Content-Type': 'application/json-patch+json',
            'accept': '*/*'
          });

          // 检查页面是否仍然存在，避免在页面已销毁后设置数据
          if (!this._isDestroyed && !this._isBeingDestroyed) {
            if (response.code === 200) {
              this.addressList = response.data || [];

              // 检查页面是否仍然存在，避免在页面已销毁后设置数据
              if (!this._isDestroyed && !this._isBeingDestroyed) {
                // 将当前二维码详情复制到编辑对象
                this.editQRCode = {
                  salesQRCodeId: this.currentQRCodeDetail.salesQRCodeId || 0,
                  addressId: this.currentQRCodeDetail.addressId || 0,
                  expireMin: this.currentQRCodeDetail.expireMin || 1,
                  coins: this.currentQRCodeDetail.coins || 1,
                  coinsExpireHour: this.currentQRCodeDetail.coinsExpireHour || 1
                };

                // 关闭全屏二维码弹窗，显示编辑表单
                this.showFullScreen = false;
                this.showEditForm = true;
                this.updateModalState();
              }
            } else {
              uni.showToast({
                title: response.message || '获取地址列表失败',
                icon: 'none',
                duration: 2000
              });
              // 重新显示全屏二维码详情弹窗
              this.showFullScreen = true;
              this.updateModalState(); // 更新模态框状态
              return; // 如果获取失败，则不继续执行
            }
          }
        } catch (error) {
          // 检查页面是否仍然存在，避免在页面已销毁后设置数据
          if (!this._isDestroyed && !this._isBeingDestroyed) {
            console.error('获取地址列表失败:', error);
            uni.showToast({
              title: '网络错误，请重试',
              icon: 'none',
              duration: 2000
            });
            // 重新显示全屏二维码详情弹窗
            this.showFullScreen = true;
            this.updateModalState(); // 更新模态框状态
            return; // 如果获取失败，则不继续执行
          }
        }
      }
    },

    // 关闭编辑表单
    closeEditModal() {
      this.showEditForm = false;
      // 重新显示全屏二维码详情弹窗
      this.showFullScreen = true;
      this.updateModalState();
    },

    // 提交编辑
    async submitEdit() {
      // 验证必填字段
      if (!this.editQRCode.addressId) {
        uni.showToast({
          title: '请选择场地',
          icon: 'none'
        });
        return;
      }

      if (!this.editQRCode.expireMin || this.editQRCode.expireMin <= 0) {
        uni.showToast({
          title: '请输入有效的二维码有效时间',
          icon: 'none'
        });
        return;
      }

      if (!this.editQRCode.coins || this.editQRCode.coins <= 0) {
        uni.showToast({
          title: '请输入有效的币数',
          icon: 'none'
        });
        return;
      }

      if (!this.editQRCode.coinsExpireHour || this.editQRCode.coinsExpireHour <= 0) {
        uni.showToast({
          title: '请输入有效的金币有效时间',
          icon: 'none'
        });
        return;
      }

      // 确保salesQRCodeId大于0，表示这是一个编辑操作
      if (this.editQRCode.salesQRCodeId <= 0) {
        uni.showToast({
          title: '无效的二维码ID',
          icon: 'none'
        });
        return;
      }

      try {
        const apiEndpoint = '/api/v2/SalesQRCode/SaveSalesQRCode';

        // 发送请求编辑二维码
        const response = await post(apiEndpoint, this.editQRCode, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        if (response.code === 200) {
          uni.showToast({
            title: '修改成功',
            icon: 'success'
          });

          // 关闭编辑表单，但不重新显示详情弹窗
          this.showEditForm = false;
          this.updateModalState();

          // 重新加载二维码列表以显示最新数据
          this.loadQRCodeList();
        } else {
          uni.showToast({
            title: response.message || '修改失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('修改二维码失败:', error);
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    },

    // 显示删除确认弹窗
    showDeleteConfirmation() {
      // 先关闭详情弹窗
      this.showFullScreen = false;
      this.updateModalState();

      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个二维码吗？',
        confirmText: '确定',
        cancelText: '取消',
        // 在Android平台上，按钮顺序与iOS相反，通过按钮位置来统一行为
        success: (res) => {
          // 统一处理：左边按钮为取消，右边按钮为确定
          // 在uni.showModal中，cancel按钮在左，confirm按钮在右
          // 所以无论平台如何，我们都将左按钮视为取消，右按钮视为确定
          if (res.cancel) {
            // 用户点击了取消（左按钮）
            // 重新打开详情弹窗
            this.showFullScreen = true;
            this.updateModalState();
          } else if (res.confirm) {
            // 用户点击了确定（右按钮）
            this.deleteQRCode();
          }
        }
      });
    },

    // 删除二维码
    async deleteQRCode() {
      if (!this.currentQRCodeDetail) {
        return;
      }

      try {
        // 创建删除用的对象，只需要salesQRCodeId
        const deleteData = {
          salesQRCodeId: this.currentQRCodeDetail.salesQRCodeId
        };

        const apiEndpoint = '/api/v2/SalesQRCode/Delete';

        // 发送请求删除二维码
        const response = await post(apiEndpoint, deleteData, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        if (response.code === 200) {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });

          // 关闭全屏二维码弹窗
          this.hideFullScreenQRCode();

          // 检查是否是最后一页的唯一一条数据
          if (this.currentPage > 1 && this.qrCodeList.length === 1) {
            // 如果当前页码大于1且当前页只有1条数据，删除后应跳转到上一页
            this.currentPage--;
          }

          // 重新加载二维码列表以显示最新数据
          this.loadQRCodeList();
        } else {
          uni.showToast({
            title: response.message || '删除失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('删除二维码失败:', error);
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    },

    // 显示编辑用的地址选择器
    async showAddressSelectorForEdit() {
      // 如果地址列表已存在且不为空，直接显示地址选择器
      if (this.addressList && this.addressList.length > 0) {
        // 只有在编辑表单已显示的情况下才显示地址选择器
        if (this.showEditForm) {
          // 检查页面是否仍然存在，避免在页面已销毁后设置数据
          if (!this._isDestroyed && !this._isBeingDestroyed) {
            this.showEditAddressSelector = true;
          }
        }
        return; // 直接返回，不需要再次请求
      }

      // 如果地址列表为空，先获取地址列表
      this.isLoadingAddressList = true; // 开始加载地址列表
      this.addressList = []; // 初始化为空数组

      try {
        const response = await post('/api/v2/User/AddressList', {}, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        // 检查页面是否仍然存在，避免在页面已销毁后设置数据
        if (!this._isDestroyed && !this._isBeingDestroyed) {
          if (response.code === 200) {
            this.addressList = response.data || [];
            // 只有在编辑表单已显示的情况下才显示地址选择器
            if (this.showEditForm) {
              this.showEditAddressSelector = true;
            }
          } else {
            uni.showToast({
              title: response.message || '获取地址列表失败',
              icon: 'none',
              duration: 2000
            });
            // 关闭地址选择器，避免显示空弹窗
            this.showEditAddressSelector = false;
            this.updateModalState(); // 更新模态框状态
          }
        }
      } catch (error) {
        // 检查页面是否仍然存在，避免在页面已销毁后设置数据
        if (!this._isDestroyed && !this._isBeingDestroyed) {
          console.error('获取地址列表失败:', error);
          uni.showToast({
            title: '网络错误，请重试',
            icon: 'none',
            duration: 2000
          });
          // 关闭地址选择器，避免显示空弹窗
          this.showEditAddressSelector = false;
          this.updateModalState(); // 更新模态框状态
        }
      } finally {
        // 检查页面是否仍然存在，避免在页面已销毁后设置数据
        if (!this._isDestroyed && !this._isBeingDestroyed) {
          this.isLoadingAddressList = false; // 结束加载地址列表
        }
      }
    },

    // 关闭编辑用的地址选择器
    closeAddressSelectorForEdit() {
      this.showEditAddressSelector = false;
    },

    // 选择编辑用的地址
    selectAddressForEdit(address) {
      this.editQRCode.addressId = address.addressId;
      this.showEditAddressSelector = false;
    },

    // 根据地址ID获取地址名称
    getSelectedAddressName(addressId) {
      const address = this.addressList.find(addr => addr.addressId === addressId);
      return address ? address.name : '请选择场地';
    },

    handleLogout() {
      // 清除本地存储的token
      uni.removeStorageSync('token');

      // 跳转回登录页面
      uni.reLaunch({
        url: '/pages/index/index'
      });
    },

    // 上一页
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadQRCodeList();
      }
    },

    // 下一页
    nextPage() {
      if (this.currentPage < Math.ceil(this.total / pageSize)) {
        this.currentPage++;
        this.loadQRCodeList();
      }
    },

    // 加载二维码列表
    async loadQRCodeList() {
      try {
        // 从本地存储获取用户信息
        const userInfo = uni.getStorageSync('userInfo');
        if (!userInfo || userInfo.role !== 4) {
          console.error('用户角色不是4，无法加载二维码列表');
          return;
        }

        // 发送请求获取二维码数据
        const response = await post('/api/v2/SalesQRCode/SalesQRCodeList', {
          pageSize: this.pageSize,
          currentPage: this.currentPage
        }, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        if (response.code === 200) {
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            // 更新分页信息
            this.total = response.totalCount || 0;
            this.totalPages = Math.ceil(this.total / this.pageSize);
            this.hasMore = this.currentPage < this.totalPages;

            // 清空现有列表并填充新数据
            this.qrCodeList = [];
            for (const item of response.data) {
              // 构造二维码链接
              const qrCodeUrl = `https://www.huanxizn.com/activityCurrency/?salesQRCodeId=${item.salesQRCodeId}`;

              // 计算活动币有效时间（创建时间加上有效小时数）
              const creationTime = new Date(item.creationTime);
              const coinsExpireTime = new Date(creationTime.getTime() + (item.coinsExpireHour * 60 * 60 * 1000));

              try {
                // 生成二维码模块并保存到列表
                const qrCodeModules = await this.generateSingleQRCode(qrCodeUrl);

                this.qrCodeList.push({
                  salesQRCodeId: item.salesQRCodeId,
                  addressId: item.addressId,
                  expireMin: item.expireMin || 1, // 二维码有效时间（分钟）
                  coins: item.coins || 1, // 币数
                  expireTime: item.expireTime,
                  creationTime: item.creationTime,
                  coinsExpireHour: item.coinsExpireHour,
                  coinsExpireTime: this.formatDateTime(coinsExpireTime),
                  modules: qrCodeModules, // 使用模块数据替代图片URL
                  addressName: `场地${item.addressId}` // 临时使用ID作为名称
                });
              } catch (error) {
                console.error(`生成二维码失败，ID: ${item.salesQRCodeId}`, error);

                // 即使生成失败也添加到列表，但模块为空
                this.qrCodeList.push({
                  salesQRCodeId: item.salesQRCodeId,
                  addressId: item.addressId,
                  expireMin: item.expireMin || 1, // 二维码有效时间（分钟）
                  coins: item.coins || 1, // 币数
                  expireTime: item.expireTime,
                  creationTime: item.creationTime,
                  coinsExpireHour: item.coinsExpireHour,
                  coinsExpireTime: this.formatDateTime(coinsExpireTime),
                  modules: [], // 模块为空
                  addressName: `场地${item.addressId}` // 临时使用ID作为名称
                });
              }
            }

            // 获取地址列表并更新场地名称
            await this.updateAddressNames();

            // 显示二维码列表
            this.showQRCode = true;
            this.noQRCodeData = false;
            this.isQRCodeExists = true; // 设置二维码存在标志

            // 确保在加载完数据后，不会意外打开任何弹窗
            this.showAddressSelector = false;
            this.showEditAddressSelector = false;
          } else if (response.data && Array.isArray(response.data) && response.data.length === 0) {
            // 如果当前页没有数据，判断是否还有更多页
            if (this.currentPage > 1) {
              // 如果不是第一页且没有数据，说明已经到达最后一页
              this.hasMore = false;
            } else {
              // 如果是第一页且没有数据，说明没有数据
              this.noQRCodeData = true;
              this.showQRCode = false;
            }

            // 确保在没有数据时也不会意外打开任何弹窗
            this.showAddressSelector = false;
            this.showEditAddressSelector = false;
          } else {
            console.error('获取二维码数据失败: 数据格式不正确', response);
            this.noQRCodeData = true;
            this.showQRCode = false;

            // 确保在失败时也不会意外打开任何弹窗
            this.showAddressSelector = false;
            this.showEditAddressSelector = false;
          }
        } else {
          console.error('获取二维码数据失败:', response.message || '操作失败');
          this.noQRCodeData = true;
          this.showQRCode = false;

          // 确保在失败时也不会意外打开任何弹窗
          this.showAddressSelector = false;
          this.showEditAddressSelector = false;
        }
      } catch (error) {
        console.error('加载二维码列表时出错:', error);
        uni.showToast({
          title: error.message || '加载二维码列表失败',
          icon: 'none'
        });

        // 确保在异常时也不会意外打开任何弹窗
        this.showAddressSelector = false;
        this.showEditAddressSelector = false;
      } finally {
        // 确保无论成功还是失败都要结束加载状态
        this.isLoading = false;
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

    // 生成单个二维码模块
    generateSingleQRCode(text) {
      return new Promise((resolve, reject) => {
        try {
          // 根据屏幕宽度调整二维码大小
          let qrSize;
          if (this.screenWidth < 560) {
            qrSize = 150; // 小屏幕设备
          } else {
            qrSize = 180; // 大屏幕设备
          }

          // 1. 创建并配置uQRCode实例
          const qr = new uQRCode();
          qr.data = text;
          qr.size = qrSize; // 二维码大小
          qr.margin = 10;
          qr.backgroundColor = '#ffffff';
          qr.foregroundColor = '#000000';
          qr.errorCorrectLevel = uQRCode.errorCorrectLevel.H;

          // 2. 调用制作方法
          qr.make();

          // 3. 返回二维码模块数据
          const modules = [...qr.modules]; // 使用展开运算符确保响应式更新
          console.log('二维码模块生成成功，模块数量:', modules.length);
          console.log('第一个模块示例:', modules[0] && modules[0][0]);
          resolve(modules);
        } catch (error) {
          console.error('生成二维码模块失败:', error);
          uni.showToast({
            title: '生成二维码失败',
            icon: 'none',
            duration: 2000
          });
          reject(error);
        }
      });
    },

    // 上一页
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadQRCodeList();
      }
    },

    // 下一页
    nextPage() {
      if (this.currentPage < Math.ceil(this.total / this.pageSize)) {
        this.currentPage++;
        this.loadQRCodeList();
      }
    },

    // 过滤添加用的场地列表
    filterAddresses() {
      // 由于使用了computed属性，这里不需要额外处理
    },

    // 过滤编辑用的场地列表
    filterEditAddresses() {
      // 由于使用了computed属性，这里不需要额外处理
    },

    // 启动自动刷新定时器
    startAutoRefresh() {
      // 清理可能存在的旧定时器
      this.clearAutoRefresh();

      // 设置新的定时器，每5分钟(300000毫秒)刷新一次数据
      this.autoRefreshTimer = setInterval(() => { 
        this.loadQRCodeList();
      }, 5 * 60 * 1000); // 5分钟 = 5 * 60 * 1000 毫秒 
    },

    // 清理自动刷新定时器
    clearAutoRefresh() {
      console.log('清理自动刷新定时器');
      if (this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer);
        this.autoRefreshTimer = null;
      }
    }
  }
}
</script>

<style>
/* 设置页面高度 */
page {
  height: 100%;
}

.feature-container-role4 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-height: 100vh;
  padding: 40rpx 20rpx 120rpx; /* 增加底部边距，为悬浮按钮和底部导航栏留出空间 */
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-sizing: border-box;
  overflow: hidden; /* 防止出现滚动条 */
}

/* 当弹窗打开时固定页面 */
.feature-container-role4.modal-open { 
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
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
  max-width: 800rpx; /* 增加大屏幕的最大宽度 */
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

.qr-code-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
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

.qr-code-info {
  font-size: 28rpx;
  color: #666;
  margin-top: 20rpx;
}

/* 时间信息样式 */
.time-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30rpx;
}

.time-item {
  font-size: 26rpx;
  color: #666;
  margin: 10rpx 0;
}

/* 二维码包装器样式，用于添加点击效果 */
.qr-code-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20rpx 0;
  border-radius: 10rpx;
  transition: all 0.3s ease;
}

.qr-code-wrapper:active {
  opacity: 0.8;
  transform: scale(0.98);
}

/* 全屏覆盖层样式 */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  overflow: hidden; /* 确保覆盖层本身不出现滚动条 */
}

/* 全屏内容样式 */
.fullscreen-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
  background-color: #fff;
  border-radius: 20rpx;
  margin: 40rpx;
  box-sizing: border-box;
  max-width: calc(100% - 80rpx);
  width: auto;
  max-height: calc(100% - 80rpx);
  min-width: 70%; /* 确保在小屏幕上也有足够的内边距 */
  /* 确保不出现水平滚动条 */
  overflow-x: hidden;
  /* 只有在内容超出容器高度时才显示滚动条 */
  overflow-y: auto;
}

/* 全屏二维码样式 */
.fullscreen-qrcode {
  width: 600rpx;
  height: 600rpx;
  margin-bottom: 40rpx;
}

/* 关闭按钮样式 */
.close-btn {
  padding: 20rpx 40rpx;
  background-color: #667eea;
  color: white;
  border-radius: 50rpx;
  font-size: 28rpx;
}

/* 全屏弹窗详细信息样式 */
.fullscreen-detail {
  width: 100%;
  max-width: 100%;
  margin-top: 30rpx;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 15rpx;
  word-wrap: break-word; /* 允许长内容换行 */
  overflow-x: hidden; /* 隐藏不必要的横向滚动条 */
}

/* 详细信息项样式 */
.detail-item {
  display: flex;
  margin-bottom: 20rpx;
  width: 100%;
  box-sizing: border-box;
}

/* 详细信息标签样式 */
.detail-label {
  font-size: 26rpx;
  color: #666;
  width: 200rpx; /* 增加宽度以防止重合 */
  flex-shrink: 0;
  margin-right: 10rpx; /* 添加右边距 */
  white-space: nowrap; /* 不允许换行 */
  overflow: hidden; /* 防止内容溢出 */
  text-overflow: ellipsis; /* 溢出时显示省略号 */
}

/* 详细信息值样式 */
.detail-value {
  font-size: 26rpx;
  color: #333;
  flex: 1;
  word-break: break-word; /* 允许在单词内换行 */
  overflow: hidden; /* 防止内容溢出 */
  min-width: 0; /* 允许flex项目缩小 */
}

/* 换行样式 */
.wrap {
  white-space: normal; /* 允许换行 */
}

/* 不换行样式 */
.no-wrap {
  white-space: nowrap; /* 防止换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 溢出时显示省略号 */
  flex: 1; /* 确保在flex容器中正确分配空间 */
}

/* 单个二维码样式 */
.single-qr-code {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 二维码列表样式 */
.qr-code-list {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.qr-code-list  .qr-card:not(:last-child) {
  margin-bottom: 20rpx;
}

/* 二维码卡片样式 */
.qr-card {
  display: flex;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  box-sizing: border-box;
  align-items: center;
  width: 100%; /* 确保卡片宽度充分利用 */
  min-height: 187rpx; /* 降低最小高度至原来的约1/3 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 二维码左侧（黑白块二维码） */
.qr-left {
  flex: 0 0 180rpx; /* 调整以适应新的二维码尺寸 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 二维码图片样式 */
.qr-image {
  width: 150rpx; /* 调整以适应新的卡片高度 */
  height: 150rpx; /* 调整以适应新的卡片高度 */
}

/* 二维码模块容器样式 */
.qr-modules {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 二维码模块内容样式 */
.qr-modules-content {
  display: flex;
  flex-direction: column;
}

/* 小尺寸二维码行样式 */
.qr-row-small {
  display: flex;
  flex-direction: row;
  flex-shrink: 0; /* 防止在flex容器中被压缩 */
}

/* 小尺寸二维码列样式 */
.qr-col-small {
  display: flex;
  flex-shrink: 0; /* 防止在flex容器中被压缩 */
}

/* 小尺寸二维码点样式 */
.qr-dot-black-small {
  background-color: black;
  flex-shrink: 0; /* 防止在flex容器中被压缩 */
}

.qr-dot-white-small {
  background-color: white;
  flex-shrink: 0; /* 防止在flex容器中被压缩 */
}

/* 全屏二维码模块样式 */
.fullscreen-qrcode-modules {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  max-width: 100%;
  max-height: 60vh; /* 限制最大高度 */
  width: fit-content; /* 让宽度适应内容，但不超过父容器 */
  max-width: 100%; /* 确保不超过父容器 */
  overflow-x: hidden; /* 隐藏不必要的横向滚动条 */
}

/* 全屏二维码模块内容样式 */
.fullscreen-qrcode-modules-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  overflow: hidden; /* 确保内容不溢出 */
  align-items: center; /* 居中对齐内容 */
}

/* 全屏二维码行样式 */
.qr-row-fullscreen {
  display: flex;
  flex-direction: row;
  flex-shrink: 0; /* 防止在flex容器中被压缩 */
  flex-wrap: nowrap; /* 防止换行 */
  width: 100%; /* 确保行宽度不超过容器 */
  overflow: hidden; /* 隐藏可能的溢出 */
}

/* 全屏二维码列样式 */
.qr-col-fullscreen {
  display: flex;
  flex-shrink: 0; /* 防止在flex容器中被压缩 */
  flex-wrap: nowrap; /* 防止换行 */
  max-width: 100%; /* 确保列宽度不超过容器 */
}

/* 全屏二维码点样式 */
.qr-dot-black-fullscreen {
  background-color: black;
  flex-shrink: 0; /* 防止在flex容器中被压缩 */
  flex-grow: 0; /* 防止放大 */
  max-width: 100%; /* 确保不超过容器 */
}

.qr-dot-white-fullscreen {
  background-color: white;
  flex-shrink: 0; /* 防止在flex容器中被压缩 */
  flex-grow: 0; /* 防止放大 */
  max-width: 100%; /* 确保不超过容器 */
}

/* 小尺寸二维码占位符样式 */
.qr-placeholder-small {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 10rpx;
  min-width: 120rpx;
  min-height: 120rpx;
  max-width: 200rpx;
  max-height: 200rpx;
}

/* 全屏二维码占位符样式 */
.qr-placeholder-fullscreen {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 10rpx;
  max-width: 100%;
  max-height: 40vh;
  min-width: 150rpx;
  min-height: 150rpx;
}

/* 二维码右侧（信息） */
.qr-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-left: 20rpx;
  min-width: 0; /* 允许内容收缩 */
}

/* 信息项样式 */
.qr-info {
  display: flex;
  margin-bottom: 15rpx;
  white-space: nowrap; /* 防止换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 溢出时显示省略号 */
}

/* 字段名称样式 */
.field-name {
  font-size: 26rpx;
  color: #666;
  white-space: nowrap; /* 防止换行 */
  flex-shrink: 0; /* 不收缩 */
  width: 100rpx; /* 减小宽度 */
}

/* 字段值样式 */
.field-value {
  font-size: 26rpx;
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

/* 悬浮按钮样式 */
.fab-button {
  position: fixed;
  bottom: 160rpx; /* 位于底部导航栏之上，考虑到底部导航栏高度为100rpx，再加上一些间距 */
  right: 40rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.4);
  z-index: 998;
  cursor: pointer;
}

.fab-icon {
  font-size: 40rpx;
  color: white;
  font-weight: bold;
  line-height: 1;
}

.fab-button:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 10rpx rgba(102, 126, 234, 0.6);
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

.form-group-role4 {
  margin-bottom: 30rpx;
}

.form-group-role4 label {
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

.address-selector {
  max-height: 70vh;
  display: flex;
  flex-direction: column;
}

.search-box-address-selector {
  display: flex;
  margin-bottom: 20rpx;
}

.search-input-address-selector {
  flex: 1;
  height: 60rpx;
  padding: 0 20rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 10rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.address-list {
  flex: 1;
  margin: 20rpx 0;
  max-height: calc(70vh - 220rpx); /* 调整高度以适应标题、搜索框和按钮 */
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

.no-data-content {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx 20rpx;
}

.no-data-text {
  font-size: 28rpx;
  color: #999;
}

/* 详情弹窗操作按钮样式 */
.detail-actions {
  display: flex;
  margin-top: 30rpx;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden; /* 防止按钮区域出现滚动条 */
  flex-wrap: nowrap; /* 防止按钮换行造成宽度增加 */
}

.detail-actions .detail-action-btn:not(:last-child){
  margin-right: 15rpx;
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
</style>