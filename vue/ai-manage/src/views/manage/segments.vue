<template>
  <!-- 模板内容 -->
  <div class="segments-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <el-button 
        type="text" 
        :icon="ArrowLeft" 
        class="back-button"
        @click="handleBack"
        hover-class="back-button-hover"
      />
      
      <el-input
        v-model="searchQuery"
        placeholder="搜索分段内容..."
        :prefix-icon="Search"
        clearable
        @input="handleSearch"
        class="search-input"
        :class="{ 'search-focus': searchFocused }"
        @focus="searchFocused = true"
        @blur="searchFocused = false"
      />
      
      <el-button
        type="primary"
        :icon="Plus"
        circle
        size="default"
        class="add-nav-button"
        @click="dialogVisible = true"
      />
    </div>

    <!-- 加载状态 -->
    <el-loading 
      v-if="loading" 
      fullscreen 
      text="正在加载分段内容..."
      background="rgba(255, 255, 255, 0.8)"
    />

    <!-- 卡片列表区域 -->
    <el-row :gutter="20" class="card-list" v-if="segments.length && !loading">
      <el-col
        v-for="segment in segments"
        :key="segment.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="8"
      >
        <el-card 
          class="card-item" 
          :body-style="{ padding: '20px' }"
          :class="{ 'card-selected': selectedSegmentId === segment.id }"
          @click="handleCardClick(segment)"
        >
          <div class="card-content-container">
            <p class="card-content">{{ truncate(extractText(segment.content), 10) }}</p>
            <el-button
              v-if="role === 1"
              type="danger"
              :icon="Delete"
              circle
              plain
              @click.stop="handleDeleteSegment(segment)"
              class="delete-btn"
              :title="`删除分段`"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分页器 -->
    <div class="pagination-container" v-if="total > 0 && !loading">
      <el-pagination 
        :page-size="size" 
        :current-page="currentPage" 
        :pager-count="5" 
        layout="prev, pager, next" 
        :total="total"
        @current-change="handlePageChange"
        class="pagination"
      />
    </div>

    <!-- 空状态展示 -->
    <el-empty
      v-else-if="!loading"
      description="没有找到分段内容"
      :image-size="200"
      class="empty-state"
    >
      <el-button type="primary" @click="dialogVisible = true" class="empty-add-btn">
        添加新分段
      </el-button>
    </el-empty>

    <!-- 添加分段对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加新分段"
      :width="isMobile ? '90%' : '600px'"
      destroy-on-close
      :close-on-click-modal="false"
      @close="handleClose"
      class="custom-dialog"
      :center="true" 
    >
      <!-- 上传加载动画 - 覆盖整个对话框内容 -->
      <div class="upload-loading-container" v-if="addUploadLoading">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p class="loading-text">正在上传文件，请稍候...</p>
        </div>
      </div>
      
      <el-form
        ref="formRef"
        :model="segmentForm"
        :rules="rules"
        :label-width="isMobile ? '70px' : '80px'"
        class="custom-form"
      >
        <el-form-item label="内容" prop="content" class="form-item">
          <el-input 
            v-model="segmentForm.content" 
            type="textarea"
            :rows="6"
            placeholder="请输入分段内容" 
            class="custom-input"
            :class="{ 'input-focus': contentFocused }"
            @focus="contentFocused = true"
            @blur="contentFocused = false"
            :disabled="addUploadLoading"
          />
        </el-form-item>
        
        <!-- 新增：文件上传字段 -->
        <el-form-item label="相关文件" class="form-item">
          <!-- 只有在没有上传文件时显示上传区域 -->
          <el-upload
            v-if="!segmentForm.fileUrl"
            class="upload-demo"
            drag
            :http-request="handleCustomUpload" 
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :file-list="fileList"
            :limit="1"
            :on-exceed="handleExceed"
            accept="image/*,video/*"
            :auto-upload="true"
            :show-file-list="false"
            :disabled="addUploadLoading"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              拖放文件到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip text-sm text-gray-500">
                支持上传图片和视频文件，图片大小不能超过5M，视频大小不能超过30M
              </div>
            </template>
          </el-upload>
          
          <!-- 上传成功后显示文件预览（只显示文件，不显示上传区域） -->
          <div v-if="segmentForm.fileUrl" class="upload-preview-container">
            <el-image
              v-if="isImageType(segmentForm.fileUrl)"
              :src="segmentForm.fileUrl"
              fit="contain"
              class="uploaded-image"
              preview-teleported
            />
            <video
              v-if="isVideoType(segmentForm.fileUrl)"
              :src="segmentForm.fileUrl"
              controls
              class="uploaded-video"
            />
            <div class="file-info">
              <el-button
                type="text"
                size="small"
                class="remove-file-btn"
                @click="removeFile"
                :disabled="addUploadLoading"
              >
                移除
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button 
          @click="dialogVisible = false"
          class="cancel-button"
          :size="isMobile ? 'small' : 'default'"
          :disabled="addUploadLoading"
        >
          取消
        </el-button>
        <el-button 
          type="primary" 
          @click="handleAddSegment"
          class="confirm-button"
          :size="isMobile ? 'small' : 'default'"
          :disabled="addUploadLoading"
        >
          确认
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗（带修改功能） -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="isEditing ? '编辑分段' : '分段详情'"
      :width="isMobile ? '90%' : '600px'"
      destroy-on-close
      :close-on-click-modal="!isEditing"
      class="detail-dialog"
    >
      <!-- 编辑模式下的上传加载动画 - 覆盖整个对话框内容 -->
      <div class="upload-loading-container" v-if="editUploadLoading">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p class="loading-text">正在上传文件，请稍候...</p>
        </div>
      </div>
      
      <div class="detail-content">
        <!-- 查看模式 -->
        <div v-if="!isEditing">
          {{ extractText(currentSegment.content) }}
          
          <!-- 显示相关文件 -->
          <div>
            <div class="detail-file-container">
              <p class="file-label">相关文件：</p>
              <el-image v-if="isImageType(extractImageUrls(currentSegment.content))"
                :src="extractImageUrls(currentSegment.content)"
                fit="contain"
                class="detail-image"
                preview-teleported
              />
              <video v-else-if="isVideoType(extractVideoUrls(currentSegment.content))"
                :src="extractVideoUrls(currentSegment.content)"
                controls
                class="detail-video"
              />
            </div>
          </div>
        </div>
        
        <!-- 编辑模式 -->
        <div v-if="isEditing">
          <el-form
            ref="editFormRef"
            :model="editForm"
            :rules="rules"
            class="edit-form"
          >
            <el-form-item prop="content" class="form-item">
              <el-input 
                v-model="editForm.content" 
                type="textarea"
                :rows="6"
                placeholder="请输入分段内容" 
                class="custom-input"
                :class="{ 'input-focus': contentFocused }"
                @focus="contentFocused = true"
                @blur="contentFocused = false"
                :disabled="editUploadLoading"
              />
            </el-form-item>
            
            <!-- 编辑模式下的文件预览和管理 -->
            <div v-if="editForm.fileUrl" class="upload-preview-container">
              <el-image
                v-if="isImageType(editForm.fileUrl)"
                :src="editForm.fileUrl"
                fit="contain"
                class="uploaded-image"
                preview-teleported
              />
              <video
                v-if="isVideoType(editForm.fileUrl)"
                :src="editForm.fileUrl"
                controls
                class="uploaded-video"
              />
              <div class="file-info">
                <el-button
                  type="text"
                  size="small"
                  class="remove-file-btn"
                  @click="removeEditFile"
                  :disabled="editUploadLoading"
                >
                  移除
                </el-button>
              </div>
            </div>
            
            <!-- 编辑模式下的文件上传 -->
            <el-upload
              v-if="!editForm.fileUrl"
              class="upload-demo"
              drag
              :http-request="handleEditCustomUpload" 
              :on-success="handleEditUploadSuccess"
              :on-error="handleEditUploadError"
              :before-upload="beforeUpload"
              :file-list="editFileList"
              :limit="1"
              :on-exceed="handleExceed"
              accept="image/*,video/*"
              :auto-upload="true"
              :show-file-list="false"
              :disabled="editUploadLoading"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                拖放文件到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip text-sm text-gray-500">
                  支持上传图片和视频文件，图片大小不能超过5M，视频大小不能超过30M
                </div>
              </template>
            </el-upload>
          </el-form>
        </div>
      </div>
      <template #footer>
        <!-- 查看模式下的按钮 -->
        <div v-if="!isEditing">
          <el-button 
            type="primary" 
            @click="handleEdit(currentSegment)"
            class="edit-button"
          >
            编辑
          </el-button>
          <el-button 
            @click="detailDialogVisible = false"
            class="close-detail-button"
          >
            关闭
          </el-button>
        </div>
        
        <!-- 编辑模式下的按钮 -->
        <div v-if="isEditing">
          <el-button 
            @click="cancelEdit"
            class="cancel-button"
            :disabled="editUploadLoading"
          >
            取消
          </el-button>
          <el-button 
            type="primary" 
            @click="handleSaveEdit"
            class="confirm-button"
            :disabled="editUploadLoading"
          >
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeMount, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Delete, Plus, ArrowLeft, UploadFilled, Picture, VideoCamera } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getKnowledgeDocumentSegmentDetailAPI, deleteKnowledgeDocumentSegmentAPI, uploadFileAPI,
createKnowledgeDocumentSegmentAPI,bindFileAPI,deleteBindFileAPI,updateKnowledgeDocumentSegmentAPI,updateBindFileAPI } from '@/api'
import { useUserStore } from '@/stores/pinia'

// 自定义函数：截断文本并添加省略号
const truncate = (value, length) => {
  if (!value) return ''
  // 分割成多行，找到第一个非空行
  const lines = value.split('\n')
  const firstNonEmptyLine = lines.find(line => line.trim().length > 0)
  // 如果没有找到非空行，返回空字符串
  if (!firstNonEmptyLine) return ''
  const trimmedLine = firstNonEmptyLine.trim()
  // 对首个非空行进行截断处理
  if (trimmedLine.length <= length) return trimmedLine
  return trimmedLine.slice(0, length) + '...'
}

// 判断文件类型的辅助函数 - 从URL获取扩展名
const getFileExtension = (url) => { 
  if (!url) return '';
  // 从URL中提取文件名和扩展名（处理可能的哈希值）
  const fileName = url.split('/').pop().split('?')[0].split('#')[0];
  const extMatch = fileName.match(/\.([^.]+)$/);
  return extMatch ? extMatch[1].toLowerCase() : '';
};

// 从文本中提取所有URL的辅助函数
const extractUrls = (text) => {
  if (!text) return [];
  // 匹配http/https开头的URL，考虑常见的URL特殊字符
  const urlRegex = /https?:\/\/[^\s"'<>()]+/g;
  const urls = text.match(urlRegex) || [];
  // 去重处理，避免重复检查相同链接
  return [...new Set(urls)];
};

// 判断内容中是否含有图片类型链接，提取第一个符合条件的链接
const extractImageUrls = (content) => {
  if (!content) return '';
  const urls = extractUrls(content);
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'jfif', 'pjpeg', 'pjp'];
  
  for (const url of urls) {
    const ext = getFileExtension(url);
    if (imageExtensions.includes(ext)) {
      return url;
    }
  }
  return '';
};

// 判断内容中是否含有视频类型链接，提取第一个符合条件的链接
const extractVideoUrls = (content) => {
  if (!content) return '';
  const urls = extractUrls(content);
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'mpg', 'mpeg', '3gp'];
  
  for (const url of urls) {
    const ext = getFileExtension(url);
    if (videoExtensions.includes(ext)) {
      return url;
    }
  }
  return '';
};
//判断是否为图片类型
const isImageType = (url) => {
  const ext = getFileExtension(url);
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'jfif', 'pjpeg', 'pjp'];
  return imageExtensions.includes(ext);
}
//判断是否为视频类型
const isVideoType = (url) => {
  const ext = getFileExtension(url);
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'mpg', 'mpeg', '3gp'];
  return videoExtensions.includes(ext);
}
//提取除链接以外的文本
const extractText = (content) => {
  if (!content) return ''
  // 移除所有HTML标签
  const text = content.replace(/<[^>]+>/g, '')
  // 移除所有URL
  const urlRegex = /https?:\/\/[^\s]+/g
  return text.replace(urlRegex, '')
}

// 数据
const searchQuery = ref('')
const dialogVisible = ref(false)
const segments = ref([])
const loading = ref(false)
const searchFocused = ref(false)

// 状态管理
const userStore = useUserStore();
const role = computed(() => {
  return userStore.userInfo?.role ?? 0; // 1：管理员 0：普通用户，默认普通用户
});

// 选中状态和详情弹窗相关
const selectedSegmentId = ref(null)
const detailDialogVisible = ref(false)
const currentSegment = ref({ content: '', id: null })
const isEditing = ref(false) // 新增：编辑状态标识

// 表单焦点状态
const contentFocused = ref(false)
const isMobile = ref(false)

// 分页相关数据
const currentPage = ref(1)
const size = ref(5)
const total = ref(0) // 总数据条数

// 文件上传相关（添加分段）
const fileList = ref([]) // 上传的文件列表
const addUploadLoading = ref(false) // 上传加载状态 - 添加模式
const uploadSuccessFlag = ref(false) // 防止上传成功回调重复触发的标志位

// 新增：编辑模式下的文件上传相关
const editFileList = ref([])
const editUploadLoading = ref(false) // 上传加载状态 - 编辑模式
const editUploadSuccessFlag = ref(false)

const route = useRoute()
const dataset_id = ref(route.params.id)           // 获取知识库id
const document_id = ref(route.params.document_id) // 获取文档id

// 检测屏幕尺寸
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
}


onBeforeMount(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// 监听路由参数变化
watch(
  () => [route.params.id, route.params.document_id],
  ([newDatasetId, newDocumentId]) => {
    if (newDatasetId && newDocumentId) {
      dataset_id.value = newDatasetId
      document_id.value = newDocumentId
      currentPage.value = 1
      getSegmentList()
    }
  }
)

// 获取分段列表
const getSegmentList = async () => {
  try {
    loading.value = true
    const res = await getKnowledgeDocumentSegmentDetailAPI(dataset_id.value, document_id.value, {
      page: currentPage.value,
      limit: size.value,
      keyword: searchQuery.value,
    })
    if (res.status === 200) {
      segments.value = res.data.data
      total.value = res.data.total // 从接口响应中获取总条数
    }
    loading.value = false
  } catch (error) {
    console.error('获取分段列表出错:', error)
    ElMessage.error('获取数据失败，请稍后重试')
    segments.value = []
    total.value = 0 // 出错时重置总数
    loading.value = false
  }
}


const handleBack = () => {
  history.back()
}

onMounted(() => {
  if (dataset_id.value && document_id.value) {
    getSegmentList()
  } else {
    ElMessage.error('未找到完整的参数信息')
  }
})

const handleSearch = () => {
  currentPage.value = 1
  // 防抖处理，避免频繁搜索
  clearTimeout(window.searchTimeout)
  window.searchTimeout = setTimeout(() => {
    getSegmentList()
  }, 300)
}

// 添加分段表单相关
const formRef = ref(null)
const segmentForm = ref({
  content: '',
  fileUrl: null, // 存储上传文件的在线路径
  fileName: null, // 存储上传文件的名称
})

// 新增：编辑表单相关
const editFormRef = ref(null)
const editForm = ref({
  content: '',
  fileUrl: null,
  fileName: null,
  originalFileUrl: null // 保存原始文件URL，用于取消编辑时恢复
})

const rules = {
  content: [{ required: true, message: '请输入分段内容', trigger: 'blur' }]
}

// 自定义上传方法，使用提供的uploadFile API
const handleCustomUpload = async (params) => {
  try {
    addUploadLoading.value = true; // 开始上传，显示加载动画
    uploadSuccessFlag.value = false; // 重置标志位
    // 调用上传API
    const response = await uploadFileAPI(params.file)
    params.onSuccess(response);
  } catch (error) {
    // 调用Element UI的上传失败回调
    params.onError(error);
  } finally {
    addUploadLoading.value = false; // 无论成功失败，都关闭加载动画
  }
}

// 新增：编辑模式下的自定义上传
const handleEditCustomUpload = async (params) => {
  try {
    editUploadLoading.value = true; // 开始上传，显示加载动画
    editUploadSuccessFlag.value = false;
    const response = await uploadFileAPI(params.file)
    params.onSuccess(response);
  } catch (error) {
    params.onError(error);
  } finally {
    editUploadLoading.value = false; // 无论成功失败，都关闭加载动画
  }
}

// 文件上传前的校验
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/') 
  const isVideo = file.type.startsWith('video/')
  if (!isImage && !isVideo) {
    ElMessage.error('只能上传图片或视频文件!')
    return false
  }
  //图片大小不能超过5M，视频不能超过30M
  if(isImage){
    if(file.size / 1024 / 1024 > 5){
      ElMessage.error('图片大小不能超过5M!')
      return false
    }
  }
  if(isVideo){
    if(file.size / 1024 / 1024 > 30){
      ElMessage.error('视频大小不能超过30M!')
      return false
    }
  }
  
  return true
}

// 文件上传成功处理 - 添加标志位防止重复处理
const handleUploadSuccess = (response) => {
  // 检查是否已经处理过这个成功事件
  if (uploadSuccessFlag.value) {
    return;
  }
  
  try {
    // 先检查response是否存在
    if (!response) {
      ElMessage.error('文件上传失败: 未收到响应')
      return
    }
    
    // 处理API返回结果
    if (response.data.code === 0 ) { 
      const fileUrl = response.data.data
      segmentForm.value.fileUrl = fileUrl
      
      // 从URL中提取文件名（包含压缩后的扩展名）
      const fileName = fileUrl.split('/').pop().split('?')[0]
      segmentForm.value.fileName = fileName
      
      // 更新文件列表
      fileList.value = [{
        name: fileName,
        url: fileUrl,
      }]
      
      ElMessage.success('文件上传成功')
      uploadSuccessFlag.value = true; // 标记为已处理
    } else {
      ElMessage.error('文件上传失败: ' + (response.data.msg || '未知错误'))
      // 上传失败时清除文件列表
      fileList.value = [];
    }
  } catch (error) {
    console.error('处理上传成功响应时出错:', error)
    ElMessage.error('处理文件信息失败')
    // 处理失败时清除文件列表
    fileList.value = [];
  }
}

// 新增：编辑模式下文件上传成功处理
const handleEditUploadSuccess = (response) => {
  if (editUploadSuccessFlag.value) {
    return;
  }
  
  try {
    if (!response) {
      ElMessage.error('文件上传失败: 未收到响应')
      return
    }
    
    if (response.status === 200 ) { 
      const fileUrl = response.data.data
      editForm.value.fileUrl = fileUrl
      
      const fileName = fileUrl.split('/').pop().split('?')[0]
      editForm.value.fileName = fileName
      
      editFileList.value = [{
        name: fileName,
        url: fileUrl,
      }]
      
      ElMessage.success('文件上传成功')
      editUploadSuccessFlag.value = true;
    } else {
      ElMessage.error('文件上传失败: ' + (response.msg || '未知错误'))
      // 上传失败时清除文件列表
      editFileList.value = [];
    }
  } catch (error) {
    console.error('处理上传成功响应时出错:', error)
    ElMessage.error('处理文件信息失败')
    // 处理失败时清除文件列表
    editFileList.value = [];
  }
}

// 移除已上传的文件
const removeFile = () => {
  segmentForm.value.fileUrl = null
  segmentForm.value.fileName = null
  fileList.value = []
  uploadSuccessFlag.value = false;
}

// 新增：移除编辑模式下已上传的文件
const removeEditFile = () => {
  editForm.value.fileUrl = null
  editForm.value.fileName = null
  editFileList.value = []
  editUploadSuccessFlag.value = false;
}

// 文件上传失败处理
const handleUploadError = (err) => {
  console.error('文件上传错误:', err)
  uploadSuccessFlag.value = false;
  // 清除文件列表，防止上传失败后仍计数
  fileList.value = [];
  if (err.response && err.response.status === 401) {
    ElMessage.error('认证失败，请重新登录')
  } else {
    ElMessage.error('文件上传失败，请稍后重试')
  }
}

// 新增：编辑模式下文件上传失败处理
const handleEditUploadError = (err) => {
  console.error('文件上传错误:', err)
  editUploadSuccessFlag.value = false;
  // 清除文件列表，防止上传失败后仍计数
  editFileList.value = [];
  if (err.response && err.response.status === 401) {
    ElMessage.error('认证失败，请重新登录')
  } else {
    ElMessage.error('文件上传失败，请稍后重试')
  }
}

// 文件超出数量限制处理
const handleExceed = (files, fileList) => {
  ElMessage.warning(`只能上传一个文件`)
}

const handleClose = () => {
  dialogVisible.value = false
  segmentForm.value = {
    content: '',
    fileUrl: null,
    fileName: null,
  }
  fileList.value = []
  uploadSuccessFlag.value = false;
  if (formRef.value) {
    formRef.value.resetFields()
  }
  contentFocused.value = false
}

const handleDeleteSegment = async (segment) => {
  await ElMessageBox.confirm('确定要删除这个分段吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await deleteKnowledgeDocumentSegmentAPI(dataset_id.value,document_id.value,segment.id)
    if (res.status === 200) {
      ElMessage.success('删除成功')
      //判断是否有关联文件
      if(isImageType(extractImageUrls(segment.content)) || isVideoType(extractVideoUrls(segment.content))){
        await deleteBindFileAPI({segmentId:segment.id})
      }
      // 如果删除的是选中的分段，清除选中状态
      if (selectedSegmentId.value === segment.id) {
        selectedSegmentId.value = null
      }
      getSegmentList()
    } else {
      ElMessage.error('删除失败: ' + (res.msg || '未知错误'))
    }
  })
  .catch(() => {
    ElMessage({
      type: 'info',
      message: '已取消删除'
    })
  })
}

const handleAddSegment = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    // 调用添加分段API
    const content = segmentForm.value.content + (segmentForm.value.fileUrl ? "\n" + segmentForm.value.fileUrl : "")
    const res = await createKnowledgeDocumentSegmentAPI(dataset_id.value, document_id.value, content)
    
    if (res.status === 200) {
      ElMessage.success('添加成功')
      // 如果有上传文件，绑定文件与分段
      if (segmentForm.value.fileUrl && res.data.data[0]?.id) {
        await bindFileAPI({fileName:segmentForm.value.fileName, segmentId: res.data.data[0].id})
      }
      // 重新获取分段列表
      getSegmentList()
      // 关闭对话框并重置表单
      dialogVisible.value = false
      segmentForm.value = {
        content: '',
        fileUrl: null,
        fileName: null
      }
      fileList.value = []
      uploadSuccessFlag.value = false
    } else {
      ElMessage.error('添加失败: ' + (res.msg || '未知错误'))
    }
  } catch (error) {
    if (error.name !== 'ValidationError') {
      console.error('添加分段失败:', error)
      ElMessage.error('添加失败，请稍后重试')
    }
  }
}

// 新增：进入编辑模式
const handleEdit = (currentSegment) => {
  // 保存当前内容到编辑表单
  editForm.value.content = extractText(currentSegment.content)
  editForm.value.fileUrl = extractImageUrls(currentSegment.content) || extractVideoUrls(currentSegment.content)
  editForm.value.originalFileUrl = editForm.value.fileUrl // 保存原始文件URL
  isEditing.value = true
}

// 新增：取消编辑
const cancelEdit = () => {
  // 恢复原始值
  editForm.value.content = ''
  editForm.value.fileUrl = null
  editForm.value.fileName = null
  editForm.value.originalFileUrl = null
  editFileList.value = []
  editUploadSuccessFlag.value = false
  isEditing.value = false
}

// 新增：保存编辑
const handleSaveEdit = async () => {
  if (!editFormRef.value || !currentSegment.value.id) return
  
  try {
    await editFormRef.value.validate()
    
    // 构建完整内容（文本 + 文件URL）
    const content = editForm.value.content + (editForm.value.fileUrl ? "\n" + editForm.value.fileUrl : "")
    await updateKnowledgeDocumentSegmentAPI(
      dataset_id.value, 
      document_id.value, 
      currentSegment.value.id,
      content
    ).then(async (res) => {
      if (res.status === 200) {
        ElMessage.success('更新成功')
        // 如果文件有变化，处理文件绑定
        console.log("1."+editForm.value.fileUrl,"2."+editForm.value.originalFileUrl)
        console.log(editForm.value.fileUrl && editForm.value.fileUrl !== editForm.value.originalFileUrl)
        if (editForm.value.fileUrl && editForm.value.fileUrl !== editForm.value.originalFileUrl) {
            //更新绑定文件
            await updateBindFileAPI({fileName: editForm.value.fileName, segmentId: currentSegment.value.id})
        } else if (!editForm.value.fileUrl && editForm.value.originalFileUrl) {
          // 如果移除了文件，更新文件状态
            await deleteBindFileAPI({segmentId: currentSegment.value.id})
        }
      } else {
        ElMessage.error('更新失败: ' + (res.msg || '未知错误'))
      }
    }) 
    // 重新获取列表并关闭弹窗
    getSegmentList()
    detailDialogVisible.value = false
    cancelEdit()
  } catch (error) {
    if (error.name !== 'ValidationError') {
      console.error('更新分段失败:', error)
      ElMessage.error('更新失败，请稍后重试')
    }
  }
}

const handlePageChange = (val) => {
  currentPage.value = val
  getSegmentList()
  // 切换页码时清除选中状态
  selectedSegmentId.value = null
}

// 卡片点击处理：第一次点击选中，第二次点击打开详情
const handleCardClick = (segment) => {
  if (selectedSegmentId.value === segment.id) {
    // 已选中，打开详情
    currentSegment.value = { ...segment }
    detailDialogVisible.value = true
    isEditing.value = false // 确保打开详情时不是编辑模式
  } else {
    // 未选中，设置为选中状态
    selectedSegmentId.value = segment.id
  }
}
</script>

<style scoped>
/* 样式内容 */
.segments-container {
  padding: 0;
  min-height: 100vh;
  background-color: #f5f7fa;
  transition: background-color 0.3s ease;
}

.top-nav {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.back-button {
  color: #6b7280;
  margin-right: 16px;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.back-button-hover {
  background-color: #f1f5f9;
  color: #3b82f6;
}

.search-input {
  flex: 1;
  max-width: 600px;
  transition: all 0.3s ease;
}

.search-focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.add-nav-button {
  margin-left: 16px;
  transition: all 0.2s ease;
}

.add-nav-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.card-list {
  padding: 0 24px;
  margin-bottom: 30px;
}

.card-item {
  height: 100%;
  min-height: 150px;
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
}

/* 只保留这些样式定义 */
.card-content-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  min-height: 106px;
  padding: 20px 50px 20px 20px;
}

.card-content {
  color: #64748b;
  font-size: 32px;
  line-height: 1.6;
  margin: 0;
  cursor: pointer;
  transition: color 0.2s ease;
  text-align: left !important; /* 添加 !important 确保左对齐 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

/* 删除按钮样式 */
.delete-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: all 0.2s ease;
  color: #ef4444;
  pointer-events: none;
  z-index: 1;
}

/* 选中状态样式 */
.card-selected {
  border-color: #3b82f6;
  background-color: #f0f9ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* Flex容器用于将内容和删除按钮放在同一行 */
.card-content-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
  padding: 0 10px;
}

.file-icon {
  margin-right: 10px;
  font-size: 18px;
}

.image-icon {
  color: #10b981;
}

.video-icon {
  color: #f59e0b;
}

.delete-btn {
  opacity: 0;
  transition: all 0.2s ease;
  color: #ef4444;
  flex-shrink: 0; /* 保持不变 */
  margin-left: 0; /* 删除固定的 margin-left */
  pointer-events: none;
}

/* 只在卡片被选中时显示删除按钮并允许点击 */
.card-selected .delete-btn {
  opacity: 1;
  pointer-events: auto;
}

.delete-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.card-content {
  color: #64748b;
  font-size: 32px;
  line-height: 1.6;
  margin: 0;
  cursor: pointer;
  transition: color 0.2s ease;
  text-align: center;
  flex: 1; /* 改用 flex: 1 替代 flex-grow: 1 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0; /* 添加这行以确保文本可以正确截断 */
}

.card-selected .card-content {
  color: #1e40af;
}

.card-content:hover {
  color: #3b82f6;
  text-decoration: underline;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  gap: 20px;
}

.pagination {
  user-select: none;
}

.empty-state {
  margin: 60px auto;
  text-align: center;
}

.empty-add-btn {
  margin-top: 16px;
  transition: all 0.2s ease;
}

.empty-add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.custom-dialog, .detail-dialog {
  border-radius: 12px;
  overflow: hidden;
}
.custom-dialog :deep(.el-dialog) {
  margin-top: 5vh !important; /* 调整到距离顶部10%的位置，原来是15vh */
  margin-bottom: 0 !important; /* 移除底部间距 */
}

/* 提升弹窗内容框高度 */
.custom-dialog .el-dialog__body,
.detail-dialog .el-dialog__body {
  min-height: 450px;
  display: flex;
  flex-direction: column;
}

.custom-form, .edit-form {
  margin-top: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.form-item {
  margin-bottom: 20px;
}

.custom-input,
.custom-input-number {
  transition: all 0.2s ease;
}

.input-focus {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  border-color: #93c5fd;
}

/* 文件上传框调小 */
.upload-demo {
  margin-top: 8px;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  padding: 20px 10px; /* 减小内边距 */
  min-height: 100px; /* 调小高度 */
}

.upload-demo .el-icon--upload {
  font-size: 35px; /* 调小图标 */
  margin-bottom: 8px;
}

.upload-demo .el-upload__text {
  font-size: 25px; /* 调小文字 */
}

.upload-demo:hover {
  border-color: #93c5fd;
}

/* 上传成功后的预览容器 - 保持不变 */
.upload-preview-container {
  margin-top: 8px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f9fafb;
  transition: all 0.2s ease;
}

/* 上传的图片样式 - 保持不变 */
.uploaded-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  margin-bottom: 12px;
}

/* 上传的视频样式 - 保持不变 */
.uploaded-video {
  width: 100%;
  max-height: 200px;
  border-radius: 4px;
  margin-bottom: 12px;
}

/* 文件信息样式 - 保持不变 */
.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #4b5563;
  font-size: 14px;
}

.file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  margin-right: 10px;
}

/* 移除文件按钮 - 保持不变 */
.remove-file-btn {
  color: #ef4444;
  padding: 4px 8px;
  transition: all 0.2s ease;
}

.remove-file-btn:hover {
  color: #dc2626;
  background-color: rgba(239, 68, 68, 0.1);
}

.cancel-button {
  margin-right: 10px;
  transition: all 0.2s ease;
}

.cancel-button:hover {
  background-color: #f1f5f9;
}

.confirm-button, .close-detail-button, .edit-button {
  transition: all 0.2s ease;
}

.confirm-button:hover, .close-detail-button:hover, .edit-button:hover {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.detail-content {
  font-size: 24px;
  line-height: 1.8;
  color: #333;
  white-space: pre-line;
  flex-grow: 1;
  overflow-y: auto;
}

/* 详情中的文件展示样式 - 保持不变 */
.detail-file-container {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.file-label {
  font-weight: 600;
  margin-bottom: 10px;
  color: #4b5563;
}

.detail-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 4px;
}

.detail-video {
  width: 100%;
  max-height: 400px;
  border-radius: 4px;
}

/* 上传加载动画容器样式 */
.upload-loading-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 1000;
  border-radius: inherit;
}

/* 加载动画样式 */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  color: #4b5563;
  font-size: 16px;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 针对PC端样式 */
@media screen and (min-width: 1024px) {
.upload-demo .el-upload__text {
  font-size: 12px; /* 调小文字 */
}
.card-content {
  font-size: 16px;
}

}
</style>
