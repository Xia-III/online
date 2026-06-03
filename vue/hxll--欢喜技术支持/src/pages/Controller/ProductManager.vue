<template>
    <div class="product-manager">
        <!-- 头部导航 -->
        <div class="header">
            <van-nav-bar
                title="产品管理"
                left-text="返回"
                left-arrow
                @click-left="onBack"
            >
                <div slot="right" class="nav-right-btns">
                    <van-icon name="replay" size="18" class="refresh-btn" @click="onRefresh" />
                    <span class="add-text" @click="onAdd">新增</span>
                </div>
            </van-nav-bar>
        </div>

        <!-- 搜索栏 -->
        <div class="search-bar">
            <van-search
                v-model="searchKeyword"
                placeholder="搜索产品名称"
                shape="round"
                @search="onSearch"
            />
        </div>

        <!-- 设备类型筛选 -->
        <div class="filter-bar">
            <van-dropdown-menu>
                <van-dropdown-item
                    v-model="currentDeviceTypeFilter"
                    :options="deviceTypeFilterDropdownOptions"
                    @change="onDeviceTypeFilterChange"
                />
            </van-dropdown-menu>
        </div>

        <!-- 产品列表 -->
        <div class="product-list">
            <div
                v-for="item in productList"
                :key="item.id"
                class="product-item"
                @click="onViewDetail(item)"
            >
                <div class="product-image">
                    <img v-lazy="item.imageUrl1 || 'https://via.placeholder.com/200'" :alt="item.productName" :key="item.id + '-image'" />
                </div>
                <div class="product-info">
                    <div class="product-name">{{ item.productName }}</div>
                    <div class="product-desc">{{ item.size || '暂无尺寸信息' }}</div>
                    <div class="product-meta">
                        <span class="product-type">{{ getDeviceTypeName(item.deviceType) }}</span>
                        <span class="product-payment">{{ getPaymentTypeName(item.paymentType) }}</span>
                    </div>
                </div>
                <div class="product-actions" @click.stop>
                    <van-button
                        type="primary"
                        size="small"
                        plain
                        @click="onEdit(item)"
                    >
                        编辑
                    </van-button>
                    <van-button
                        type="danger"
                        size="small"
                        plain
                        @click="onDelete(item)"
                    >
                        删除
                    </van-button>
                </div>
            </div>

            <!-- 空状态 -->
            <van-empty
                v-if="productList.length === 0 && !loading"
                description="暂无产品"
            />

            <!-- 分页器 -->
            <van-pagination
                v-model="currentPage"
                :total-items="total"
                :items-per-page="pageSize"
                :show-page-size="3"
                force-ellipses
                @change="onPageChange"
            />
        </div>

        <!-- 新增/编辑弹窗 -->
        <van-dialog
            ref="dialog"
            v-model="showDialog"
            :title="dialogTitle"
            show-cancel-button
            :before-close="beforeClose"
            @confirm="onConfirm"
            @cancel="onCancel"
            class="product-dialog"
        >
            <div class="form-wrapper">
                <div class="form-container">
                <van-field
                    v-model="formData.productName"
                    label="产品名称"
                    placeholder="请输入产品名称"
                    required
                    :error-message="errors.productName"
                />
                <div class="upload-field">
                    <div class="upload-label">图片上传 1</div> 
                    <div class="upload-container" @click="onUploadImage(1)">
                        <img v-if="formData.imageUrl1" :src="formData.imageUrl1" alt="预览图片 1" class="upload-preview" />
                        <div v-else class="upload-placeholder">
                            <van-icon name="photograph" size="40" color="#969799" />
                            <span>点击上传图片 1</span>
                        </div>
                        <div  
                            v-if="formData.imageUrl1" 
                            class="image-remove-btn"
                            @click.stop="onRemoveImage(1)"
                        >
                            <van-icon name="close" size="20" color="#fff" />
                        </div>
                    </div>
                    <input
                        ref="imageInput1"
                        type="file"
                        accept="image/*"
                        style="display: none"
                        @change="onFileChange1"
                    />
                    <div v-if="errors.imageUrl1" class="error-message">{{ errors.imageUrl1 }}</div>
                </div>
                <div v-if="formData.imageUrl1" class="upload-field">
                    <div class="upload-label">图片上传 2</div>
                    <div class="upload-container" @click="onUploadImage(2)">
                        <img v-if="formData.imageUrl2" :src="formData.imageUrl2" alt="预览图片 2" class="upload-preview" />
                        <div v-else class="upload-placeholder">
                            <van-icon name="photograph" size="40" color="#969799" />
                            <span>点击上传图片 2</span>
                        </div>
                        <div 
                            v-if="formData.imageUrl2" 
                            class="image-remove-btn"
                            @click.stop="onRemoveImage(2)"
                        >
                            <van-icon name="close" size="20" color="#fff" />
                        </div>
                    </div>
                    <input
                        ref="imageInput2"
                        type="file"
                        accept="image/*"
                        style="display: none"
                        @change="onFileChange2"
                    />
                </div>
                <div v-if="formData.imageUrl2" class="upload-field">
                    <div class="upload-label">图片上传 3</div>
                    <div class="upload-container" @click="onUploadImage(3)">
                        <img v-if="formData.imageUrl3" :src="formData.imageUrl3" alt="预览图片 3" class="upload-preview" />
                        <div v-else class="upload-placeholder">
                            <van-icon name="photograph" size="40" color="#969799" />
                            <span>点击上传图片 3</span>
                        </div>
                        <div 
                            v-if="formData.imageUrl3" 
                            class="image-remove-btn"
                            @click.stop="onRemoveImage(3)"
                        >
                            <van-icon name="close" size="20" color="#fff" />
                        </div>
                    </div>
                    <input
                        ref="imageInput3"
                        type="file"
                        accept="image/*"
                        style="display: none"
                        @change="onFileChange3"
                    />
                </div>
                <van-field
                    v-model="formData.size"
                    label="产品尺寸"
                    placeholder="请输入产品尺寸 (如：10x20x30)"
                    required
                    :error-message="errors.size"
                />
                <van-field
                    v-model="formData.weight"
                    label="产品重量"
                    type="number"
                    placeholder="请输入产品重量 (单位：kg)"
                    required
                    :error-message="errors.weight"
                />
                <van-field
                    v-model="formData.power"
                    label="产品功率"
                    type="number"
                    placeholder="请输入产品功率 (单位：W)"
                    required
                    :error-message="errors.power"
                />
                <van-field
                    v-model="deviceTypeText"
                    is-link
                    readonly
                    label="设备类型"
                    placeholder="请选择设备类型"
                    @click="onDeviceTypeClick"
                />
                <van-field
                    v-model="paymentTypeText"
                    is-link
                    readonly
                    label="支付方式"
                    placeholder="请选择支付方式"
                    @click="onPaymentTypeClick"
                />
                </div>
            </div>
        </van-dialog>

        <!-- 设备类型选择器 -->
        <van-popup v-model="showDeviceTypePicker" position="bottom">
            <van-picker
                ref="deviceTypePicker"
                :key="deviceTypePickerKey"
                :columns="deviceTypeOptions"
                :default-index="defaultDeviceTypeIndex"
                show-toolbar
                toolbar-position="top"
                @change="onDeviceTypeChange"
                @confirm="onDeviceTypeConfirm"
                @cancel="showDeviceTypePicker = false"
            />
        </van-popup>

        <!-- 支付方式选择器 -->
        <van-popup v-model="showPaymentTypePicker" position="bottom">
            <van-picker
                ref="paymentTypePicker"
                :key="paymentTypePickerKey"
                :columns="paymentTypeOptions"
                :default-index="defaultPaymentTypeIndex"
                show-toolbar
                toolbar-position="top"
                @change="onPaymentTypeChange"
                @confirm="onPaymentTypeConfirm"
                @cancel="showPaymentTypePicker = false"
            />
        </van-popup>

        <!-- 删除确认弹窗 -->
        <van-dialog
            v-model="showDeleteDialog"
            title="确认删除"
            message="确定要删除这个产品吗？"
            show-cancel-button
            @confirm="confirmDelete"
        />

        <!-- 产品详情弹窗 -->
        <van-dialog
            v-model="showDetailDialog"
            title="产品详情"
            show-cancel-button
            cancel-button-text="关闭"
            :show-confirm-button="false"
        >
            <div class="detail-container">
                <div class="detail-image-wrapper">
                    <div
                        v-if="hasPrevImage"
                        class="image-nav-btn prev-btn"
                        @click="onPrevImage"
                    >
                        <van-icon name="arrow-left" size="24" color="#fff" />
                    </div>
                    <div class="detail-image" @click="onImagePreview">
                        <img
                            :src="detailImageUrl"
                            :alt="currentDetailItem.productName"
                            :key="detailImageKey"
                            @error="onImageError"
                        />
                    </div>
                    <div
                        v-if="hasNextImage"
                        class="image-nav-btn next-btn"
                        @click="onNextImage"
                    >
                        <van-icon name="arrow" size="24" color="#fff" />
                    </div>
                </div>
                <div class="detail-info">
                    <div class="detail-row">
                        <span class="detail-label">产品名称：</span>
                        <span class="detail-value">{{ currentDetailItem.productName }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">设备类型：</span>
                        <span class="detail-value">{{ getDeviceTypeName(currentDetailItem.deviceType) }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">支付方式：</span>
                        <span class="detail-value">{{ getPaymentTypeName(currentDetailItem.paymentType) }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">产品尺寸：</span>
                        <span class="detail-value">{{ currentDetailItem.size || '暂无信息' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">产品重量：</span>
                        <span class="detail-value">{{ currentDetailItem.weight ? currentDetailItem.weight + 'kg' : '暂无信息' }}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">产品功率：</span>
                        <span class="detail-value">{{ currentDetailItem.power ? currentDetailItem.power + 'W' : '暂无信息' }}</span>
                    </div>
                </div>
            </div>
        </van-dialog>

        <!-- 图片预览 -->
        <van-image-preview
            v-model="showImagePreview"
            :images="imagePreviewList"
            :start-position="currentImageIndex"
            :zoom="true"
            :min-zoom="0.5"
            :max-zoom="3"
            @close="onImagePreviewClose"
        />
    </div>
</template>

<script>
import request1 from '@/utils/request1'
import { Dialog, Toast, Search, Field, Button, NavBar, Picker, Pagination, Empty, DropdownMenu, DropdownItem, ImagePreview } from 'vant'

export default {
    name: 'ProductManager',
    beforeRouteEnter(to, from, next) {
        // 检查是否登录（是否有 token）
        const token = localStorage.getItem('token')
        if (token) {
            next()
        } else {
            // 未登录，跳转到登录页面
            next('/login')
        }
    },
    data() {
        return {
            searchKeyword: '',
            productList: [],
            loading: false,
            page: 1,
            currentPage: 1,
            pageSize: 4,
            total: 0,

            // 设备类型筛选
            currentDeviceTypeFilter: 0,
            deviceTypeFilterDropdownOptions: [
                { text: '全部', value: 0 },
                { text: '扭蛋机', value: 1 },
                { text: '娃娃机', value: 2 },
                { text: '游戏机', value: 3 },
                { text: '兑币机', value: 4 },
                { text: '糖果机', value: 5 },
                { text: '礼品机', value: 6 },
                { text: '盲盒机', value: 7 },
                { text: '捞鱼机', value: 8 },
                { text: '夹子机', value: 9 },
                { text: '弹珠机', value: 10 },
                { text: '中岛机', value: 11 }
            ],

            // 弹窗相关
            showDialog: false,
            showDeleteDialog: false,
            showDetailDialog: false,
            showImagePreview: false, // 图片预览弹窗
            dialogTitle: '新增产品',
            isEditMode: false,
            currentEditId: null,
            currentDetailItem: {},
            detailImageKey: 0,
            detailImageUrl: '',
            currentImageIndex: 0, // 当前显示的图片索引 (0: imageUrl1, 1: imageUrl2, 2: imageUrl3)
            imageList: [], // 当前产品的非空图片列表
            imagePreviewList: [], // 图片预览列表
            submitLoading: false, // 表单提交中状态

            // 表单数据 (对应 API 字段)
            formData: {
                productName: '',
                imageUrl1: '',
                imageUrl2: '',
                imageUrl3: '',
                deviceType: 0,
                power: '',
                size: '',
                weight: 0,
                paymentType: 0
            },

            // 显示文本
            deviceTypeText: '',
            paymentTypeText: '',

            // 表单错误
            errors: {
                productName: '',
                imageUrl1: '',
                size: '',
                weight: '',
                power: ''
            },

            // 设备类型选项 (产品类型：1:扭蛋机 2:娃娃机 3:游戏机 4:兑币机 5:糖果机 6:礼品机 7:盲盒机 8:捞鱼机 9:夹子机 10:弹珠机 11:中岛机)
            deviceTypeOptions: [
                { text: '扭蛋机', value: '1' },
                { text: '娃娃机', value: '2' },
                { text: '游戏机', value: '3' },
                { text: '兑币机', value: '4' },
                { text: '糖果机', value: '5' },
                { text: '礼品机', value: '6' },
                { text: '盲盒机', value: '7' },
                { text: '捞鱼机', value: '8' },
                { text: '夹子机', value: '9' },
                { text: '弹珠机', value: '10' },
                { text: '中岛机', value: '11' }
            ],
            showDeviceTypePicker: false,

            // 支付方式选项 (1.投币 2.纸钞 4.扫码 8.网上支付，15 种组合 1~15)
            // 1=投币，2=纸钞，3=投币 + 纸钞，4=扫码，5=投币 + 扫码，6=纸钞 + 扫码，7=投币 + 纸钞 + 扫码
            // 8=网上支付，9=投币 + 网上支付，10=纸钞 + 网上支付，11=投币 + 纸钞 + 网上支付
            // 12=扫码 + 网上支付，13=投币 + 扫码 + 网上支付，14=纸钞 + 扫码 + 网上支付，15=投币 + 纸钞 + 扫码 + 网上支付
            paymentTypeOptions: [
                { text: '投币', value: '1' },
                { text: '纸钞', value: '2' },
                { text: '投币/纸钞', value: '3' },
                { text: '扫码', value: '4' },
                { text: '投币/扫码', value: '5' },
                { text: '纸钞/扫码', value: '6' },
                { text: '投币/纸钞/扫码', value: '7' },
                { text: '网上支付', value: '8' },
                { text: '投币/网上支付', value: '9' },
                { text: '纸钞/网上支付', value: '10' },
                { text: '投币/纸钞/网上支付', value: '11' },
                { text: '扫码/网上支付', value: '12' },
                { text: '投币/扫码/网上支付', value: '13' },
                { text: '纸钞/扫码/网上支付', value: '14' },
                { text: '投币/纸钞/扫码/网上支付', value: '15' }
            ],
            showPaymentTypePicker: false,

            // Picker key 用于强制重新渲染
            deviceTypePickerKey: 0,
            paymentTypePickerKey: 0,

            // Picker 默认索引
            defaultDeviceTypeIndex: 0,
            defaultPaymentTypeIndex: 0,

            // Picker 当前选中的索引
            currentDeviceTypeIndex: 0,
            currentPaymentTypeIndex: 0
        }
    },
    computed: {
        // 是否有上一张图片
        hasPrevImage() {
            return this.currentImageIndex > 0
        },
        // 是否有下一张图片
        hasNextImage() {
            return this.currentImageIndex < this.imageList.length - 1
        }
    },
    methods: {
        // 返回登录页面
        onBack() {
            this.$router.push('/login')
        },

        // 打开新增弹窗
        onAdd() {
            this.isEditMode = false
            this.dialogTitle = '新增产品'
            this.resetForm()
            this.showDialog = true
        },

        // 打开编辑弹窗
        onEdit(item) {
            this.isEditMode = true
            this.dialogTitle = '编辑产品'
            this.currentEditId = item.id
            this.formData = {
                productName: item.productName || item.name || '',
                imageUrl1: item.imageUrl1 || item.image || '',
                imageUrl2: item.imageUrl2 || '',
                imageUrl3: item.imageUrl3 || '',
                deviceType: item.deviceType || 0,
                power: item.power !== null && item.power !== undefined ? String(item.power) : '',
                size: item.size || '',
                weight: item.weight || 0,
                paymentType: item.paymentType || 0
            }
            // 同步更新显示文本
            this.deviceTypeText = this.getDeviceTypeName(item.deviceType || 0)
            this.paymentTypeText = this.getPaymentTypeName(item.paymentType || 0)
            this.showDialog = true
        },

        // 删除产品
        onDelete(item) {
            this.currentEditId = item.id
            this.showDeleteDialog = true
        },

        // 查看详情
        onViewDetail(item) {
            this.currentDetailItem = item
            // 构建非空图片列表
            this.imageList = []
            if (item.imageUrl1) this.imageList.push(item.imageUrl1)
            if (item.imageUrl2) this.imageList.push(item.imageUrl2)
            if (item.imageUrl3) this.imageList.push(item.imageUrl3)

            this.imagePreviewList = [...this.imageList] // 复制图片列表用于预览
            this.currentImageIndex = 0
            this.detailImageKey++
            this.detailImageUrl = this.imageList.length > 0 ? this.imageList[0] : ''
            this.showDetailDialog = true
        },

        // 图片加载失败
        onImageError() {
            // 如果当前图片加载失败，尝试切换到其他图片
            if (this.imageList.length > 1) {
                // 标记当前图片为无效
                const failedImageUrl = this.detailImageUrl
                this.imageList = this.imageList.filter(url => url !== failedImageUrl)
                // 尝试下一张图片
                if (this.currentImageIndex >= this.imageList.length) {
                    this.currentImageIndex = this.imageList.length - 1
                }
                if (this.imageList.length > 0) {
                    this.detailImageUrl = this.imageList[this.currentImageIndex]
                    this.detailImageKey++
                } else {
                    // 所有图片都失败，显示 404
                    this.detailImageUrl = require('@/assets/404.png')
                }
            } else {
                this.detailImageUrl = require('@/assets/404.png')
            }
        },

        // 点击图片预览
        onImagePreview() {
            if (this.imagePreviewList.length > 0) {
                this.showImagePreview = true
            }
        },

        // 图片预览关闭
        onImagePreviewClose() {
            this.showImagePreview = false
        },

        // 查看上一张图片
        onPrevImage() {
            if (this.currentImageIndex > 0) {
                this.currentImageIndex--
                this.detailImageKey++
                this.detailImageUrl = this.imageList[this.currentImageIndex]
            }
        },

        // 查看下一张图片
        onNextImage() {
            if (this.currentImageIndex < this.imageList.length - 1) {
                this.currentImageIndex++
                this.detailImageKey++
                this.detailImageUrl = this.imageList[this.currentImageIndex]
            }
        },

        // 确认删除
        confirmDelete() {
            Toast.loading({
                message: '删除中...',
                forbidClick: true,
                duration: 0
            })

            request1.delete('api/Product/DeleteById', {
                params: {
                    id: this.currentEditId
                }
            })
            .then(res => {
                Toast.clear()
                if (res.data.code === 0 || res.data.code === 200) {
                    Toast.success('删除成功')
                    this.showDeleteDialog = false
                    // 判断当前页是否还有数据
                    if (this.productList.length > 1) {
                        // 当前页还有产品，直接刷新当前页
                        this.onLoad()
                    } else {
                        // 当前页没有产品了，重置到第一页
                        this.page = 1
                        this.currentPage = 1
                        this.total = 0
                        this.productList = []
                        this.onLoad()
                    }
                } else {
                    Toast.fail(res.data.msg || '删除失败')
                }
            })
            .catch(err => {
                Toast.clear()
                console.error('删除产品失败:', err)
                Toast.fail('删除失败')
            })
        },

        // 确认操作（兼容）
        onConfirm() {
        },

        // 关闭前验证（用于异步关闭）
        beforeClose(action, done) {
            console.log('===== beforeClose 被调用，action:', action)
            if (action === 'confirm') {
                // 确认按钮点击时，先关闭弹窗，然后验证
                // 如果验证失败，再重新打开
                done()
                // 延迟执行验证逻辑，让弹窗先关闭
                this.$nextTick(() => {
                    this.handleConfirm()
                })
                return
            }
            // 取消按钮点击时，直接关闭
            done()
        },

        // 处理确认逻辑
        handleConfirm() {
            console.log('===== handleConfirm 被调用 =====')
            console.log('当前表单数据:', this.formData)
            console.log('isEditMode:', this.isEditMode)
            
            // 先验证表单
            const isValid = this.validateForm()
            console.log('表单验证结果:', isValid ? '通过' : '失败')
            
            if (!isValid) {
                console.log('验证失败，重新打开弹窗')
                // 验证失败，重新打开弹窗
                this.showDialog = true
                return
            }

            const submitData = {
                productName: this.formData.productName.trim(),
                imageUrl1: this.formData.imageUrl1.trim(),
                imageUrl2: this.formData.imageUrl2 ? this.formData.imageUrl2.trim() : '',
                imageUrl3: this.formData.imageUrl3 ? this.formData.imageUrl3.trim() : '',
                deviceType: this.formData.deviceType,
                power: String(this.formData.power).trim(),
                size: this.formData.size.trim(),
                weight: parseFloat(this.formData.weight),
                paymentType: this.formData.paymentType
            }

            console.log('验证通过，准备提交数据:', submitData)

            Toast.loading({
                message: this.isEditMode ? '保存中...' : '添加中...',
                forbidClick: true,
                duration: 0
            })

            // 调用 API
            const requestPromise = this.isEditMode
                ? request1.put('api/Product/UpdateProduct', { ...submitData, id: this.currentEditId })
                : request1.post('api/Product/Add', submitData)

            requestPromise
                .then(res => {
                    console.log('API 响应:', res)
                    console.log('res.data:', res.data)
                    Toast.clear()
                    if (res.data.code === 0 || res.data.code === 200) {
                        Toast.success(this.isEditMode ? '修改成功' : '添加成功')
                        this.resetForm()
                        // 新增成功后清空搜索框
                        if (!this.isEditMode) {
                            this.searchKeyword = ''
                        }
                        // 刷新列表
                        this.loading = true
                        this.onLoad()
                        console.log('操作成功')
                    } else {
                        Toast.fail(res.data.msg || '操作失败')
                        console.log('操作失败，重新打开弹窗')
                        // 验证失败，重新打开弹窗
                        this.showDialog = true
                    }
                })
                .catch(err => {
                    Toast.clear()
                    console.error('添加产品失败:', err)
                    Toast.fail(this.isEditMode ? '修改失败' : '添加失败')
                    console.log('请求异常，重新打开弹窗')
                    // 验证失败，重新打开弹窗
                    this.showDialog = true
                })
        },

        // 确认操作（兼容）
        onConfirm() {
        },

        // 取消操作
        onCancel() {
            console.log('取消操作')
            this.resetForm()
        },

        // 点击图片上传区域
        onUploadImage(index) {
            this.$refs[`imageInput${index}`].click()
        },

        // 移除图片
        onRemoveImage(index) {
            if (index === 1) {
                // 移除图片 1 时，图片 2 上移为图片 1，图片 3 上移为图片 2 
                this.formData.imageUrl1 = this.formData.imageUrl2
                this.formData.imageUrl2 = this.formData.imageUrl3
                this.formData.imageUrl3 = ''
            } else if (index === 2) {
                // 移除图片 2 时，图片 3 上移为图片 2
                this.formData.imageUrl2 = this.formData.imageUrl3
                this.formData.imageUrl3 = ''
            } else if (index === 3) {
                // 只移除图片 3
                this.formData.imageUrl3 = ''
            }
        },

        // 文件选择变化 - 图片 1
        onFileChange1(event) {
            this.handleFileSelect(event, 1, 'imageUrl1')
        },

        // 文件选择变化 - 图片 2
        onFileChange2(event) {
            this.handleFileSelect(event, 2, 'imageUrl2')
        },

        // 文件选择变化 - 图片 3
        onFileChange3(event) {
            this.handleFileSelect(event, 3, 'imageUrl3')
        },

        // 处理文件选择
        handleFileSelect(event, index, fieldName) {
            const file = event.target.files[0]
            if (!file) {
                return
            }

            // 验证文件类型
            const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            if (!validImageTypes.includes(file.type)) {
                Toast.fail(`请上传图片文件${index} (jpg, jpeg, png, gif, webp)`)
                this.errors[fieldName] = '请上传图片文件'
                return
            }

            // 验证文件大小 (限制 5MB)
            if (file.size > 5 * 1024 * 1024) {
                Toast.fail(`图片${index}大小不能超过 5MB`)
                this.errors[fieldName] = '图片大小不能超过 5MB'
                return
            }

            this.errors[fieldName] = ''
            this.uploadImage(file, fieldName)
        },

        // 上传图片
        uploadImage(file, fieldName) {
            Toast.loading({
                message: '上传中...',
                forbidClick: true,
                duration: 0
            })

            const formData = new FormData()
            formData.append('file', file)

            request1.post('api/UploadImage', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(res => {
                Toast.clear()
                if (res.data.code === 0 || res.data.code === 200) {
                    this.formData[fieldName] = res.data.data
                    Toast.success('上传成功')
                } else {
                    Toast.fail(res.data.msg || '上传失败')
                    this.errors[fieldName] = '上传失败，请重试'
                }
                // 清空 input 的 value，允许重复选择同一文件
                this.clearFileInput(fieldName)
            })
            .catch(err => {
                Toast.clear()
                console.error('上传图片失败:', err)
                Toast.fail('上传失败')
                this.errors[fieldName] = '上传失败，请重试'
                // 清空 input 的 value，允许重新选择
                this.clearFileInput(fieldName)
            })
        },

        // 清空文件输入框
        clearFileInput(fieldName) {
            const inputRef = fieldName === 'imageUrl1' ? 'imageInput1' : fieldName === 'imageUrl2' ? 'imageInput2' : 'imageInput3'
            if (this.$refs[inputRef]) {
                this.$refs[inputRef].value = ''
            }
        },

        // 重置表单
        resetForm() {
            this.formData = {
                productName: '',
                imageUrl1: '',
                imageUrl2: '',
                imageUrl3: '',
                deviceType: 0,
                power: '',
                size: '',
                weight: '',
                paymentType: 0
            }
            this.deviceTypeText = ''
            this.paymentTypeText = ''
            this.errors = {
                productName: '',
                imageUrl1: '',
                size: '',
                weight: '',
                power: ''
            }
        },

        // 表单验证
        validateForm() {
            console.log('===== validateForm 被调用 =====')
            let isValid = true

            if (!this.formData.productName || !this.formData.productName.trim()) {
                this.errors.productName = '请输入产品名称'
                isValid = false
                console.log('验证失败：产品名称为空')
            } else {
                this.errors.productName = ''
            }

            this.errors.imageUrl1 = ''

            if (!this.formData.size || !this.formData.size.trim()) {
                this.errors.size = '请输入产品尺寸'
                isValid = false
                console.log('验证失败：产品尺寸为空')
            } else {
                this.errors.size = ''
            }

            if (!this.formData.power || !String(this.formData.power).trim()) {
                this.errors.power = '请输入产品功率'
                isValid = false
                console.log('验证失败：产品功率为空')
            } else {
                this.errors.power = ''
            }

            if (!this.formData.weight) {
                this.errors.weight = '请输入产品重量'
                isValid = false
                console.log('验证失败：产品重量为空')
            } else if (isNaN(this.formData.weight) || parseFloat(this.formData.weight) <= 0) {
                this.errors.weight = '重量必须为正数'
                isValid = false
                console.log('验证失败：重量不是正数')  
            } else {
                this.errors.weight = ''
            }

            console.log('validateForm 返回:', isValid)
            return isValid
        },

        // 搜索
        onSearch() {
            this.page = 1
            this.currentPage = 1
            this.total = 0
            this.productList = []
            this.loading = true
            this.onLoad()
        },

        // 设备类型筛选
        onDeviceTypeFilterChange(value) {
            this.page = 1
            this.currentPage = 1
            this.total = 0
            this.productList = []
            this.loading = true
            this.onLoad()
        },

        // 刷新
        onRefresh() {
            this.productList = []
            this.loading = true
            this.onLoad()
        },

        // 加载数据
        onLoad() {
            this.loading = true
            console.log('加载数据，page:', this.page, 'searchKeyword:', this.searchKeyword, 'deviceType:', this.currentDeviceTypeFilter)

            // 调用全部/设备类型 API
            request1.get('api/Product/FindManageAllPage', {
                params: {
                    page: this.page,
                    size: this.pageSize,
                    keyword: this.searchKeyword,
                    deviceType: this.currentDeviceTypeFilter
                }
            })
            .then(res => {
                console.log('产品列表响应:', res)
                if (res.data.code === 0 || res.data.code === 200) {
                    const dataList = res.data.data || []
                    let total = res.data.total
                    if (total === null || total === undefined) {
                        total = (this.page - 1) * this.pageSize + dataList.length
                    }
                    console.log('产品列表数据:', dataList, '总数:', total)
                    this.total = total
                    this.productList = dataList
                } else {
                    Toast.fail(res.data.msg || '加载失败')
                }
            })
            .catch(err => {
                console.error('加载产品列表失败:', err)
                Toast.fail('加载失败')
            })
            .finally(() => {
                this.loading = false
            })
        },

        // 分页变化
        onPageChange(page) {
            console.log('分页变化，当前页:', page)
            this.page = page
            this.currentPage = page
            this.productList = []
            this.loading = true
            this.onLoad()
        },

        // 打开设备类型选择器
        onDeviceTypeClick() {
            // 计算默认索引
            const index = this.deviceTypeOptions.findIndex(item => item.value === String(this.formData.deviceType))
            this.defaultDeviceTypeIndex = index >= 0 ? index : 0
            this.currentDeviceTypeIndex = this.defaultDeviceTypeIndex
            // 增加 key 强制重新渲染
            this.deviceTypePickerKey++
            this.showDeviceTypePicker = true
        },

        // 设备类型改变时记录索引
        onDeviceTypeChange(picker, value, index) {
            this.currentDeviceTypeIndex = index
        },

        // 确认设备类型
        onDeviceTypeConfirm() {
            const selectedItem = this.deviceTypeOptions[this.currentDeviceTypeIndex]
            console.log('确认设备类型，索引:', this.currentDeviceTypeIndex, '选项:', selectedItem)
            if (selectedItem) {
                this.formData.deviceType = parseInt(selectedItem.value)
                this.deviceTypeText = selectedItem.text
            }
            this.showDeviceTypePicker = false
        },

        // 打开支付方式选择器
        onPaymentTypeClick() {
            // 计算默认索引
            const index = this.paymentTypeOptions.findIndex(item => item.value === String(this.formData.paymentType))
            this.defaultPaymentTypeIndex = index >= 0 ? index : 0
            this.currentPaymentTypeIndex = this.defaultPaymentTypeIndex
            // 增加 key 强制重新渲染
            this.paymentTypePickerKey++
            this.showPaymentTypePicker = true
        },

        // 支付方式改变时记录索引
        onPaymentTypeChange(picker, value, index) {
            this.currentPaymentTypeIndex = index
        },

        // 确认支付方式
        onPaymentTypeConfirm() {
            const selectedItem = this.paymentTypeOptions[this.currentPaymentTypeIndex]
            console.log('确认支付方式，索引:', this.currentPaymentTypeIndex, '选项:', selectedItem)
            if (selectedItem) {
                this.formData.paymentType = parseInt(selectedItem.value)
                this.paymentTypeText = selectedItem.text
            }
            this.showPaymentTypePicker = false
        },

        // 获取设备类型名称
        getDeviceTypeName(deviceType) {
            const device = this.deviceTypeOptions.find(x => x.value === String(deviceType) || x.value === deviceType)
            return device ? device.text : '未知类型'
        },

        // 获取支付方式名称
        getPaymentTypeName(paymentType) {
            const payment = this.paymentTypeOptions.find(x => x.value === String(paymentType) || x.value === paymentType)
            return payment ? payment.text : '未知方式'
        }
    },
    created() {
        // 再次检查登录状态
        const token = localStorage.getItem('token')
        if (!token) {
            Toast.fail('请先登录')
            this.$router.replace('/login')
            return
        }
        this.onLoad()
    }
}
</script>

<style lang="less" scoped>
.product-manager {
    min-height: 100vh;
    background-color: #f5f5f5;
    
    .header {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 10;
        width: 100%;

        .van-nav-bar {
            height: 1.08rem;
            background-color: #fff;

            .van-nav-bar__left {
                padding: 0 0.23rem;
                font-size: 0.42rem;

                .van-nav-bar__arrow {
                    font-size: 0.48rem;
                }
            }

            .van-nav-bar__title {
                font-size: 0.45rem;
                font-weight: 500;
            }

            /deep/ .van-nav-bar__right {
                padding: 0 0.23rem;
                font-size: 0.42rem;

                .nav-right-btns {
                    display: flex;
                    align-items: center;
                    gap: 0.2rem;

                    .refresh-btn {
                        color: #1989fa;
                        font-size: 18px;
                        cursor: pointer;
                        transition: transform 0.3s;
                        display: inline-flex;
                        align-items: center;
                        line-height: 1;

                        &:active {
                            transform: rotate(360deg);
                        }
                    }

                    .add-text {
                        color: #1989fa;
                        cursor: pointer;
                        font-size: 0.42rem;
                    }
                }
            }
        }
    }

    .search-bar {
        position: fixed;
        top: 0.8rem;
        left: 0;
        z-index: 9;
        width: 100%;
        padding: 0.2rem 0.1rem;
        background-color: #fff;
    }

    .filter-bar {
        position: fixed;
        top: 2.15rem;
        left: 0;
        z-index: 9;
        width: 100%;
        padding: 0.2rem 0.1rem;
        background-color: #fff;

        /deep/ .van-dropdown-menu {
            display: flex;
            justify-content: center;
        }

        /deep/ .van-dropdown-item__title {
            font-size: 0.32rem;
        }
    }

    .product-list {
        padding-top: 3.3rem;

        .product-item {
            display: flex;
            align-items: center;
            margin: 0.3rem;
            padding: 0.3rem;
            background-color: #fff;
            border-radius: 0.16rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            transition: background-color 0.3s;

            .product-image {
                flex-shrink: 0;
                width: 2rem;
                height: 2rem;
                margin-right: 0.3rem;
                border-radius: 0.1rem;
                overflow: hidden;
                
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
            
            .product-info {
                flex: 1;
                min-width: 0;
                
                .product-name {
                    font-size: 0.42rem;
                    font-weight: 500;
                    color: #333;
                    margin-bottom: 0.1rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .product-desc {
                    font-size: 0.32rem;
                    color: #999;
                    margin-bottom: 0.15rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .product-meta {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.1rem;

                    .product-type {
                        font-size: 0.32rem;
                        padding: 0.06rem 0.18rem;
                        border-radius: 0.2rem;
                        background-color: #fff3e0;
                        color: #ff9800;
                    }

                    .product-payment {
                        font-size: 0.28rem;
                        padding: 0.06rem 0.15rem;
                        border-radius: 0.2rem;
                        background-color: #e8f5e9;
                        color: #4caf50;
                    }
                }
            }
            
            .product-actions {
                display: flex;
                flex-direction: column;
                gap: 0.15rem;
                margin-left: 0.2rem;
                
                .van-button {
                    width: 1.6rem;
                    height: 0.7rem;
                    font-size: 0.32rem;
                }
            }
        }
    }

    /deep/ .van-pagination {
        padding: 0.4rem 0;
        flex-wrap: wrap;
        justify-content: center;

        .van-pagination__item {
            flex: none !important;
            min-width: auto !important; 
            width: 0.8rem !important;
            height: 0.75rem !important;
            line-height: 0.75rem !important;
            font-size: 0.38rem !important;
            padding: 0 !important;
            margin: 0 0.1rem !important;
        }

        .van-pagination__prev,
        .van-pagination__next {
            flex: none !important;
            min-width: auto !important;
            width: 1.4rem !important;
            height: 0.75rem !important;
            line-height: 0.75rem !important;
            font-size: 0.38rem !important;
            padding: 0 !important;
            margin: 0 0.2rem !important;
        }
    }

    /deep/ .product-dialog {
        max-height: 70vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .van-dialog__content {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            min-height: 0;

            &::-webkit-scrollbar {
                width: 6px;
            }

            &::-webkit-scrollbar-thumb {
                background-color: rgba(0, 0, 0, 0.2);
                border-radius: 3px;
            }

            &::-webkit-scrollbar-track {
                background-color: transparent;
            }
        }

        .van-dialog__footer {
            flex-shrink: 0;
        }
    }

    .form-wrapper {
        padding-bottom: 0.5rem;
    }

    .form-container {
        padding: 0.3rem 0;

        .van-cell {
            padding: 0.3rem 0.4rem;
        }

        .van-field {
            padding: 0.2rem 0.2rem 0.2rem 0.3rem;
        }
    }

    .upload-field {
        padding: 0.3rem 0.4rem;

        .upload-label {
            font-size: 0.34rem;
            color: #323233;
            margin-bottom: 0.2rem;
        }

        .upload-container {
            position: relative;
            width: 100%;
            height: 3rem;
            border: 1px dashed #d9d9d9;
            border-radius: 0.16rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            background-color: #fafafa;
            transition: border-color 0.3s;

            &:hover {
                border-color: #1989fa;
            }

            .upload-preview {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                border-radius: 0.08rem;
            }

            .upload-placeholder {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.15rem;

                span {
                    font-size: 0.32rem;
                    color: #969799;
                }
            }

            .image-remove-btn {
                position: absolute;
                top: 0.2rem;
                right: 0.2rem;
                width: 0.6rem;
                height: 0.6rem;
                background-color: rgba(238, 10, 36, 0.8);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
                transition: background-color 0.3s;

                &:active {
                    background-color: rgba(238, 10, 36, 1);
                }
            }
        }

        .error-message {
            font-size: 0.32rem;
            color: #ee0a24;
            margin-top: 0.15rem;
            padding-left: 0.1rem;
        }
    }

    .detail-container {
        padding: 0.3rem 0;

        .detail-image-wrapper {
            position: relative;
            width: 100%;
            height: 4rem;
            margin-bottom: 0.4rem;

            .image-nav-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 0.8rem;
                height: 0.8rem;
                background-color: rgba(0, 0, 0, 0.5);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
                transition: background-color 0.3s;

                &:active {
                    opacity: 0.8;
                }

                &.prev-btn {
                    left: 0.2rem;
                }

                &.next-btn {
                    right: 0.2rem;
                }
            }
        }

        .detail-image {
            width: 100%;
            height: 100%;
            border-radius: 0.16rem;
            overflow: hidden;

            img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                background-color: #f5f5f5;
            }
        }

        .detail-info {
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.25rem 0;
                border-bottom: 1px solid #f0f0f0;

                &:last-child {
                    border-bottom: none;
                }

                .detail-label {
                    font-size: 0.35rem;
                    color: #999;
                    font-weight: 400;
                    padding-left: 0.2rem;
                }

                .detail-value {
                    font-size: 0.35rem;
                    padding-right: 0.2rem;
                    color: #333;
                    font-weight: 500;
                    text-align: right;
                    max-width: 60%;
                    word-break: break-all;
                }
            }
        }

        .toggle-switch {
            position: relative;
            width: 1.2rem;
            height: 0.6rem;
            background-color: #e5e5e5;
            border-radius: 0.3rem;
            transition: background-color 0.3s;
            cursor: pointer;

            &.is-active {
                background-color: #4caf50;
            }

            &:active {
                opacity: 0.8;
            }

            .toggle-circle {
                position: absolute;
                top: 0.05rem;
                left: 0.05rem;
                width: 0.5rem;
                height: 0.5rem;
                background-color: #fff;
                border-radius: 50%;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                transition: transform 0.3s;
            }

            &.is-active .toggle-circle {
                transform: translateX(0.6rem);
            }
        }
    }
}
</style>
