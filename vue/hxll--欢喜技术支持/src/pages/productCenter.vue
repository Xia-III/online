<template>
  <div class="product-center">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-back" @click="goBackToHome">
          &lt;
        </div>
        <div class="nav-logo">
          <img src="../../static/img/logo(1).png" alt="Logo" class="logo-img">
          <span class="logo-text">{{ $t('officialWebsite.siteName') }}</span>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <div id="home-anchor" style="position: relative; top: -60px;"></div>
    <section id="home" class="hero">
      <div class="hero-content">
        <h2 class="hero-title">{{ $t('productCenter.title') }}</h2>
        <p class="hero-subtitle">{{ $t('productCenter.subtitle') }}</p>

        <!-- 搜索框 -->
        <div class="search-box">
          <input
            type="text"
            class="search-input"
            v-model="searchKeyword"
            :placeholder="$t('productCenter.searchPlaceholder')"
            @keyup.enter="handleSearch"
          >
          <button class="search-btn" @click="handleSearch">
            <i class="icon-search"></i>{{ $t('productCenter.search') }}
          </button>
        </div>

        <!-- 分类下拉选择框 (自定义下拉) -->
        <div class="category-select-wrapper" v-click-outside="closeDropdown">
          <div class="category-select" @click="toggleDropdown">
            <span class="selected-text">{{ currentCategoryLabel }}</span>
            <div class="select-arrow">
              <i class="icon-arrow-down"></i>
            </div>
          </div>
          <div class="category-dropdown" v-show="dropdownOpen">
            <div class="dropdown-options">
              <div 
                class="dropdown-option" 
                :class="{ 'active': activeCategory === 'all' }"
                @click="selectCategory('all')"
              >
                {{ $t('productCenter.categories.all') }}
              </div>
              <div 
                class="dropdown-option" 
                :class="{ 'active': activeCategory === 'twist' }"
                @click="selectCategory('twist')"
              >
                {{ $t('productCenter.categories.twist') }}
              </div>
              <div 
                class="dropdown-option" 
                :class="{ 'active': activeCategory === 'doll' }"
                @click="selectCategory('doll')"
              >
                {{ $t('productCenter.categories.doll') }}
              </div>
              <div 
                class="dropdown-option" 
                :class="{ 'active': activeCategory === 'game' }"
                @click="selectCategory('game')"
              >
                {{ $t('productCenter.categories.game') }}
              </div>
              <div 
                class="dropdown-option" 
                :class="{ 'active': activeCategory === 'coin' }"
                @click="selectCategory('coin')"
              >
                {{ $t('productCenter.categories.coin') }}
              </div>
              <div 
                class="dropdown-option" 
                :class="{ 'active': activeCategory === 'candy' }"
                @click="selectCategory('candy')"
              >
                {{ $t('productCenter.categories.candy') }}
              </div>
              <div 
                class="dropdown-option" 
                :class="{ 'active': activeCategory === 'gift' }"
                @click="selectCategory('gift')"
              >
                {{ $t('productCenter.categories.gift') }}
              </div>
              <div 
                class="dropdown-option" 
                :class="{ 'active': activeCategory === 'blindBox' }"
                @click="selectCategory('blindBox')"
              >
                {{ $t('productCenter.categories.blindBox') }}
              </div>
              <div 
                class="dropdown-option" 
                :class="{ 'active': activeCategory === 'fish' }"
                @click="selectCategory('fish')"
              >
                {{ $t('productCenter.categories.fish') }}
              </div>
              <div 
                class="dropdown-option" 
                :class="{ 'active': activeCategory === 'clip' }"
                @click="selectCategory('clip')"
              >
                {{ $t('productCenter.categories.clip') }}
              </div>
              <div 
                class="dropdown-option" 
                :class="{ 'active': activeCategory === 'marble' }"
                @click="selectCategory('marble')"
              >
                {{ $t('productCenter.categories.marble') }}
              </div>
              <div 
                class="dropdown-option" 
                :class="{ 'active': activeCategory === 'island' }"
                @click="selectCategory('island')"
              >
                {{ $t('productCenter.categories.island') }}
              </div>
            </div>
          </div>
        </div>

        <!-- 产品网格 -->
        <div class="product-grid">
          <!-- 加载状态 -->
          <div class="loading-container" v-if="loading">
            <div class="loading-spinner"></div>
            <p>{{ $t('common.loading') }}</p>
          </div>
          <!-- 当没有产品时显示占位提示 -->
          <div class="product-card placeholder" v-else-if="paginatedProducts.length === 0">
            <div class="product-cover">
              <div class="product-placeholder">
                <i class="icon-box"></i>
                <span>{{ $t('productCenter.noProducts') }}</span>
              </div>
            </div>
          </div>
          <!-- 产品卡片 -->
          <div class="product-card" v-for="(item, index) in paginatedProducts" :key="item.id" @click="goToProductDetail(item)">
            <div class="product-cover">
              <!-- 暂无图片时显示占位图 -->
              <div class="product-image-placeholder" v-if="!item.imageUrl1 || imageErrors[index]">
                <i class="icon-image"></i>
                <span>{{ item.productName }}</span>
              </div>
              <img v-else :src="item.imageUrl1" :alt="item.productName" class="product-image" @error="handleImageError(index)">
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ item.productName }}</h3>
              <!-- <p class="product-desc">{{ item.material || '暂无描述' }}</p> -->
            </div>
          </div>
        </div>

        <!-- 分页器 -->
        <div class="pagination" v-if="totalPages > 1">
          <button class="pagination-btn" 
                  :class="{ 'disabled': currentPage === 1 }" 
                  @click="changePage(currentPage - 1)"
                  :disabled="currentPage === 1">
            &lt;
          </button>
          <button class="pagination-btn"
                  v-for="page in visiblePages"
                  :key="page"
                  :class="{ 'active': currentPage === page }"
                  @click="changePage(page)">
            {{ page }}
          </button>
          <button class="pagination-btn" 
                  :class="{ 'disabled': currentPage === totalPages }" 
                  @click="changePage(currentPage + 1)"
                  :disabled="currentPage === totalPages">
            &gt;
          </button>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <!-- <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <img src="../../static/img/logo(1).png" alt="Logo" class="logo-img">
            <span class="logo-text">{{ $t('officialWebsite.siteName') }}</span>
          </div>
          <div class="footer-links">
            <a href="#home-anchor" @click.prevent="scrollToAnchor('home')">{{ $t('productCenter.footer.home') }}</a>
          </div>
          <div class="social-icons">
            <a href="#"><i class="icon-wechat"></i></a>
            <a href="#"><i class="icon-qq"></i></a>
            <a href="#"><i class="icon-weibo"></i></a>
          </div>
        </div>
        <div class="copyright">
          <p>{{ $t('productCenter.footer.copyright') }}</p>
        </div>
      </div>
    </footer> -->
  </div>
</template>

<script>
import 'regenerator-runtime/runtime'
import  request1  from '@/utils/request1'

export default {
  name: 'ProductCenter',
  directives: {
    clickOutside: {
      bind: function (el, binding, vnode) {
        el.clickOutsideEvent = function (event) {
          if (!(el === event.target || el.contains(event.target))) {
            vnode.context[binding.expression](event)
          }
        }
        document.addEventListener('click', el.clickOutsideEvent)
      },
      unbind: function (el) {
        document.removeEventListener('click', el.clickOutsideEvent)
      }
    }
  },
  data() {
    return {
      activeCategory: 'all', // 当前选中的分类：'all', 'twist', 'doll', 'game', 'coin'
      searchKeyword: '', // 搜索关键词
      imageErrors: [], // 记录图片加载错误的状态
      currentPage: 1, // 当前页码
      pageSize: 6, // 每页显示的产品数量
      total: 0, // 总记录数
      products: [], // 从 API 获取的产品列表
      loading: false, // 加载状态
      dropdownOpen: false // 下拉框开关状态
    }
  },
  computed: {
    // 当前选中的分类标签
    currentCategoryLabel() {
      const labelMap = {
        'all': this.$t('productCenter.categories.all'),
        'twist': this.$t('productCenter.categories.twist'),
        'doll': this.$t('productCenter.categories.doll'),
        'game': this.$t('productCenter.categories.game'),
        'coin': this.$t('productCenter.categories.coin'),
        'candy': this.$t('productCenter.categories.candy'),
        'gift': this.$t('productCenter.categories.gift'),
        'blindBox': this.$t('productCenter.categories.blindBox'),
        'fish': this.$t('productCenter.categories.fish'),
        'clip': this.$t('productCenter.categories.clip'),
        'marble': this.$t('productCenter.categories.marble'),
        'island': this.$t('productCenter.categories.island')
      }
      return labelMap[this.activeCategory] || this.$t('productCenter.categories.all')
    },
    // 总页数
    totalPages() {
      return Math.ceil(this.total / this.pageSize) 
    },
    // 当前页的产品列表
    paginatedProducts() {
      return this.products.map(product => ({
        ...product,
        // 根据 deviceType 映射分类
        category: this.getCategoryFromDeviceType(product.deviceType)
      }))
    },
    // 可见的页码
    visiblePages() {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(this.totalPages, start + maxVisible - 1)

      // 调整起始页，确保始终显示 maxVisible 个页码（如果可能）
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  mounted() {
    this.fetchProducts()
  },
  activated() {
    // 路由缓存组件被激活时重新获取数据
    this.fetchProducts()
  },
  beforeDestroy() {},
  // Vue 3 兼容性
  beforeUnmount() {},
  methods: {
    // 设备类型映射到分类
    getCategoryFromDeviceType(deviceType) {
      const typeMap = {
        1: 'twist',   // 扭蛋机
        2: 'doll',    // 娃娃机
        3: 'game',    // 游戏机
        4: 'coin',    // 兑币机
        5: 'candy',   // 糖果机
        6: 'gift',    // 礼品机
        7: 'blindBox',// 盲盒机
        8: 'fish',    // 捞鱼机
        9: 'clip',    // 夹子机
        10: 'marble', // 弹珠机
        11: 'island'  // 中岛机
      }
      return typeMap[deviceType] || 'twist'
    },
    // 分类映射到设备类型
    getDeviceTypeFromCategory(category) {
      if (category === 'all') return 0  // 0 代表全部
      const typeMap = {
        'twist': 1,   // 扭蛋机
        'doll': 2,    // 娃娃机
        'game': 3,    // 游戏机 
        'coin': 4,    // 兑币机
        'candy': 5,   // 糖果机
        'gift': 6,    // 礼品机
        'blindBox': 7,// 盲盒机
        'fish': 8,    // 捞鱼机
        'clip': 9,    // 夹子机
        'marble': 10, // 弹珠机
        'island': 11  // 中岛机
      }
      return typeMap[category] || 0
    },
    // 切换下拉框开关
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen
    },
    // 关闭下拉框
    closeDropdown() {
      this.dropdownOpen = false
    },
    // 选择分类
    selectCategory(category) {
      this.activeCategory = category
      this.dropdownOpen = false
      this.handleCategoryChange()
    },
    // 处理分类变化
    handleCategoryChange() {
      this.currentPage = 1
      this.imageErrors = []
      this.fetchProducts()
    },
    // 从 API 获取产品数据
    async fetchProducts() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize,
          keyword: this.searchKeyword,
          deviceType: this.getDeviceTypeFromCategory(this.activeCategory)
        }
        const res = await request1.get('/api/Product/FindManageAllPage', { params: params })
        // axios 响应对象中，实际的业务数据在 res.data 中
        if (res.data.code === 0) {
          this.total = res.data.total
          this.products = res.data.data || []
        }
      } catch (error) {
        console.error('获取产品列表失败:', error)  
      } finally {
        this.loading = false
      }
    },
    goBackToHome() {
      // 跳转到官网首页
      this.$router.push('/');
    },
    scrollToAnchor(sectionId) {
      // 对于页面内的锚点跳转，直接跳转到对应的 anchor 元素
      const anchorElement = document.getElementById(sectionId + '-anchor');
      if (anchorElement) {
        // 计算需要滚动到的位置，考虑导航栏高度和锚点偏移
        const headerOffset = 70; // 导航栏高度
        const offsetAdjustment = 60; // home-anchor 使用 top: -60px
        const elementPosition = anchorElement.offsetTop;
        const offsetPosition = elementPosition - headerOffset + offsetAdjustment;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    },
    goToProductDetail(product) {
      // 跳转到产品详情页
      this.$router.push(`/productDetail/${product.id}`)
    },
    handleImageError(index) {
      // 图片加载失败时记录错误状态，显示占位图
      this.$set(this.imageErrors, index, true)
    },
    handleSearch() {
      // 搜索时重置图片错误状态和页码
      this.imageErrors = []
      this.currentPage = 1
      this.fetchProducts()
    },
    changePage(page) {
      // 切换页码
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.fetchProducts()
      // 滚动到产品列表顶部
      this.scrollToProductGrid()
    },
    scrollToProductGrid() {
      // 滚动到产品网格区域
      const productGrid = document.querySelector('.product-grid')
      if (productGrid) {
        const headerOffset = 70
        const elementPosition = productGrid.offsetTop
        const offsetPosition = elementPosition - headerOffset
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }
  },
  watch: {
    // 监听搜索关键词变化
    searchKeyword() {
      this.currentPage = 1
      this.fetchProducts()
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

.product-center {
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
          margin-right: 0.1rem; 
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

  .hero {
    min-height: 50vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: $text-color;
    position: relative;
    overflow: visible;
    padding: 1rem 0 3rem;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba($primary-color, 0.1) 0%, transparent 70%);
      z-index: 0;
      overflow: hidden;
    }

    .hero-content {
      max-width: 1200px;
      padding: 0 2rem;
      position: relative;
      z-index: 1;
      width: 100%;

      .hero-title {
        font-size: 2.2rem;
        margin-bottom: 0.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, $primary-color, $secondary-color);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: fadeInUp 1s ease;
      }

      .hero-subtitle {
        font-size: 1rem;
        margin-bottom: 1.5rem;
        color: $text-light;
        line-height: 1.2;
        animation: fadeInUp 1s ease 0.2s both;
      }

      // 搜索框样式
      .search-box {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
        position: relative;
        z-index: 10;

        .search-input {
          flex: 1;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.3s ease;
          position: relative;
          z-index: 1;

          &:focus {
            border-color: $primary-color;
            z-index: 2;
          }

          &::placeholder {
            color: #999;
          }
        }

        .search-btn {
          padding: 0.5rem 1.2rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: $white;
          background: linear-gradient(135deg, $primary-color, $secondary-color);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0rem;
          white-space: nowrap;
          position: relative;
          z-index: 1;
          user-select: none;
          -webkit-tap-highlight-color: transparent;

          &:hover {
            opacity: 0.9;
            transform: translateY(-2px);
            z-index: 2;
          }

          i {
            font-style: normal;
          }
        }
      }

      // 分类下拉选择框样式
      .category-select-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 2rem;
        position: relative;
        z-index: 10;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;

        .category-select {
          width: 100%;
          padding: 0.5rem 2.5rem 0.5rem 1rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: $text-color;
          background: $white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          outline: none;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;

          &:hover {
            border-color: $primary-color;
          }

          &.open {
            border-color: $primary-color;
            box-shadow: 0 0 0 3px rgba($primary-color, 0.1);
          }

          .selected-text {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .select-arrow {
            margin-left: 0.5rem;
            pointer-events: none;
            display: flex;
            align-items: center;

            i {
              font-style: normal;
              font-size: 0.75rem;
              color: $text-light;
              transition: transform 0.3s ease;
            }
          }
        }

        // 下拉面板样式
        .category-dropdown {
          position: absolute;
          top: calc(100% + 0.3rem);
          left: 0;
          right: 0;
          background: $white;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          z-index: 100;
          border: 2px solid $primary-color;

          .dropdown-options {
            max-height: 500px; // 限制高度，约显示 5 个选项
            overflow-y: auto;
            overflow-x: hidden;

            // 自定义滚动条样式
            &::-webkit-scrollbar {
              width: 6px;
            }

            &::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 3px;
            }

            &::-webkit-scrollbar-thumb {
              background: #c1c1c1;
              border-radius: 3px;

              &:hover {
                background: #a8a8a8;
              }
            }

            &::-webkit-scrollbar-thumb:hover {
              background: #a8a8a8;
            }
          }

          .dropdown-option {
            padding: 0.4rem 0.8rem;
            font-size: 0.85rem;
            color: $text-color;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            &:hover {
              background: rgba($primary-color, 0.08);
              color: $primary-color;
            }

            &.active {
              background: linear-gradient(135deg, rgba($primary-color, 0.15), rgba($secondary-color, 0.15));
              color: $primary-color;
              font-weight: 600;
            }

            &:not(:last-child) {
              border-bottom: 1px solid #f5f5f5;
            }
          }
        }
      }

      // 产品网格样式
      .product-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.2rem;
        margin-top: 1.5rem;
        justify-content: center;
        max-width: 900px;
        margin-left: auto;
        margin-right: auto;

        .product-card {
          background: $white;
          border-radius: $border-radius;
          overflow: hidden;
          box-shadow: $shadow;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;

          &:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
          }

          .product-cover {
            width: 100%;
            height: 180px;
            background: linear-gradient(135deg, rgba($primary-color, 0.08), rgba($secondary-color, 0.08));
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            flex-shrink: 0;

            .product-image {
              width: 100%;
              height: 100%;
              object-fit: contain;
              transition: transform 0.3s ease;
            }

            .product-image-placeholder {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 0.8rem;
              text-align: center;

              i {
                font-size: 2rem;
                margin-bottom: 0.4rem;
                opacity: 0.4;
                color: $primary-color;
              }

              span {
                font-size: 0.75rem;
                line-height: 1.3;
                color: $text-light;
                max-width: 100%;
                word-break: break-word;
              }
            }
          }

          .product-info {
            padding: 0.7rem 0.8rem;
            background: $white;
            border-top: 1px solid #f5f5f5;
            flex-shrink: 0;

            .product-name {
              font-size: 0.85rem;
              color: $text-color;
              font-weight: 500;
              margin: 0;
              text-align: center;
              line-height: 1.35;
              max-height: 2.4rem;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              word-break: break-word;
            }

            .product-desc {
              font-size: 0.75rem;
              color: $text-light;
              margin: 0.3rem 0 0 0;
              text-align: center;
              line-height: 1.3;
              max-height: 2rem;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              word-break: break-word;
            }
          }

          &.placeholder {
            border: 2px dashed #ddd;
            box-shadow: none;
            background: #fafafa;

            &:hover {
              transform: none;
              box-shadow: none;
            }

            .product-placeholder {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 180px;
              color: #999;

              i {
                font-size: 2.5rem;
                margin-bottom: 0.5rem;
                opacity: 0.5;
              }

              span {
                font-size: 0.8rem;
              }
            }
          }
        }
      }

      // 分页器样式
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        margin-top: 2rem;
        padding: 1rem 0;
        position: relative;
        z-index: 100;

        .pagination-btn {
          min-width: 2.2rem;
          height: 2.2rem;
          padding: 0 0.6rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: $text-color;
          background: $white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 100;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          user-select: none;

          &:hover:not(.disabled) {
            border-color: $primary-color;
            color: $primary-color;
          }

          &.active {
            background: linear-gradient(135deg, $primary-color, $secondary-color);
            color: $white;
            border-color: transparent;
            box-shadow: 0 4px 15px rgba($primary-color, 0.3);
          }

          &.disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }

      // 加载状态样式
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 0;
        grid-column: 1 / -1;

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid $primary-color;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        p {
          color: $text-light;
          font-size: 0.9rem;
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

// 动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

// 移动端适配
@media (max-width: 768px) {
  .product-center {
    overflow-x: visible !important;
  }

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

  .hero {
    height: auto !important;
    min-height: unset !important;
    padding: 0.75rem 0 !important;
    display: block !important;
    align-items: unset !important;
    justify-content: unset !important;
    overflow: visible !important;
    margin: 0 !important;
    position: static !important;

    .hero-content {
      position: static !important;
      z-index: auto !important;
      width: 100% !important;
      max-width: 100% !important;
      padding: 0 0.3rem !important;
      box-sizing: border-box !important;
      margin-left: 0 !important;
      margin-right: 0 !important;

      .hero-title {
        font-size: 1.1rem !important;
        line-height: 1.3;
        margin-bottom: 0.3rem !important;
      }

      .hero-subtitle {
        font-size: 0.55rem !important;
        line-height: 1.4;
        margin-bottom: 0.5rem !important;
      }

      // 移动端搜索框样式
      .search-box {
        gap: 0.2rem !important;
        margin-bottom: 0.3rem !important;
        max-width: 100% !important;
        padding: 0 0.2rem !important;
        position: relative !important;
        z-index: 10 !important;

        .search-input {
          padding: 0.25rem 0.3rem !important;
          font-size: 0.45rem !important;
          position: relative !important;
          z-index: 1 !important;
        }

        .search-btn {
          padding: 0.25rem 0.3rem !important;
          font-size: 0.45rem !important;
          white-space: nowrap !important;
          position: relative !important;
          z-index: 1 !important;
          user-select: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
      }

      .category-select-wrapper {
        margin-bottom: 0.5rem !important;

        .category-select {
          max-width: 100% !important;
          width: 100% !important;
          padding: 0.4rem 0.6rem 0.4rem 0.6rem !important;
          font-size: 0.55rem !important;
          border-radius: 6px;

          .selected-text {
            font-size: 0.55rem !important;
          }

          .select-arrow {
            i {
              font-size: 0.5rem !important;
            }
          }
        }

        // 移动端下拉面板样式
        .category-dropdown {
          max-width: 100% !important;
          left: 0 !important;
          transform: none !important;
          top: calc(100% + 0.2rem) !important;

          .dropdown-options {
            max-height: 320px !important; // 移动端限制高度，约显示 5-6 个选项

            &::-webkit-scrollbar {
              width: 4px;
            }
          }

          .dropdown-option {
            padding: 0.3rem 0.3rem !important;
            font-size: 0.75rem !important;
          }
        }
      }

      .product-grid {
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 0.4rem !important;
        margin-top: 0.2rem !important; 
        margin-left: 0 !important; 
        margin-right: 0 !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;

        .product-card {
          background: $white;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          min-width: 0 !important;
          aspect-ratio: 3 / 4;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
          }

          .product-cover {
            width: 100%;
            height: 90px;
            background: linear-gradient(135deg, rgba($primary-color, 0.08), rgba($secondary-color, 0.08));
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            flex-shrink: 0;
            position: relative;

            .product-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s ease;
            }

            .product-image-placeholder {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 0.3rem;
              text-align: center;

              i {
                font-size: 1.3rem;
                margin-bottom: 0.15rem;
                opacity: 0.4;
                color: $primary-color;
              }

              span {
                font-size: 0.6rem;
                line-height: 1.2;
                color: $text-light;
                max-width: 100%;
                word-break: break-word;
              }
            }
          }

          .product-info {
            padding: 0.4rem 0.5rem !important;
            background: $white;
            border-top: 1px solid #f5f5f5;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            .product-name {
              font-size: 0.35rem !important;
              color: $text-color;
              font-weight: 500;
              margin: 0;
              text-align: center;
              line-height: 1.25;
              max-height: 2rem;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              word-break: break-word;
            }

            .product-desc {
              font-size: 0.55rem !important;
              color: $text-light;
              margin: 0.2rem 0 0 0;
              text-align: center;
              line-height: 1.2;
              max-height: 1.5rem;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              word-break: break-word;
            }
          }

          &.placeholder {
            border: 1px dashed #ddd;
            box-shadow: none;
            background: #fafafa;

            &:hover {
              transform: none;
              box-shadow: none;
            }

            .product-placeholder {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 90px;
              color: #999;

              i {
                font-size: 1.5rem;
                margin-bottom: 0.3rem;
                opacity: 0.5;
              }

              span {
                font-size: 0.6rem;
              }
            }
          }
        }
      }

      // 移动端分页器样式
      .pagination {
        margin-top: 1rem !important;
        padding: 0.5rem 0 !important;
        gap: 0.3rem !important;
        position: relative !important;
        z-index: 100 !important;

        .pagination-btn {
          min-width: 1rem !important;
          height: 1.1rem !important;
          padding: 0 0.25rem !important;
          font-size: 0.4rem !important;
          position: relative !important;
          z-index: 100 !important;
          touch-action: manipulation !important;
          -webkit-tap-highlight-color: transparent !important;
          user-select: none !important;
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
}
</style>
