<template>
  <div class="product-detail">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-back" @click="goBack">
          &lt;
        </div>
        <div class="nav-logo">
          <img src="../../static/img/logo(1).png" alt="Logo" class="logo-img">
          <span class="logo-text">蜗牛森林技术支持</span>
        </div>
      </div>
    </nav>

    <!-- 产品详情内容 -->
    <section class="detail-section">
      <div class="detail-container">
        <!-- 加载状态 -->
        <div class="loading-container" v-if="loading">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 产品详情 -->
        <div class="product-detail-content" v-else-if="product">
          <!-- 产品图片 -->
          <div class="product-images">
            <div class="main-image" @click="toggleFullscreen">
              <img :src="currentImage || product.imageUrl1" :alt="product.productName" v-if="currentImage || product.imageUrl1">
              <div class="image-placeholder" v-else>
                <i class="icon-image"></i>
                <span>暂无图片</span>
              </div>
              <div class="fullscreen-hint" v-if="currentImage || product.imageUrl1"> 
                <i class="icon-zoom-in"></i>
                <span></span>
              </div>
            </div>
            <!-- 图片缩略图 -->
            <div class="thumbnail-list" v-if="thumbnailImages.length > 0">
              <div 
                class="thumbnail-item" 
                :class="{ 'active': currentImage === thumb }"
                v-for="(thumb, index) in thumbnailImages" 
                :key="index"
                @click="currentImage = thumb"
              >
                <img :src="thumb" :alt="product.productName">
              </div>
            </div>
          </div>

          <!-- 产品信息 -->
          <div class="product-info">
            <h1 class="product-name">{{ product.productName }}</h1>
            <p class="product-subtitle" v-if="product.subtitle">{{ product.subtitle }}</p>
            
            <div class="info-row" v-if="product.deviceType">
              <span class="label">产品类型：</span>
              <span class="value">{{ getDeviceTypeName(product.deviceType) }}</span>
            </div>
            
            <!-- <div class="info-row" v-if="product.material">
              <span class="label">材质：</span>
              <span class="value">{{ product.material }}</span>
            </div> -->
            
            <div class="info-row" v-if="product.size">
              <span class="label">尺寸：</span>
              <span class="value">{{ product.size }}</span>
            </div>
            
            <div class="info-row" v-if="product.weight">
              <span class="label">重量：</span>
              <span class="value">{{ product.weight }}</span>
            </div>
            
            <div class="info-row" v-if="product.power">
              <span class="label">功率：</span>
              <span class="value">{{ product.power }}</span>
            </div>
            
            <!-- <div class="info-row" v-if="product.voltage">
              <span class="label">电压：</span>
              <span class="value">{{ product.voltage }}</span>
            </div> -->

            <!-- <div class="product-description" v-if="product.description">
              <h3>产品描述</h3>
              <p>{{ product.description }}</p>
            </div> -->
          </div>
        </div>

        <!-- 产品不存在 -->
        <div class="not-found" v-else>
          <i class="icon-box"></i>
          <h2>产品不存在</h2>
          <p>抱歉，您查看的产品不存在或已被移除</p>
          <button class="btn-primary" @click="goBackToProducts">返回产品列表</button>
        </div>
      </div>
    </section>

    <!-- 全屏图片弹窗 -->
    <div class="fullscreen-modal" v-if="isFullscreen" @click="toggleFullscreen" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd" @wheel="handleWheel">
      <div class="fullscreen-content" @click.stop @dblclick="handleDoubleClick">
        <img :src="currentImage || product.imageUrl1" :alt="product.productName" v-if="currentImage || product.imageUrl1"
             :style="{ transform: `scale(${imageScale}) translate(${imageTranslateX}px, ${imageTranslateY}px)`, transition: isPinching || isDragging ? 'none' : 'transform 0.3s ease' }"
             class="preview-image">
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
        <button class="fullscreen-close" @click.stop="toggleFullscreen">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 页脚 -->
    <!-- <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <img src="../../static/img/logo(1).png" alt="Logo" class="logo-img">
            <span class="logo-text">蜗牛森林技术支持</span>
          </div>
          <div class="footer-links">
            <a href="#" @click.prevent="goBackToProducts">产品列表</a>
          </div>
          <div class="social-icons">
            <a href="#"><i class="icon-wechat"></i></a>
            <a href="#"><i class="icon-qq"></i></a>
            <a href="#"><i class="icon-weibo"></i></a>
          </div>
        </div>
        <div class="copyright">
          <p>&copy; 2023 蜗牛森林技术支持。保留所有权利.</p>
        </div>
      </div>
    </footer> -->
  </div>
</template>

<script>
import 'regenerator-runtime/runtime'
import request1 from '@/utils/request1'

export default {
  name: 'ProductDetail',
  data() {
    return {
      product: null,
      loading: false,
      currentImage: '',
      imageErrors: [],
      isFullscreen: false,
      scrollPosition: 0,
      // 图片缩放相关
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
      minScale: 1
    }
  },
  computed: {
    thumbnailImages() {
      const images = []
      if (this.product && this.product.imageUrl1) images.push(this.product.imageUrl1)
      if (this.product && this.product.imageUrl2) images.push(this.product.imageUrl2)
      if (this.product && this.product.imageUrl3) images.push(this.product.imageUrl3) 
      return images
    }
  },
  mounted() {
    this.fetchProductDetail()
  },
  beforeDestroy() {
    // 组件销毁时恢复 body 滚动
    document.body.style.overflow = ''
  },
  watch: {
    '$route'(to, from) {
      if (to.params.id !== from.params.id) {
        this.fetchProductDetail()
      }
    }
  },
  methods: {
    async fetchProductDetail() {
      this.loading = true
      try {
        const productId = this.$route.params.id
        if (!productId) {
          this.loading = false
          return
        }

        const res = await request1.get('/api/Product/GetProductDetail', {
          params: { id: productId }
        })

        if (res.data.code === 0 && res.data.data) {
          this.product = res.data.data
          this.currentImage = this.product.imageUrl1 || ''
        }
      } catch (error) {
        console.error('获取产品详情失败:', error)
      } finally {
        this.loading = false
      }
    },
    getDeviceTypeName(deviceType) {
      const typeMap = {
        1: '扭蛋机',
        2: '娃娃机', 
        3: '游戏机',
        4: '兑币机',
        5: '糖果机',
        6: '礼品机',
        7: '盲盒机',
        8: '捞鱼机',
        9: '夹子机',
        10: '弹珠机',
        11: '中岛机'
      }
      return typeMap[deviceType] || '未知类型'
    },
    toggleFullscreen() {
      if (!this.currentImage && !this.product.imageUrl1) return
      if (!this.isFullscreen) {
        // 进入全屏：记录当前滚动位置
        this.scrollPosition = window.scrollY || document.documentElement.scrollTop
        this.isFullscreen = true
        // 使用 fixed 定位保持页面位置不变
        document.body.style.position = 'fixed'
        document.body.style.top = `-${this.scrollPosition}px`
        document.body.style.width = '100%'
        document.body.style.overflow = 'hidden'
      } else {
        // 退出全屏：恢复滚动位置
        this.isFullscreen = false
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        this.$nextTick(() => {
          window.scrollTo(0, this.scrollPosition)
        })
      }
    },
    goBack() {
      this.$router.go(-1)
    },
    goBackToProducts() {
      this.$router.push('/productCenter')
    },
    handleImageError(index) {
      this.$set(this.imageErrors, index, true)
    },
    // 放大
    zoomIn() {
      const newScale = this.imageScale + 0.5
      this.imageScale = Math.min(newScale, this.maxScale)
    },
    // 缩小
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
    // 重置缩放
    resetZoom() {
      this.imageScale = 1
      this.imageTranslateX = 0
      this.imageTranslateY = 0
    },
    // 双击放大
    handleDoubleClick(event) {
      if (this.imageScale === this.minScale) {
        this.imageScale = 2
        // 获取点击位置
        const rect = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        // 根据点击位置计算平移
        this.imageTranslateX = -(x - centerX) / 2
        this.imageTranslateY = -(y - centerY) / 2
      } else {
        this.resetZoom()
      }
    },
    // 滚轮缩放
    handleWheel(event) {
      event.preventDefault()
      if (event.deltaY < 0) {
        this.zoomIn()
      } else {
        this.zoomOut()
      }
    },
    // 触摸开始
    handleTouchStart(event) {
      if (event.touches.length === 2) {
        // 双指缩放
        this.isPinching = true
        this.initialPinchDistance = this.getDistance(event.touches)
        this.initialScale = this.imageScale
      } else if (event.touches.length === 1) {
        // 单指拖拽
        this.lastTouchX = event.touches[0].clientX
        this.lastTouchY = event.touches[0].clientY
        this.isDragging = true
      }
    },
    // 触摸移动
    handleTouchMove(event) {
      if (event.touches.length === 2 && this.isPinching) {
        // 双指缩放
        event.preventDefault()
        const currentDistance = this.getDistance(event.touches)
        const scaleChange = currentDistance / this.initialPinchDistance
        this.imageScale = Math.min(Math.max(this.initialScale * scaleChange, this.minScale), this.maxScale)
      } else if (event.touches.length === 1 && this.isDragging && this.imageScale > this.minScale) {
        // 单指拖拽
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
    // 触摸结束
    handleTouchEnd(event) {
      if (event.changedTouches.length === 2) {
        this.isPinching = false
      } else if (event.changedTouches.length === 1) {
        this.isDragging = false
      }
    },
    // 计算双指距离
    getDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
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

.product-detail {
  font-family: Microsoft YaHei, sans-serif;
  line-height: 1.7;
  color: $text-color;
  background: $white;
  overflow-x: clip;

  .navbar {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
    z-index: 1000;
    padding: 0.1rem 0;

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 0 2rem;

      .nav-back {
        font-size: 1.5rem;
        font-weight: 700;
        color: $text-color;
        cursor: pointer;
        margin-right: 1rem;
        transition: color 0.3s;
        line-height: 1;

        &:hover {
          color: $primary-color;
        }
      }

      .nav-logo {
        display: flex;
        align-items: center;

        .logo-img {
          height: 1.0rem;
          margin-right: 0.35rem;
          border-radius: 50%;
        }

        .logo-text {
          font-size: 0.7rem;
          font-weight: 700;
          background: linear-gradient(135deg, $primary-color, $secondary-color);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          white-space: nowrap;
        }
      }
    }
  }

  .detail-section {
    min-height: calc(100vh - 200px);
    background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
    padding: 2rem 0;

    .detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;

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

      .product-detail-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 3rem;
        background: $white;
        border-radius: $border-radius;
        padding: 2rem;
        box-shadow: $shadow;

        .product-images {
          .main-image {
            width: 100%;
            height: 400px;
            background: linear-gradient(135deg, rgba($primary-color, 0.08), rgba($secondary-color, 0.08));
            border-radius: $border-radius;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            margin-bottom: 1rem;
            cursor: pointer;
            position: relative;

            img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }

            .fullscreen-hint {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: opacity 0.3s;
              color: $white;

              i {
                font-size: 2rem;
                margin-bottom: 0.5rem;
              }

              span {
                font-size: 0.9rem;
              }
            }

            &:hover .fullscreen-hint {
              opacity: 1;
            }

            .image-placeholder {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: $text-light;

              i {
                font-size: 3rem;
                margin-bottom: 0.5rem;
                opacity: 0.4;
                color: $primary-color;
              }

              span {
                font-size: 1rem;
              }
            }
          }

          .thumbnail-list {
            display: flex;
            gap: 0.8rem;
            flex-wrap: wrap;

            .thumbnail-item {
              width: 80px;
              height: 80px;
              border-radius: 8px;
              overflow: hidden;
              cursor: pointer;
              border: 2px solid transparent;
              transition: all 0.3s;

              &:hover {
                border-color: $primary-color;
              }

              &.active {
                border-color: $primary-color;
                box-shadow: 0 0 10px rgba($primary-color, 0.3);
              }

              img {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }
          }
        }

        .product-info {
          .product-name {
            font-size: 0.7rem;
            font-weight: 700;
            color: $text-color;
            margin: 0 0 0.5rem 0;
            line-height: 1.3;
          }

          .product-subtitle {
            font-size: 1rem;
            color: $text-light;
            margin-bottom: 1.5rem;
            line-height: 1.5;
          }

          .info-row {
            display: flex;
            padding: 0.8rem 0;
            border-bottom: 1px solid #f0f0f0;

            .label {
              font-weight: 600;
              color: $text-light;
              min-width: 80px;
              font-size: 0.5rem;
            }

            .value {
              color: $text-color;
              flex: 1;
              font-size: 0.5rem;
            }
          }

          .product-description {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 2px solid #f0f0f0;

            h3 {
              font-size: 1.2rem;
              font-weight: 600;
              color: $text-color;
              margin-bottom: 0.8rem;
            }

            p {
              font-size: 0.95rem;
              color: $text-light;
              line-height: 1.8;
              white-space: pre-wrap;
            }
          }

        }
      }

      .not-found {
        text-align: center;
        padding: 5rem 0;
        background: $white;
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
    }
  }

  // 全屏弹窗样式
  .fullscreen-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s;
    overflow: hidden;

    .fullscreen-content {
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

      // 缩放控制按钮
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

      .fullscreen-close {
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

  .footer {
    background: linear-gradient(135deg, #2c3e50, #1a2530);
    color: $white;
    padding: 3rem 0 1.5rem;
    text-align: center;

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 2rem;

      .footer-logo {
        display: flex;
        flex-direction: column;
        align-items: center;

        .logo-img {
          height: 2rem;
          margin-bottom: 0.8rem;
        }

        .logo-text {
          font-size: 0.7rem;
          font-weight: 500;
          color: $white;
        }
      }

      .footer-links {
        display: flex;
        gap: 2rem;

        a {
          color: rgba($white, 0.8);
          text-decoration: none;
          transition: color 0.3s;

          &:hover {
            color: $white;
          }
        }
      }

      .social-icons {
        display: flex;
        gap: 1.2rem;

        a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba($white, 0.1);
          color: $white;
          transition: all 0.3s;

          &:hover {
            background: $primary-color;
            transform: translateY(-3px);
          }
        }
      }
    }

    .copyright {
      padding-top: 1.5rem;
      border-top: 1px solid rgba($white, 0.1);
      color: rgba($white, 0.6);
      font-size: 0.95rem;
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
  .navbar .nav-container {
    flex-direction: row;
    padding: 0.3rem 0.6rem !important;
    align-items: center;

    .nav-back {
      font-size: 1.2rem !important;
      margin-right: 0.5rem !important;
    }

    .nav-logo {
      flex: initial;
      display: flex;
      align-items: center;

      .logo-img {
        height: 1.8rem;
      }

      .logo-text {
        font-size: 0.55rem !important;
        white-space: nowrap;
        margin-left: 0.15rem;
      }
    }
  }

  .detail-section {
    padding: 1rem 0 !important;

    .detail-container {
      padding: 0 0.5rem !important;

      .product-detail-content {
        grid-template-columns: 1fr !important;
        gap: 1.5rem !important;
        padding: 1rem !important;

        .product-images {
          .main-image {
            height: 250px !important;
          }

          .thumbnail-list {
            .thumbnail-item {
              width: 60px !important;
              height: 60px !important;
            }
          }
        }

        .product-info {
          .product-name {
            font-size: 0.8rem !important;
          }

          .product-subtitle {
            font-size: 0.85rem !important;
          }

          .info-row {
            padding: 0.5rem 0 !important;
            flex-direction: column;

            .label {
              min-width: auto;
              margin-bottom: 0.3rem;
            }
          }

          .product-description {
            h3 {
              font-size: 1rem !important;
            }

            p {
              font-size: 0.85rem !important;
            }
          }
        }
      }

      .not-found {
        padding: 3rem 1rem !important;

        i {
          font-size: 3rem !important;
        }

        h2 {
          font-size: 1.2rem !important;
        }

        p {
          font-size: 0.85rem !important;
        }
      }
    }
  }

  .footer .footer-content {
    flex-direction: column;
    gap: 1.8rem;
    text-align: center;

    .footer-logo {
      .logo-img {
        height: 2.8rem;
      }

      .logo-text {
        font-size: 0.95rem;
      }
    }

    .footer-links {
      flex-wrap: wrap;
      justify-content: center;
      gap: 1.2rem;

      a {
        font-size: 0.5rem !important;
      }
    }

    .social-icons {
      justify-content: center;
      gap: 1rem;

      a {
        width: 38px;
        height: 38px;
        font-size: 0.55rem !important;
      }
    }
  }

  .copyright {
    font-size: 0.475rem !important;
  }

  // 移动端图片预览弹窗适配
  .fullscreen-modal {
    .fullscreen-content {
      max-width: 95%;

      .preview-image {
        max-height: 80vh;
      }

      // 缩放控制按钮
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

      .fullscreen-close {
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
</style>
