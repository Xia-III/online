<template>
  <view class="feature-container-role2">
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
      <!-- 只有角色为4的用户才能看到添加按钮 -->
      <button class="add-btn" @click="onAdd" v-if="currentUserRole === 4">+</button>
    </view>


    <!-- 管理员列表 -->
    <view class="admin-list">
      <view
        class="admin-card"
        :class="{'admin-card-active': admin.status === 1, 'admin-card-inactive': admin.status === 0}"
        v-for="admin in adminList"
        :key="admin.userId"
      >
        <view class="card-header" @click="showAdminDetail(admin)">
          <view class="user-info">
            <text class="username">{{ admin.nickname || admin.loginName }}</text>
          </view>
          <button class="detail-btn" @click.stop="showAdminDetail(admin)">详情</button>
        </view>
      </view>
    </view>

    <!-- 添加用户弹窗 -->
    <view v-if="showAddForm" class="modal-overlay" @click="closeModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">添加用户</text>
        <view class="form-group-role2">
          <label>账号 *</label>
          <input
            type="text"
            placeholder="请输入账号"
            v-model="newUser.account"
            class="form-input"
            :class="{ 'error-input': addFormErrors.account }"
          />
          <text v-if="addFormErrors.account" class="error-message">{{ addFormErrors.account }}</text>
        </view>
        <view class="form-group-role2">
          <label>密码 *</label>
          <input
            type="text"
            placeholder="请输入密码"
            v-model="newUser.password"
            class="form-input"
            :class="{ 'error-input': addFormErrors.password }"
          />
          <text v-if="addFormErrors.password" class="error-message">{{ addFormErrors.password }}</text>
        </view>
        <view class="form-group-role2">
          <label>描述</label>
          <input
            type="text"
            placeholder="请输入描述（可选）"
            v-model="newUser.description"
            class="form-input"
          />
        </view>
        <view class="form-group-role2" @click="showAddressSelector = true">
          <label>代理场地 *</label>
          <view class="picker" :class="{ 'error-input': addFormErrors.addressId }">
            {{ selectedAddressIndex >= 0 ? addressList[selectedAddressIndex].name : '请选择代理场地' }}
          </view>
          <text v-if="addFormErrors.addressId" class="error-message">{{ addFormErrors.addressId }}</text>
        </view>
        <view class="form-group-role2">
          <label>二维码有效时间（分钟）</label>
          <input
            type="number"
            placeholder="请输入二维码有效时间（分钟）"
            v-model.number="newUser.expireMin"
            class="form-input"
            :class="{ 'error-input': addFormErrors.expireMin }"
          />
          <text v-if="addFormErrors.expireMin" class="error-message">{{ addFormErrors.expireMin }}</text>
        </view>
        <view class="form-group-role2">
          <label>活动币数</label>
          <input
            type="number"
            placeholder="请输入活动币数"
            v-model.number="newUser.coins"
            class="form-input"
            :class="{ 'error-input': addFormErrors.coins }"
          />
          <text v-if="addFormErrors.coins" class="error-message">{{ addFormErrors.coins }}</text>
        </view>
        <view class="form-group-role2">
          <label>活动币有效时间（小时）</label>
          <input
            type="number"
            placeholder="请输入活动币有效时间（小时）"
            v-model.number="newUser.coinsExpireHour"
            class="form-input"
            :class="{ 'error-input': addFormErrors.coinsExpireHour }"
          />
          <text v-if="addFormErrors.coinsExpireHour" class="error-message">{{ addFormErrors.coinsExpireHour }}</text>
        </view>
        <view class="form-group-role2">
          <label>活动每天领取次数</label>
          <input
            type="number"
            placeholder="请输入活动每天领取次数"
            v-model.number="newUser.dailyScanLimit"
            class="form-input"
            :class="{ 'error-input': addFormErrors.dailyScanLimit }"
          />
          <text v-if="addFormErrors.dailyScanLimit" class="error-message">{{ addFormErrors.dailyScanLimit }}</text> 
        </view>
        <view class="form-buttons">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-submit" @click="submitUser">提交</button>
        </view>
      </view>
    </view>

    <!-- 场地选择弹窗 -->
    <view v-if="showAddressSelector" class="modal-overlay" @click="closeAddressSelector">
      <view class="modal-content address-selector" @click.stop>
        <text class="modal-title">选择代理场地</text>
        <view class="search-box-address-selector">
          <input
            type="text"
            placeholder="搜索场地..."
            v-model="addressSearchKeyword"
            @input="filterAddresses"
            class="search-input-address-selector"
          />
        </view>
        <scroll-view class="address-list" scroll-y="true">
          <view
            class="address-item"
            v-for="(address, index) in filteredAddressList"
            :key="address.addressId"
            @click="selectAddressByData(address)"
          >
            <text>{{ address.name }}</text>
            <text class="address-detail">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.street }}</text>
          </view>
        </scroll-view>
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
            <text class="value">{{ selectedAdmin.loginName }}</text>
          </view>
          <view class="info-row">
            <text class="label">密码:</text>
            <text class="value">{{ selectedAdmin.password }}</text>
          </view>
          <view class="info-row">
            <text class="label">昵称:</text>
            <text class="value">{{ selectedAdmin.nickname || '未设置昵称' }}</text>
          </view>
          <view class="info-row">
            <text class="label">描述:</text>
            <text class="value">{{ selectedAdmin.description || '无描述' }}</text>
          </view>
          <view class="info-row">
            <text class="label">角色:</text>
            <text class="value">{{ selectedAdmin.role === 2 ? '管理员' : (selectedAdmin.role === 3 ? '超级管理员' : '普通用户') }}</text>
          </view>
          <view class="info-row">
            <text class="label">地址ID:</text>
            <text class="value">{{ selectedAdmin.addressId }}</text>
          </view>
          <view class="info-row">
            <text class="label">状态:</text>
            <text class="value" :style="{ color: selectedAdmin.status === 1 ? '#67C23A' : '#F56C6C' }">
              {{ selectedAdmin.status === 1 ? '正常' : '禁用' }}
            </text>
          </view>
          <view class="info-row">
            <text class="label">二维码有效时间:</text>
            <text class="value">{{ selectedAdmin.expireMin || 0 }} 分钟</text>
          </view>
          <view class="info-row">
            <text class="label">活动币数:</text>
            <text class="value">{{ selectedAdmin.coins || 0 }}</text>
          </view>
          <view class="info-row">
            <text class="label">活动币有效时间:</text>
            <text class="value">{{ selectedAdmin.coinsExpireHour || 0 }} 小时</text>
          </view>
          <view class="info-row">
            <text class="label">活动每天领取次数:</text>
            <text class="value">{{ selectedAdmin.dailyScanLimit || 0 }} 次</text>
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
        <view class="form-group-role2">
          <label>昵称</label>
          <input
            type="text"
            placeholder="请输入昵称"
            v-model="updateForm.nickname"
            class="form-input"
            :class="{ 'error-input': updateFormErrors.nickname }"
          />
          <text v-if="updateFormErrors.nickname" class="error-message">{{ updateFormErrors.nickname }}</text>
        </view>
        <view class="form-group-role2">
          <label>描述</label>
          <input
            type="text"
            placeholder="请输入描述"
            v-model="updateForm.description"
            class="form-input"
            :class="{ 'error-input': updateFormErrors.description }"
          />
          <text v-if="updateFormErrors.description" class="error-message">{{ updateFormErrors.description }}</text>
        </view>
        <view class="form-group-role2">
          <label>密码</label>
          <input
            type="text"
            placeholder="请输入新密码"
            v-model="updateForm.password"
            class="form-input"
            :class="{ 'error-input': updateFormErrors.password }"
          />
          <text v-if="updateFormErrors.password" class="error-message">{{ updateFormErrors.password }}</text>
        </view>
        <view class="form-group-role2" @click="showUpdateAddressSelector = true">
          <label>代理场地</label>
          <view class="picker" :class="{ 'error-input': updateFormErrors.addressId }">
            {{ updateSelectedAddressIndex >= 0 ? addressList[updateSelectedAddressIndex].name : (selectedAdmin.addressId ? getAddressNameById(selectedAdmin.addressId) : '请选择代理场地') }}
          </view>
          <text v-if="updateFormErrors.addressId" class="error-message">{{ updateFormErrors.addressId }}</text>
        </view>
        <view class="form-group-role2">
          <label>二维码有效时间（分钟）</label>
          <input
            type="number"
            placeholder="请输入二维码有效时间（分钟）"
            v-model.number="updateForm.expireMin"
            class="form-input"
            :class="{ 'error-input': updateFormErrors.expireMin }"
          />
          <text v-if="updateFormErrors.expireMin" class="error-message">{{ updateFormErrors.expireMin }}</text>
        </view>
        <view class="form-group-role2">
          <label>活动币数</label>
          <input
            type="number"
            placeholder="请输入活动币数"
            v-model.number="updateForm.coins"
            class="form-input"
            :class="{ 'error-input': updateFormErrors.coins }"
          />
          <text v-if="updateFormErrors.coins" class="error-message">{{ updateFormErrors.coins }}</text>
        </view>
        <view class="form-group-role2">
          <label>活动币有效时间（小时）</label>
          <input
            type="number"
            placeholder="请输入活动币有效时间（小时）"
            v-model.number="updateForm.coinsExpireHour"
            class="form-input"
            :class="{ 'error-input': updateFormErrors.coinsExpireHour }"
          />
          <text v-if="updateFormErrors.coinsExpireHour" class="error-message">{{ updateFormErrors.coinsExpireHour }}</text>
        </view>
        <view class="form-group-role2">
          <label>活动每天领取次数</label>
          <input
            type="number"
            placeholder="请输入活动每天领取次数"
            v-model.number="updateForm.dailyScanLimit"
            class="form-input"
            :class="{ 'error-input': updateFormErrors.dailyScanLimit }"
          />
          <text v-if="updateFormErrors.dailyScanLimit" class="error-message">{{ updateFormErrors.dailyScanLimit }}</text>
        </view>
        <view class="form-buttons">
          <button class="btn-cancel" @click="closeUpdateModal">取消</button>
          <button class="btn-submit" @click="submitUpdate">提交</button>
        </view>
      </view>
    </view>

    <!-- 修改用户场地选择弹窗 -->
    <view v-if="showUpdateAddressSelector" class="modal-overlay" @click="closeUpdateAddressSelector">
      <view class="modal-content address-selector" @click.stop>
        <text class="modal-title">选择代理场地</text>
        <view class="search-box-address-selector">
          <input
            type="text"
            placeholder="搜索场地..."
            v-model="updateAddressSearchKeyword"
            @input="filterUpdateAddresses"
            class="search-input-address-selector"
          />
        </view>
        <scroll-view class="address-list" scroll-y="true">
          <view
            class="address-item"
            v-for="(address, index) in filteredUpdateAddressList"
            :key="address.addressId"
            @click="selectUpdateAddressByData(address)"
          >
            <text>{{ address.name }}</text>
            <text class="address-detail">{{ address.province }}{{ address.city }}{{ address.district }}{{ address.street }}</text>
          </view>
        </scroll-view>
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
      <!-- 角色4: 二维码、审核、管理、个人 -->
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

      <!-- 角色2: 二维码、审核、个人 -->
      <block v-else-if="currentUserRole === 2">
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
          :class="{ 'active': activeTab === 'profile' }"
          @click="switchTab('profile')"
        >
          <text class="tab-text">个人</text>
        </view>
      </block>

      <!-- 其他角色: 二维码、个人 -->
      <block v-else-if="currentUserRole">
        <view
          class="tab-bar-item"
          :class="{ 'active': activeTab === 'decode' }"
          @click="switchTab('decode')"
        >
          <text class="tab-text">二维码</text>
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
        nickname: '',
        description: '',
        password: '',
        oldPassword: '',
        addressId: null,
        expireMin: 60,          // 二维码有效时间（分钟）
        coins: 6,              // 活动币数
        coinsExpireHour: 1,    // 活动币有效时间（小时）
        dailyScanLimit: 1      // 活动币每天领取次数
      },
      adminList: [],        // 用户列表
      currentUserRole: null, // 当前用户角色，从用户信息中获取
      newUser: {            // 新用户数据
        account: '',
        password: '',
        description: '',
        addressId: null,       // 新增场地ID字段
        expireMin: 60,         // 二维码有效时间（分钟），默认60分钟
        coins: 2,              // 活动币数，默认2个
        coinsExpireHour: 1,    // 活动币有效时间（小时），默认1小时
        dailyScanLimit: 1      // 活动币每天领取次数，默认5次
      },
      addressList: [],      // 代理场地列表
      loading: false,        // 加载状态
      pagination: {          // 分页信息
        currentPage: 1,
        pageSize: 5,
        totalCount: 0
      },
      selectedAddressIndex: -1, // 选中的场地索引
      showAddressSelector: false, // 是否显示添加用户场地选择器
      addressSearchKeyword: '', // 场地搜索关键字
      updateSelectedAddressIndex: -1, // 修改用户时选中的场地索引
      showUpdateAddressSelector: false, // 是否显示修改用户场地选择器
      updateAddressSearchKeyword: '', // 修改用户场地搜索关键字
      addFormErrors: {}, // 添加用户表单错误信息
      updateFormErrors: {}, // 修改用户表单错误信息
      autoRefreshTimer: null // 自动刷新定时器
    }
  },
  computed: {
    // 过滤后的场地列表
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

    // 过滤后的修改用户场地列表
    filteredUpdateAddressList() {
      if (!this.updateAddressSearchKeyword) {
        return this.addressList;
      }
      const keyword = this.updateAddressSearchKeyword.toLowerCase();
      return this.addressList.filter(address =>
        address.name.toLowerCase().includes(keyword) ||
        (address.province && address.province.toLowerCase().includes(keyword)) ||
        (address.city && address.city.toLowerCase().includes(keyword)) ||
        (address.district && address.district.toLowerCase().includes(keyword)) ||
        (address.street && address.street.toLowerCase().includes(keyword))
      );
    }
  },
  onLoad() {
    // 隐藏顶部电池,时间等信息（仅在App环境中可用）
    if (typeof plus !== 'undefined') {
      plus.navigator.setFullscreen(true);
    }
    // 页面加载时获取当前用户角色
    this.getCurrentUserRole();

    // 启动自动刷新定时器（每5分钟刷新一次）
    this.startAutoRefresh();
  },

  onShow() {
    // 页面每次显示时都刷新用户列表
    this.fetchAdminList();
    // 页面显示时再次检查用户角色，以防万一
    if (!this.currentUserRole) {
      this.getCurrentUserRole();
    }
    // 页面显示时重新启动自动刷新定时器
    this.startAutoRefresh();
  },

  onUnload() {
    // 页面卸载时清理自动刷新定时器
    this.clearAutoRefresh();
  },

  onHide() {
    // 页面隐藏时也清理自动刷新定时器（如通过底部导航切换页面）
    this.clearAutoRefresh();
  },

  methods: {
    // 显示全局提示信息（主要用于非表单验证类的提示）
    showGlobalToast(title) {
      // 尝试使用原生API确保提示显示在最上层
      if (typeof plus !== 'undefined' && plus.nativeUI) {
        // 在App环境下使用原生toast
        plus.nativeUI.toast(title, { duration: 'long' });
      } else {
        // 在H5和其他环境下，尝试使用更高层级的提示
        // 通过创建一个自定义的提示元素来确保显示在最上层
        this.$nextTick(() => {
          uni.showToast({
            title: title,
            icon: 'none',
            duration: 2500,
            mask: true
          });
        });
      }
    },
    getCurrentUserRole() {
      // 从本地存储获取用户信息或token，然后获取角色
      // 这里假设用户信息存储在本地存储中
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

    switchTab(tabName) {
      this.activeTab = tabName;

      if (tabName === 'profile') {
        // 跳转到个人资料页面
        uni.redirectTo({
          url: '/pages/main/profile'
        });
      } else if (tabName === 'decode') {
        // 根据用户角色跳转到对应的二维码页面
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
        // 当前就是管理页面（role2页面），无需跳转
        return;
      } else if (tabName === 'history') {
        // 跳转到审核页面（feature页面）
        uni.redirectTo({
          url: '/pages/main/feature'
        });
      }
    },

    async fetchAdminList() {
      try {
        // 显示加载提示
        this.loading = true;
        uni.showLoading({
          title: '加载中...'
        });

        // 构建请求参数
        const params = {
          pageSize: this.pagination.pageSize,
          currentPage: this.pagination.currentPage,
          kw: this.searchKeyword || '',
          isDeleted: 0,
          status: 0
        };

        // 获取用户列表 - 使用新的API
        const response = await post('/api/v2/User/SubList', params, { 
          'Content-Type': 'application/json-patch+json', 
          'accept': '*/*'
        });

        if (response.code === 200) {
          // 初始化用户列表
          let userList = response.data || [];

          // 更新分页信息
          this.pagination.totalCount = response.totalCount || 0;


          this.adminList = userList;
          console.log('用户列表获取成功:', this.adminList); // 添加调试信息

          // 获取用户列表后，更新全部二维码数
        } else {
          uni.showToast({
            title: response.message || '获取用户列表失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取用户列表失败:', error);
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      } finally {
        // 隐藏加载提示
        this.loading = false;
        uni.hideLoading();
      }
    },


    async onSearch() {
      // 处理搜索逻辑
      console.log('搜索:', this.searchKeyword);
      // 搜索时回到第一页
      this.pagination.currentPage = 1;
      await this.fetchAdminList();
    },
    async onAdd() {
      try {
        // 获取代理场地列表
        const response = await post('/api/v2/User/AddressList', {}, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        if (response.code === 200) {
          this.addressList = response.data || [];

          // 显示添加用户表单
          this.showAddForm = true;
          // 重置表单数据，保留默认值
          this.newUser = {
            account: '',
            password: '',
            description: '',
            addressId: null,
            expireMin: 60,         // 二维码有效时间（分钟），默认60分钟
            coins: 6,              // 活动币数，默认2个
            coinsExpireHour: 1,    // 活动币有效时间（小时），默认1小时
            dailyScanLimit: 1      // 活动币每天领取次数，默认5次
          };
        } else {
          uni.showToast({
            title: response.message || '获取代理场地列表失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取代理场地列表失败:', error);
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    },
    closeModal() {
      // 关闭弹窗
      this.showAddForm = false;
      // 重置场地选择
      this.selectedAddressIndex = -1;
      this.newUser.addressId = null;
    },
    async submitUser() {
      // 清空之前的错误信息
      this.addFormErrors = {};

      // 验证必填字段
      if (!this.newUser.account) {
        this.addFormErrors.account = '请输入账号';
        return;
      }

      if (!this.newUser.password) {
        this.addFormErrors.password = '请输入密码';
        return;
      }

      if (!this.newUser.addressId) {
        this.addFormErrors.addressId = '请选择代理场地';
        return;
      }

      if (this.newUser.expireMin === undefined || this.newUser.expireMin === null || this.newUser.expireMin <= 0) {
        this.addFormErrors.expireMin = '请输入有效的二维码有效时间（必须大于0）';
        return;
      }

      if (this.newUser.coins === undefined || this.newUser.coins === null || this.newUser.coins <= 0) {
        this.addFormErrors.coins = '请输入有效的活动币数（必须大于0）';
        return;
      }

      if (this.newUser.coinsExpireHour === undefined || this.newUser.coinsExpireHour === null || this.newUser.coinsExpireHour <= 0) {
        this.addFormErrors.coinsExpireHour = '请输入有效的活动币有效时间（必须大于0）';
        return;
      }

      if (this.newUser.dailyScanLimit === undefined || this.newUser.dailyScanLimit === null || this.newUser.dailyScanLimit <= 0) {
        this.addFormErrors.dailyScanLimit = '请输入有效的活动每天领取次数（必须大于0）';
        return;
      }

      try {
        // 发送请求 - 使用新的API路径和参数传递方式
        const params = {
          loginName: this.newUser.account,
          password: this.newUser.password,
          description: this.newUser.description || "", // 描述字段是可选的，未填写时默认为空字符串
          addressId: this.newUser.addressId,
          expireMin: this.newUser.expireMin || 0,           // 二维码有效时间（分钟）
          coins: this.newUser.coins || 0,                 // 活动币数
          coinsExpireHour: this.newUser.coinsExpireHour || 0, // 活动币有效时间（小时）
          dailyScanLimit: this.newUser.dailyScanLimit || 0  // 活动币每天领取次数
        };

        const response = await post('/api/v2/User/Create', params, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        if (response.code === 200) {
          // 提交成功
          uni.showToast({
            title: '用户添加成功',
            icon: 'success'
          });

          // 关闭表单
          this.showAddForm = false;

          // 重置场地选择
          this.selectedAddressIndex = -1;
          this.newUser.addressId = null;

          // 重新获取用户列表
          this.fetchAdminList();
        } else {
          uni.showToast({
            title: response.message || '添加用户失败',
            icon: 'none'
          });
        }
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
        content: `确定要删除用户 "${this.selectedAdmin.nickname || this.selectedAdmin.loginName}" 吗？`,
        confirmText: '确定',
        cancelText: '取消',
        success: async (res) => {
          // 统一处理：左边按钮为取消，右边按钮为确定
          // 在uni.showModal中，cancel按钮在左，confirm按钮在右
          // 所以无论平台如何，我们都将左按钮视为取消，右按钮视为确定
          if (res.cancel) {
            // 用户点击了取消（左按钮）
            // 重新打开详情弹窗
            this.showAdminDetail(this.selectedAdmin);
          } else if (res.confirm) {
            // 用户点击了确定（右按钮）
            try {
              // 发送删除请求 - 使用新的API
              const params = {
                userId: this.selectedAdmin.userId
              };

              const response = await post('/api/v2/User/Delete', params, {
                'Content-Type': 'application/json-patch+json',
                'accept': '*/*'
              });

              if (response.code === 200) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                });

                // 重新获取管理员列表
                this.fetchAdminList();
              } else {
                uni.showToast({
                  title: response.message || '删除失败',
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
          }
        }
      });
    },

    async updateAdmin() {
      try {
        // 获取代理场地列表
        const response = await post('/api/v2/User/AddressList', {}, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        if (response.code === 200) {
          this.addressList = response.data || [];

          // 填充修改表单数据
          this.updateForm = {
            nickname: this.selectedAdmin.nickname || '',
            description: this.selectedAdmin.description || '',
            password: this.selectedAdmin.password || '',
            oldPassword: this.selectedAdmin.password || '', // 保存旧密码用于验证
            addressId: this.selectedAdmin.addressId,
            expireMin: this.selectedAdmin.expireMin || 0,           // 二维码有效时间（分钟）
            coins: this.selectedAdmin.coins || 0,                 // 活动币数
            coinsExpireHour: this.selectedAdmin.coinsExpireHour || 0, // 活动币有效时间（小时）
            dailyScanLimit: this.selectedAdmin.dailyScanLimit || 0    // 活动币每天领取次数
          };

          // 找到当前用户地址的索引
          const currentIndex = this.addressList.findIndex(addr => addr.addressId === this.selectedAdmin.addressId);
          this.updateSelectedAddressIndex = currentIndex >= 0 ? currentIndex : -1;

          // 关闭详情弹窗，打开修改弹窗
          this.closeDetailModal();
          this.showUpdateModal = true;
        } else {
          uni.showToast({
            title: response.message || '获取代理场地列表失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取代理场地列表失败:', error);
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    },

    closeUpdateModal() {
      // 关闭修改弹窗
      this.showUpdateModal = false;
      // 重置修改场地选择
      this.updateSelectedAddressIndex = -1;
      this.updateForm.addressId = this.selectedAdmin.addressId; // 恢复为原始值

      // 重新打开详情弹窗
      this.showDetailModal = true;
    },

    hideUpdateModalOnly() {
      // 仅关闭修改弹窗，不重新打开详情弹窗
      this.showUpdateModal = false;
      // 重置修改场地选择
      this.updateSelectedAddressIndex = -1;
      this.updateForm.addressId = this.selectedAdmin.addressId; // 恢复为原始值
    },


    async submitUpdate() {
      // 清空之前的错误信息
      this.updateFormErrors = {};

      // 验证必填字段
      if (!this.updateForm.password) {
        this.updateFormErrors.password = '请输入密码';
        return;
      }

      if (this.updateForm.expireMin === undefined || this.updateForm.expireMin === null || this.updateForm.expireMin <= 0) {
        this.updateFormErrors.expireMin = '请输入有效的二维码有效时间（必须大于0）';
        return;
      }

      if (this.updateForm.coins === undefined || this.updateForm.coins === null || this.updateForm.coins <= 0) {
        this.updateFormErrors.coins = '请输入有效的活动币数（必须大于0）';
        return;
      }

      if (this.updateForm.coinsExpireHour === undefined || this.updateForm.coinsExpireHour === null || this.updateForm.coinsExpireHour <= 0) {
        this.updateFormErrors.coinsExpireHour = '请输入有效的活动币有效时间（必须大于0）';
        return;
      }

      if (this.updateForm.dailyScanLimit === undefined || this.updateForm.dailyScanLimit === null || this.updateForm.dailyScanLimit <= 0) {
        this.updateFormErrors.dailyScanLimit = '请输入有效的活动每天领取次数（必须大于0）'; 
        return;
      }

      try {
        // 发送修改请求 - 使用新的API
        const params = {
          userId: this.selectedAdmin.userId,
          oldPassword: this.updateForm.oldPassword,
          password: this.updateForm.password,
          addressId: this.updateForm.addressId || this.selectedAdmin.addressId, // 使用选择的地址ID，如果没有选择则使用原来的地址ID
          description: this.updateForm.description || "", // 描述字段是可选的，未填写时默认为空字符串
          nickname: this.updateForm.nickname || "", // 昵称字段是可选的，未填写时默认为空字符串
          status: this.selectedAdmin.status, // 发送当前用户的状态值
          expireMin: this.updateForm.expireMin || this.selectedAdmin.expireMin || 0,           // 二维码有效时间（分钟）
          coins: this.updateForm.coins || this.selectedAdmin.coins || 0,                    // 活动币数
          coinsExpireHour: this.updateForm.coinsExpireHour || this.selectedAdmin.coinsExpireHour || 0, // 活动币有效时间（小时）
          dailyScanLimit: this.updateForm.dailyScanLimit || this.selectedAdmin.dailyScanLimit || 0  // 活动币每天领取次数
        };

        const response = await post('/api/v2/User/Edit', params, {
          'Content-Type': 'application/json-patch+json',
          'accept': '*/*'
        });

        if (response.code === 200) {
          uni.showToast({
            title: '修改成功',
            icon: 'success'
          });

          // 关闭修改弹窗，但不重新打开详情弹窗
          this.hideUpdateModalOnly();

          // 重新获取管理员列表
          this.fetchAdminList();
        } else {
          uni.showToast({
            title: response.message || '修改失败',
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
        content: `确定要${this.selectedAdmin.status === 1 ? '禁用' : '解禁'}用户"${this.selectedAdmin.nickname || this.selectedAdmin.loginName}"吗？`,
        confirmText: '确定',
        cancelText: '取消',
        success: async (res) => {
          // 统一处理：左边按钮为取消，右边按钮为确定
          // 在uni.showModal中，cancel按钮在左，confirm按钮在右
          // 所以无论平台如何，我们都将左按钮视为取消，右按钮视为确定
          if (res.cancel) {
            // 用户点击了取消（左按钮）
            // 重新打开详情弹窗
            this.showAdminDetail(this.selectedAdmin);
          } else if (res.confirm) {
            // 用户点击了确定（右按钮）
            try {
              // 发送切换状态请求 - 使用新的API
              // 根据用户当前状态切换（1为正常，0为禁用）
              const newStatus = this.selectedAdmin.status === 1 ? 0 : 1; 

              const params = {
                userId: this.selectedAdmin.userId,
                addressId: this.selectedAdmin.addressId, // 传递当前的地址ID
                status: newStatus, // 传递修改后的状态值
                expireMin: this.selectedAdmin.expireMin || 60,           // 二维码有效时间（分钟）
                coins: this.selectedAdmin.coins || 6,                 // 活动币数
                coinsExpireHour: this.selectedAdmin.coinsExpireHour || 1, // 活动币有效时间（小时）
                dailyScanLimit: this.selectedAdmin.dailyScanLimit || 1    // 活动币每天领取次数
              };

              const response = await post('/api/v2/User/Edit', params, {
                'Content-Type': 'application/json-patch+json',
                'accept': '*/*'
              });

              if (response.code === 200) {
                uni.showToast({
                  title: this.selectedAdmin.status === 1 ? '禁用成功' : '解禁成功',
                  icon: 'success'
                });

                // 重新获取管理员列表
                this.fetchAdminList();
              } else {
                uni.showToast({
                  title: response.message || (this.selectedAdmin.status === 1 ? '禁用失败' : '解禁失败'),
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
          }
        }
      });
    },

    handleLogout() {
      // 清除本地存储的token
      uni.removeStorageSync('token');

      // 跳转回登录页面
      uni.reLaunch({
        url: '/pages/index/index'
      });
    },

    // 分页相关方法
    async changePage(page) {
      if (page < 1 || page > Math.ceil(this.pagination.totalCount / this.pagination.pageSize)) {
        return; // 防止超出范围的页码
      }

      this.pagination.currentPage = page;
      await this.fetchAdminList();
    },

    // 处理场地选择变化
    onAddressChange(e) {
      this.selectedAddressIndex = parseInt(e.detail.value);
      // 更新 newUser 中的 addressId
      if (this.selectedAddressIndex >= 0 && this.addressList.length > 0) {
        this.newUser.addressId = this.addressList[this.selectedAddressIndex].addressId;
      }
    },

    // 选择场地
    selectAddress(index) {
      this.selectedAddressIndex = index;
      // 更新 newUser 中的 addressId
      if (this.selectedAddressIndex >= 0 && this.addressList.length > 0) {
        this.newUser.addressId = this.addressList[this.selectedAddressIndex].addressId;
      }
      // 关闭场地选择器
      this.showAddressSelector = false;
    },

    // 关闭场地选择器
    closeAddressSelector() {
      this.showAddressSelector = false;
    },

    // 选择修改用户的场地
    selectUpdateAddress(index) {
      this.updateSelectedAddressIndex = index;
      // 更新 updateForm 中的 addressId
      if (this.updateSelectedAddressIndex >= 0 && this.addressList.length > 0) {
        this.updateForm.addressId = this.addressList[this.updateSelectedAddressIndex].addressId;
      }
      // 关闭场地选择器
      this.showUpdateAddressSelector = false;
    },

    // 关闭修改用户场地选择器
    closeUpdateAddressSelector() {
      this.showUpdateAddressSelector = false;
    },

    // 根据ID获取地址名称
    getAddressNameById(addressId) {
      const address = this.addressList.find(addr => addr.addressId === addressId);
      return address ? address.name : '未找到对应场地';
    },

    // 过滤场地列表
    filterAddresses() {
      // 由于使用了computed属性，这里不需要额外处理
    },

    // 过滤修改用户时的场地列表
    filterUpdateAddresses() {
      // 由于使用了computed属性，这里不需要额外处理
    },

    // 根据数据选择地址（用于添加用户）
    selectAddressByData(address) {
      const index = this.addressList.findIndex(item => item.addressId === address.addressId);
      this.selectAddress(index);
    },

    // 根据数据选择修改用户时的地址
    selectUpdateAddressByData(address) {
      const index = this.addressList.findIndex(item => item.addressId === address.addressId);
      this.selectUpdateAddress(index);
    },

    // 启动自动刷新定时器
    startAutoRefresh() {
      // 清理可能存在的旧定时器
      this.clearAutoRefresh();

      // 设置新的定时器，每5分钟(300000毫秒)刷新一次数据
      this.autoRefreshTimer = setInterval(() => {
        this.fetchAdminList();
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

    onUnload() {
      // 页面卸载时清理自动刷新定时器
      this.clearAutoRefresh();
    },

    onHide() {
      // 页面隐藏时也清理自动刷新定时器（如通过底部导航切换页面）
      this.clearAutoRefresh();
    },

  }
}
</script>

<style>
/* 设置页面高度 */
page {
  height: 100%;
}

.feature-container-role2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 40rpx 40rpx 140rpx; /* 增加顶部边距，使整体内容下移 */
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
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
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
  margin-bottom: 20rpx;
  display: block;
  text-align: center;
} 

.form-group-role2 {
  margin-bottom: 15rpx;
}

.form-group-role2 label {
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

.form-input.error-input {
  border-color: #f56c6c; /* 错误时的边框颜色 */
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

.picker.error-input {
  border-color: #f56c6c; /* 错误时的边框颜色 */
}

.error-message {
  color: #f56c6c;
  font-size: 24rpx;
  margin-top: 10rpx;
  display: block;
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
  max-height: calc(100vh - 460rpx); /* 根据实际需要调整高度，减去其他元素的高度，包括增加的分页控件高度 */
}

.admin-card {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 35rpx; /* 增加内边距使卡片更高 */
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
  width: 240rpx;
  font-size: 28rpx;
  color: #666;
  flex-shrink: 0;
  white-space: nowrap;
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

/* 场地选择器样式 */
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
</style>