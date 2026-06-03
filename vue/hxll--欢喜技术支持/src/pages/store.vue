<template>
  <div class="store-detail-page">
    <!-- 导航栏 -->
    <div class="header">
      <van-nav-bar 
        :title="storeInfo ? storeInfo.name : $t('officialWebsite.stores.title')" 
        left-text="返回" 
        left-arrow 
        @click-left="goBack" 
      />
    </div>

    <!-- 加载状态 -->
    <div class="loading-container" v-if="loading">
      <div class="loading-spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- 门店详情内容 -->
    <div class="store-detail-content" v-else-if="storeInfo">
      <!-- 门店图片/视频轮播 -->
      <section class="store-media-section">
        <div class="media-carousel">
          <div class="media-slide" v-for="(file, index) in storeInfo.files" :key="'media-' + index" v-show="currentMediaIndex === index">
            <!-- 视频 -->
            <div class="media-wrapper video-wrapper" v-if="file.type === 'video'">
              <video
                class="store-video"
                controls
                preload="metadata"
                playsinline
                webkit-playsinline>
                <source :src="file.url" type="video/mp4">
                您的浏览器不支持视频播放
              </video>
            </div>
            <!-- 图片 -->
            <div class="media-wrapper image-wrapper" v-else @click="openImagePreview(file.url)">
              <img :src="file.url" :alt="'门店图片 ' + (index + 1)" class="store-image">
              <div class="image-zoom-hint">
                <i class="icon-zoom-in"></i>
                <span>{{ $t('officialWebsite.certificates.viewLargeImage') }}</span>
              </div>
            </div>
          </div>

          <!-- 轮播指示器 -->
          <div class="carousel-indicators" v-if="storeInfo.files.length > 1">
            <span
              v-for="(file, index) in storeInfo.files"
              :key="'indicator-' + index"
              class="indicator"
              :class="{ 'active': currentMediaIndex === index }"
              @click="currentMediaIndex = index"
            ></span>
          </div>

          <!-- 轮播控制按钮 -->
          <div class="carousel-btn prev-btn" v-if="storeInfo.files.length > 1" @click="prevMedia">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </div>
          <div class="carousel-btn next-btn" v-if="storeInfo.files.length > 1" @click="nextMedia">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </div>
        </div>
      </section>

      <!-- 门店信息 -->
      <section class="store-info-section">
        <div class="store-header">
          <h1 class="store-name">{{ storeInfo.name }}</h1>
        </div>

        <div class="store-address">
          <span class="label">{{ $t('officialWebsite.stores.address') }}</span>
          <span class="address">{{ storeInfo.address }}</span>
        </div>

        <!-- 一键导航 -->
        <div class="store-actions" v-if="storeInfo.address">
          <!-- <button class="action-btn" @click="openMap">
            <span>一键导航</span>
          </button> -->
          <button class="action-btn" @click="copyAddress">
            <span>{{ $t('officialWebsite.stores.copyAddress') }}</span>
          </button>
        </div>
      </section>
    </div>

    <!-- 门店不存在 -->
    <div class="not-found" v-else>
      <i class="icon-store"></i>
      <h2>{{ $t('common.noData') }}</h2>
      <p>抱歉，您查看的门店不存在或已被移除</p>
      <button class="btn-primary" @click="goBack">返回首页</button>
    </div>

    <!-- 全屏图片预览弹窗 -->
    <div class="image-preview-overlay" v-if="isImagePreviewOpen" @click="closeImagePreview" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd" @wheel="handleWheel">
      <div class="image-preview-content" @click.stop @dblclick="handleDoubleClick">
        <img :src="previewImageSrc" alt="门店大图" class="preview-image"
             :style="{ transform: `scale(${imageScale}) translate(${imageTranslateX}px, ${imageTranslateY}px)`, transition: isPinching || isDragging ? 'none' : 'transform 0.3s ease' }">
        <div class="zoom-controls" v-if="imageScale > minScale">
          <button class="zoom-btn" @click.stop="zoomOut">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 13H5v-2h14v2z"/>
            </svg>
          </button>
          <button class="zoom-btn" @click.stop="resetZoom">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </button>
          <button class="zoom-btn" @click.stop="zoomIn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
        </div>
        <button class="close-preview-btn" @click.stop="closeImagePreview">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StoreDetail',
  data() {
    return {
      storeInfo: null,
      loading: false,
      currentMediaIndex: 0,
      // 图片预览相关
      isImagePreviewOpen: false,
      previewImageSrc: '',
      imageScale: 1,
      imageTranslateX: 0,
      imageTranslateY: 0,
      isPinching: false,
      initialPinchDistance: 0,
      initialScale: 1,
      lastTouchX: 0,
      lastTouchY: 0,
      isDragging: false,
      maxScale: 5,
      minScale: 1,
      scrollPosition: 0
    }
  },
  mounted() {
    this.fetchStoreDetail()
  },
  watch: {
    '$route'(to, from) {
      if (to.params.id !== from.params.id) {
        this.fetchStoreDetail()
      }
    }
  },
  methods: {
    fetchStoreDetail() {
      this.loading = true
      try {
        const storeId = parseInt(this.$route.params.id)
        if (!storeId) {
          this.loading = false
          return
        }

        // 从 i18n 获取门店数据
        const stores = this.$t('officialWebsite.stores.list') || []
        const store = stores.find(s => s.id === storeId)

        if (store) {
          // 从地址中提取门店名称（地址中"："之前的部分）
          const nameMatch = store.address.match(/^(.+?)：/)
          const storeName = nameMatch ? nameMatch[1] : store.address

          this.storeInfo = {
            id: store.id,
            name: storeName,
            address: store.address,
            files: store.files || []
          }
          this.currentMediaIndex = 0
        }
      } catch (error) {
        console.error('获取门店详情失败:', error)
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.go(-1)
    },
    prevMedia() {
      if (!this.storeInfo || this.storeInfo.files.length <= 1) return
      this.currentMediaIndex = (this.currentMediaIndex - 1 + this.storeInfo.files.length) % this.storeInfo.files.length
    },
    nextMedia() {
      if (!this.storeInfo || this.storeInfo.files.length <= 1) return
      this.currentMediaIndex = (this.currentMediaIndex + 1) % this.storeInfo.files.length
    },
    openImagePreview(imageUrl) {
      if (!imageUrl) return
      this.previewImageSrc = imageUrl
      this.isImagePreviewOpen = true
      this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
      document.body.style.position = 'fixed'
      document.body.style.top = -this.scrollPosition + 'px'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    },
    closeImagePreview() {
      this.isImagePreviewOpen = false
      this.previewImageSrc = ''
      this.imageScale = 1
      this.imageTranslateX = 0
      this.imageTranslateY = 0
      const scrollPosition = this.scrollPosition
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      this.$nextTick(() => {
        window.scrollTo(0, scrollPosition)
      })
    },
    zoomIn() {
      const newScale = this.imageScale + 0.5
      this.imageScale = Math.min(newScale, this.maxScale)
    },
    zoomOut() {
      const newScale = this.imageScale - 0.5
      if (newScale <= this.minScale) {
        this.imageScale = this.minScale
        this.imageTranslateX = 0
        this.imageTranslateY = 0
      } else {
        this.imageScale = newScale
      }
    },
    resetZoom() {
      this.imageScale = 1
      this.imageTranslateX = 0
      this.imageTranslateY = 0
    },
    handleDoubleClick(event) {
      if (this.imageScale === this.minScale) {
        this.imageScale = 2
        const rect = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        this.imageTranslateX = -(x - centerX) / 2
        this.imageTranslateY = -(y - centerY) / 2
      } else {
        this.resetZoom()
      }
    },
    handleWheel(event) {
      event.preventDefault()
      if (event.deltaY < 0) {
        this.zoomIn()
      } else {
        this.zoomOut()
      }
    },
    handleTouchStart(event) {
      if (event.touches.length === 2) {
        this.isPinching = true
        this.initialPinchDistance = this.getDistance(event.touches)
        this.initialScale = this.imageScale
      } else if (event.touches.length === 1) {
        this.lastTouchX = event.touches[0].clientX
        this.lastTouchY = event.touches[0].clientY
        this.isDragging = true
      }
    },
    handleTouchMove(event) {
      if (event.touches.length === 2 && this.isPinching) {
        event.preventDefault()
        const currentDistance = this.getDistance(event.touches)
        const scaleChange = currentDistance / this.initialPinchDistance
        this.imageScale = Math.min(Math.max(this.initialScale * scaleChange, this.minScale), this.maxScale)
      } else if (event.touches.length === 1 && this.isDragging && this.imageScale > this.minScale) {
        event.preventDefault()
        const currentX = event.touches[0].clientX
        const currentY = event.touches[0].clientY
        const deltaX = currentX - this.lastTouchX
        const deltaY = currentY - this.lastTouchY
        this.imageTranslateX += deltaX
        this.imageTranslateY += deltaY
        this.lastTouchX = currentX
        this.lastTouchY = currentY
      }
    },
    handleTouchEnd(event) {
      if (event.changedTouches.length === 2) {
        this.isPinching = false
      } else if (event.changedTouches.length === 1) {
        this.isDragging = false
      }
    },
    getDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    },
    // 打开地图导航
    openMap() {
      if (!this.storeInfo || !this.storeInfo.address) return
      // 使用腾讯地图 URI API
      const address = encodeURIComponent(this.storeInfo.address)
      const url = `https://apis.map.qq.com/uri/v1/geocoder?coord=&addr=${address}&referer=huanxi`
      window.open(url, '_blank')
    },
    // 复制地址
    copyAddress() {
      if (!this.storeInfo || !this.storeInfo.address) return
      
      // 创建临时文本区域
      const textarea = document.createElement('textarea')
      textarea.value = this.storeInfo.address
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      
      try {
        document.execCommand('copy')
        this.$toast && this.$toast('地址已复制到剪贴板')
      } catch (err) {
        console.error('复制失败:', err)
      }
      
      document.body.removeChild(textarea)
    }
  }
}
</script>

<style lang="scss" scoped>
$primary-color: #1989fa;
$secondary-color: #00c4cc;
$text-color: #333;
$text-light: #666;
$bg-color: #f8f9fa;
$white: #ffffff;
$shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
$border-radius: 12px;

.store-detail-page {
  font-family: Microsoft YaHei, sans-serif;
  line-height: 1.7;
  color: $text-color;
  background: $bg-color;
  overflow-x: clip;

  .header {
    position: sticky;
    top: 0;
    z-index: 1000;
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5rem 0;

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid $primary-color;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    p {
      color: $text-light;
      font-size: 1rem;
    }
  }

  .store-detail-content {
    padding-bottom: 0.2rem;
  }

  // 媒体轮播区域
  .store-media-section {
    background: $white;
    margin-bottom: 1rem;

    .media-carousel {
      position: relative;
      width: 100%;
      height: 450px;
      background: #000;

      .media-slide {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }

      .media-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        &.image-wrapper {
          position: relative;
          cursor: pointer;

          .store-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image-zoom-hint {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
            color: $white;

            i {
              font-size: 2.5rem;
              margin-bottom: 0.5rem;
            }

            span {
              font-size: 1rem;
            }
          }

          &:hover .image-zoom-hint {
            opacity: 1;
          }
        }

        &.video-wrapper {
          .store-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }

      .carousel-indicators {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        z-index: 10;

        .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.3s;

          &.active {
            background: $white;
            width: 24px;
            border-radius: 5px;
          }
        }
      }

      .carousel-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10;
        transition: all 0.3s;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

        &:hover {
          background: $white;
          transform: translateY(-50%) scale(1.1);
        }

        &.prev-btn {
          left: 20px;
        }

        &.next-btn {
          right: 20px;
        }

        svg {
          width: 24px;
          height: 24px;
          fill: $text-color;
        }
      }
    }
  }

  // 门店信息区域
  .store-info-section {
    background: $white;
    padding: 1.5rem;
    margin-bottom: 1rem;

    .store-header {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid $bg-color;

      .store-name {
        font-size: 1.5rem;
        font-weight: 700;
        color: $text-color;
        margin: 0;
        line-height: 1.4;
      }
    }

    .store-address {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      padding: 1rem;
      background: $bg-color;
      border-radius: $border-radius;
      margin-bottom: 1.5rem;

      .label {
        font-size: 0.85rem;
        color: $text-light;
        font-weight: 600;
      }

      .address {
        font-size: 1rem;
        color: $text-color;
        line-height: 1.6;
        word-break: break-word;
      }
    }

    // 操作按钮
    .store-actions {
      display: flex;
      gap: 0.8rem;

      .action-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, $primary-color, $secondary-color);
        color: $white;
        border: none;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 2px 8px rgba($primary-color, 0.3);

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 12px rgba($primary-color, 0.4);
        }

        &:active {
          transform: translateY(0);
        }
      }
    }
  }

  // 门店不存在
  .not-found {
    text-align: center;
    padding: 5rem 2rem;
    background: $white;
    margin: 2rem 1rem;
    border-radius: $border-radius;
    box-shadow: $shadow;

    i {
      font-size: 4rem;
      color: $primary-color;
      opacity: 0.4;
      margin-bottom: 1rem;
    }

    h2 {
      font-size: 1.5rem;
      color: $text-color;
      margin-bottom: 0.5rem;
    }

    p {
      color: $text-light;
      margin-bottom: 1.5rem;
    }

    .btn-primary {
      padding: 0.8rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      color: $white;
      background: linear-gradient(135deg, $primary-color, $secondary-color);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        opacity: 0.9;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba($primary-color, 0.3);
      }
    }
  }

  // 图片预览弹窗
  .image-preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: fadeIn 0.3s ease;
    overflow: hidden;

    .image-preview-content {
      position: relative;
      max-width: 90%;
      max-height: 90%;
      display: flex;
      align-items: center;
      justify-content: center;

      .preview-image {
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        transform-origin: center center;
        cursor: move;
      }

      .zoom-controls {
        position: absolute;
        bottom: -60px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 10px;
        background: rgba(0, 0, 0, 0.7);
        padding: 10px 15px;
        border-radius: 30px;
        backdrop-filter: blur(10px);

        .zoom-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: $white;
          padding: 0;
          transition: all 0.3s ease;

          svg {
            width: 20px;
            height: 20px;
            fill: currentColor;
          }

          &:hover {
            background: rgba(255, 255, 255, 0.35);
            transform: scale(1.1);
          }

          &:active {
            transform: scale(0.95);
          }
        }
      }

      .close-preview-btn {
        position: absolute;
        top: -50px;
        right: 0;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $white;
        padding: 0;
        transition: all 0.3s ease;

        svg {
          width: 24px;
          height: 24px;
          fill: currentColor;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .store-detail-page {

    .store-media-section {
      margin-bottom: 0.2rem !important;
      .media-carousel {
        height: 280px;

        .carousel-btn {
          width: 36px;
          height: 36px;

          &.prev-btn {
            left: 10px;
          }

          &.next-btn {
            right: 10px;
          }

          svg {
            width: 20px;
            height: 20px;
          }
        }

        .carousel-indicators {
          .indicator {
            width: 8px;
            height: 8px;

            &.active {
              width: 20px;
            }
          }
        }
      }
    }

    .store-info-section {
      padding: 1rem;
      margin-bottom: 0.1rem !important;

      .store-header {
        margin-bottom: 0.2rem !important;
        padding: 0.1rem !important;
        .store-name {
          font-size: 0.6rem !important;
        }
      }

      .store-address {
        padding: 0.3rem !important;
        gap: 0.2rem !important;
        margin-bottom: 0.35rem !important;

        .label {
          font-size: 0.7rem !important;
        }

        .address {
          font-size: 0.5rem !important;
        }
      }

      .store-actions {
        flex-direction: column;
        gap: 0.5rem;

        .action-btn {
          padding: 0.25rem 0.6rem;
          font-size: 0.7rem;
        }
      }
    }

    .not-found {
      padding: 3rem 1rem;
      margin: 1rem 0.5rem;

      i {
        font-size: 3rem;
      }

      h2 {
        font-size: 1.2rem;
      }

      p {
        font-size: 0.85rem;
      }

      .btn-primary {
        padding: 0.6rem 1.5rem;
        font-size: 0.9rem;
      }
    }

    .image-preview-overlay {
      .image-preview-content {
        max-width: 95%;

        .preview-image {
          max-height: 80vh;
        }

        .zoom-controls {
          bottom: -55px;
          padding: 8px 12px;

          .zoom-btn {
            width: 36px;
            height: 36px;

            svg {
              width: 18px;
              height: 18px;
            }
          }
        }

        .close-preview-btn {
          top: -45px;
          width: 36px;
          height: 36px;

          svg {
            width: 20px;
            height: 20px;
          }
        }
      }
    }
  }
}
</style>
