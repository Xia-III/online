<template>
  <div class="official-website">
    <!-- 移动端遮罩层，覆盖整个屏幕 -->
    <div v-if="isMobileMenuOpen" class="mobile-nav-overlay" @click="closeMobileMenu"></div>

    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <img src="../../static/img/logo(1).png" alt="Logo" class="logo-img">
          <span class="logo-text">{{ $t('officialWebsite.siteName') }}</span>
        </div>
        <!-- 移动端快捷导航栏 (仅在移动设备上显示) -->
        <div class="mobile-quick-nav">
          <a href="#home" class="quick-nav-item" @click.prevent="goToSection('home')">
            <i class="icon-home"></i>
            <span>{{ $t('nav.home') }}</span>
          </a>
          <a href="/allCourses" class="quick-nav-item" @click.prevent="goToPage('/allCourses')">
            <i class="icon-tutorial"></i>
            <span>{{ $t('nav.tutorials') }}</span>
          </a>
          <a href="/resourceDownload" class="quick-nav-item" @click.prevent="goToPage('/resourceDownload')">
            <i class="icon-download"></i>
            <span>{{ $t('nav.resources') }}</span>
          </a>
          <a href="javascript:void(0)" class="quick-nav-item" @click.prevent="switchLanguage($i18n.locale === 'zh' ? 'en' : 'zh')">
            <i class="icon-language"></i>
            <span>{{ $i18n.locale === 'zh' ? 'EN' : '中文' }}</span>
          </a>
          <div class="quick-nav-item more-menu-item" @click="toggleMoreMenu">
            <i class="icon-more"></i>
            <span>{{ $t('nav.more') }}</span>
          </div>
        </div>
        <!-- 移动端更多菜单弹出层 -->
        <div class="mobile-more-menu" :class="{ 'show': isMoreMenuOpen }" @click="closeMoreMenu">
          <div class="more-menu-content" @click.stop>
            <a href="#stores" class="more-menu-link" @click.prevent="goToSection('stores'); closeMoreMenu()">
              <i class="icon-store"></i>
              <span>{{ $t('nav.stores') }}</span>
            </a>
            <a href="#certificates" class="more-menu-link" @click.prevent="goToSection('certificates'); closeMoreMenu()">
              <i class="icon-certificate"></i>
              <span>{{ $t('nav.certificates') }}</span>
            </a>
            <a href="/productCenter" class="more-menu-link" @click.prevent="goToPage('/productCenter'); closeMoreMenu()">
              <i class="icon-product"></i>
              <span>{{ $t('nav.productCenter') }}</span>
            </a>
            <a href="/messageBoard" class="more-menu-link" @click.prevent="goToPage('/messageBoard'); closeMoreMenu()">
              <i class="icon-message"></i>
              <span>{{ $t('nav.messageBoard') }}</span>
            </a>
            <a href="/screenLightSetting" class="more-menu-link" @click.prevent="goToPage('/screenLightSetting'); closeMoreMenu()">
              <i class="icon-light"></i>
              <span>{{ $t('nav.lightingPK') }}</span>
            </a>
            <a href="#about" class="more-menu-link" @click.prevent="goToSection('about'); closeMoreMenu()">
              <i class="icon-about"></i>
              <span>{{ $t('nav.aboutUs') }}</span>
            </a>
          </div>
        </div>
        <!-- 移动端侧边导航菜单 -->
        <div class="mobile-nav-menu" :class="{ 'open': isMobileMenuOpen }">
          <a href="#home" class="nav-link" @click="closeMobileMenu" @click.prevent="goToSection('home')">{{ $t('nav.home') }}</a>
          <a href="#stores" class="nav-link" @click="closeMobileMenu" @click.prevent="goToSection('stores')">{{ $t('nav.stores') }}</a>
          <a href="#certificates" class="nav-link" @click="closeMobileMenu" @click.prevent="goToSection('certificates')">{{ $t('nav.certificates') }}</a>
          <a href="/productCenter" class="nav-link" @click="closeMobileMenu" @click.prevent="goToPage('/productCenter')">{{ $t('nav.productCenter') }}</a>
          <a href="/allCourses" class="nav-link" @click="closeMobileMenu" @click.prevent="goToPage('/allCourses')">{{ $t('nav.tutorials') }}</a>
          <a href="/resourceDownload" class="nav-link" @click="closeMobileMenu" @click.prevent="goToPage('/resourceDownload')">{{ $t('nav.resources') }}</a>
          <a href="/messageBoard" class="nav-link" @click="closeMobileMenu" @click.prevent="goToPage('/messageBoard')">{{ $t('nav.messageBoard') }}</a>
          <a href="/screenLightSetting" class="nav-link" @click="closeMobileMenu" @click.prevent="goToPage('/screenLightSetting')">{{ $t('nav.lightingPK') }}</a>
          <a href="#about" class="nav-link" @click="closeMobileMenu" @click.prevent="goToSection('about')">{{ $t('nav.aboutUs') }}</a>
          <a href="javascript:void(0)" class="nav-link" @click="closeMobileMenu" @click.prevent="switchLanguage($i18n.locale === 'zh' ? 'en' : 'zh')">{{ $i18n.locale === 'zh' ? $t('nav.switchToEnglish') : $t('nav.switchToChinese') }}</a>
        </div>
        <!-- 桌面端导航菜单 -->
        <div class="nav-menu">
          <a href="#home" class="nav-link" @click.prevent="goToSection('home')">{{ $t('nav.home') }}</a>
          <a href="#stores" class="nav-link" @click.prevent="goToSection('stores')">{{ $t('nav.stores') }}</a>
          <a href="#certificates" class="nav-link" @click.prevent="goToSection('certificates')">{{ $t('nav.certificates') }}</a>
          <a href="/productCenter" class="nav-link" @click.prevent="goToPage('/productCenter')">{{ $t('nav.productCenter') }}</a>
          <a href="/allCourses" class="nav-link" @click.prevent="goToPage('/allCourses')">{{ $t('nav.tutorials') }}</a>
          <a href="/resourceDownload" class="nav-link" @click.prevent="goToPage('/resourceDownload')">{{ $t('nav.resources') }}</a>
          <a href="/messageBoard" class="nav-link" @click.prevent="goToPage('/messageBoard')">{{ $t('nav.messageBoard') }}</a>
          <a href="/screenLightSetting" class="nav-link" @click.prevent="goToPage('/screenLightSetting')">{{ $t('nav.lightingPK') }}</a>
          <a href="#about" class="nav-link" @click.prevent="goToSection('about')">{{ $t('nav.aboutUs') }}</a>
          <a href="javascript:void(0)" class="nav-link" @click.prevent="switchLanguage($i18n.locale === 'zh' ? 'en' : 'zh')">{{ $i18n.locale === 'zh' ? $t('nav.switchToEnglish') : $t('nav.switchToChinese') }}</a>
        </div>
      </div>
    </nav>

    <!-- Hero Section - 公司介绍 -->
    <div id="home-anchor" style="position: relative; top: -60px;"></div> <!-- 调整顶部偏移以适应新布局 -->
    <section id="home" class="hero">
      <div class="hero-content">
        <h2 class="hero-title">{{ $t('officialWebsite.companyIntro.title') }}</h2>
        <p class="hero-subtitle">{{ $t('officialWebsite.companyIntro.subtitle') }}</p>

        <!-- 公司介绍内容区域 - 5 段文章 + 视频 -->
        <div class="company-intro">
          <!-- 视频位置 1（在第 1 段之前） -->
          <div class="company-video-block">
            <div class="company-video-wrapper">
              <video
                class="company-video"
                controls
                preload="metadata"
                playsinline
                webkit-playsinline>
                <source src="https://www.huanxizn.com/portal/video/58c912d7a9bfd7a4e49b71062e55b6ee.mp4" type="video/mp4">
                您的浏览器不支持视频播放 
              </video>
            </div>
          </div>

          <!-- 第 1 段文章 -->
          <div class="company-text-block">
            <div class="company-text" v-if="companyContent.part1">{{ companyContent.part1 }}</div>
            <div class="company-text-placeholder" v-else>
              <i class="icon-document"></i>
              <span>{{ $t('common.noContent') }}</span>
            </div>
          </div>

          <!-- 更多内容（第 2、3、5 段文章） -->
          <transition name="expand">
            <div class="company-more-content" v-show="showMore">
              <!-- 第 2 段文章 -->
              <div class="company-text-block">
                <div class="company-text" v-if="companyContent.part2">{{ companyContent.part2 }}</div>
                <div class="company-text-placeholder" v-else>
                  <i class="icon-document"></i>
                  <span>{{ $t('common.noContent') }}</span>
                </div>
              </div>

              <!-- 第 3 段文章 -->
              <div class="company-text-block">
                <div class="company-text" v-if="companyContent.part3">{{ companyContent.part3 }}</div>
                <div class="company-text-placeholder" v-else>
                  <i class="icon-document"></i>
                  <span>{{ $t('common.noContent') }}</span>
                </div>
              </div>

              <!-- 第 5 段文章 -->
              <div class="company-text-block">
                <div class="company-text" v-if="companyContent.part5">{{ companyContent.part5 }}</div>
                <div class="company-text-placeholder" v-else>
                  <i class="icon-document"></i>
                  <span>{{ $t('common.noContent') }}</span>
                </div>
              </div>
            </div>
          </transition>

          <!-- 更多/收起按钮 -->
          <div class="company-more-btn" v-if="companyContent.part2 || companyContent.part3 || companyContent.part5">
            <button class="more-btn" @click="toggleMore">
              <span>{{ showMore ? $t('officialWebsite.companyIntro.collapse') : $t('officialWebsite.companyIntro.more') }}</span>
            </button>
          </div> 
        </div>
      </div>
    </section>

    <!-- 门店展示 -->
    <div id="stores-anchor" style="position: relative; top: -80px;"></div>
    <section id="stores" class="stores">
      <div class="container">
        <h2 class="section-title">{{ $t('officialWebsite.stores.title') }}</h2>
        <p class="section-subtitle">{{ $t('officialWebsite.stores.subtitle') }}</p>

        <!-- 门店轮播容器 -->
        <div class="store-carousel" v-if="currentStore">
          <!-- 门店地址 -->
          <div class="store-address">
            <i class="icon-location"></i>
            <span>{{ currentStore.address }}</span>
          </div>

          <!-- 门店文件网格 (支持图片和视频) -->
          <div class="store-image-grid" :class="['files-' + Math.min(currentStore.files.length, 3)]">
            <div class="store-item-card" v-for="(file, index) in currentStore.files" :key="'store-file-' + index" @click="goToStoreDetail(currentStore.id)">
              <!-- 视频类型 -->
              <div class="store-media-wrapper" v-if="file.type === 'video'">
                <video
                  class="store-video"
                  preload="metadata"
                  playsinline
                  webkit-playsinline
                  muted>
                  <source :src="file.url" type="video/mp4">
                  您的浏览器不支持视频播放
                </video>
              </div>
              <!-- 图片类型 -->
              <div class="store-image-wrapper" v-else>
                <img :src="file.url" :alt="'门店图片 ' + (index + 1)" class="store-image">
              </div>
            </div>
          </div>

          <!-- 轮播控制按钮 (多于 1 个门店时显示) -->
          <div class="store-carousel-controls" v-if="stores.length > 1">
            <button class="carousel-btn prev-btn" @click="prevStoreManual">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <div class="carousel-indicators">
              <span
                v-for="index in visibleIndicatorIndices"
                :key="'store-dot-' + index"
                class="indicator"
                :class="{ 'active': index === currentStoreIndex }"
                @click="goToStoreManual(index)"
              >{{ index + 1 }}</span>
            </div>
            <button class="carousel-btn next-btn" @click="nextStoreManual">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 无门店数据提示 -->
        <div class="store-empty" v-else>
          <i class="icon-store"></i>
          <span>暂无门店数据</span>
        </div>
      </div>
    </section>

    <!-- 证书 -->
    <div id="certificates-anchor" style="position: relative; top: -80px;"></div> <!-- 调整顶部偏移以保持一致性 -->
    <section id="certificates" class="certificates">
      <div class="container">
        <h2 class="section-title">{{ $t('officialWebsite.certificates.title') }}</h2>
        <p class="section-subtitle">{{ $t('officialWebsite.certificates.subtitle') }}</p>

        <!-- 证书类型切换 Tab -->
        <div class="certificate-tabs">
          <div class="certificate-tab"
               :class="{ 'active': activeTab === 'ce' }"
               @click="switchTab('ce')">
            {{ $t('officialWebsite.certificates.ceCertificate') }}
          </div>
          <div class="certificate-tab"
               :class="{ 'active': activeTab === 'patent' }"
               @click="switchTab('patent')">
            {{ $t('officialWebsite.certificates.patentCertificate') }}
          </div>
        </div>

        <!-- 证书内容区域 -->
        <div class="certificate-content">
          <!-- CE 证书 -->
          <div class="certificate-grid" v-show="activeTab === 'ce'">
            <div class="certificate-card" v-for="(ce, index) in currentCeCertificates" :key="'ce-' + index">
              <div class="certificate-image-wrapper" @click="viewCertificateImage(ce.image)">
                <img :src="ce.image" :alt="ce.alt" class="certificate-image">
                <div class="image-zoom-hint">
                  <i class="icon-zoom-in"></i>
                  <span>{{ $t('officialWebsite.certificates.viewLargeImage') }}</span>
                </div>
              </div>
              <!-- <p class="certificate-name">{{ ce.name }}</p> -->
            </div>
            <!-- 占位卡片 - 没有证书时显示 -->
            <div class="certificate-card placeholder" v-if="ceCertificates.length === 0">
              <div class="certificate-image-wrapper">
                <div class="certificate-placeholder">
                  <i class="icon-image"></i>
                  <span>{{ $t('officialWebsite.certificates.noCeCertificate') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 专利证书 -->
          <div class="certificate-grid" v-show="activeTab === 'patent'">
            <div class="certificate-card" v-for="(patent, index) in currentPatentCertificates" :key="'patent-' + index">
              <div class="certificate-image-wrapper" @click="viewCertificateImage(patent.image)">
                <img :src="patent.image" :alt="patent.alt" class="certificate-image">
                <div class="image-zoom-hint">
                  <i class="icon-zoom-in"></i>
                  <span>{{ $t('officialWebsite.certificates.viewLargeImage') }}</span>
                </div>
              </div>
              <!-- <p class="certificate-name">{{ patent.name }}</p> -->
            </div>
            <!-- 占位卡片 - 没有证书时显示 -->
            <div class="certificate-card placeholder" v-if="patentCertificates.length === 0">
              <div class="certificate-image-wrapper">
                <div class="certificate-placeholder">
                  <i class="icon-image"></i>
                  <span>{{ $t('officialWebsite.certificates.noPatentCertificate') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 轮播控制按钮 -->
        <div class="certificate-carousel-controls" v-if="(activeTab === 'ce' && totalCePages > 1) || (activeTab === 'patent' && totalPatentPages > 1)">
          <button class="carousel-btn prev-btn" @click="prevGroupManual">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          <div class="carousel-indicators">
            <span
              v-for="index in (activeTab === 'ce' ? totalCePages : totalPatentPages)"
              :key="index"
              class="indicator"
              :class="{ 'active': index - 1 === currentGroupIndex }"
              @click="goToGroupManual(index - 1)"
            ></span>
          </div>
          <button class="carousel-btn next-btn" @click="nextGroupManual">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>

        <!-- 全屏查看图片弹窗 -->
        <div class="image-preview-overlay" v-if="isImagePreviewOpen" @click="closeImagePreview" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd" @wheel="handleWheel">
          <div class="image-preview-content" @click.stop @dblclick="handleDoubleClick">
            <img :src="previewImageSrc" alt="证书大图" class="preview-image" 
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
    </section>


    <!-- 关于我们 -->
    <div id="about-anchor" style="position: relative; top: -80px;"></div> <!-- 调整顶部偏移以保持一致性 -->
    <section id="about" class="about">
      <div class="container">
          <h2 class="section-title">{{ $t('officialWebsite.about.title') }}</h2>
          <p class="section-subtitle">{{ $t('officialWebsite.about.subtitle') }}</p>
        <div class="about-content">
          <div class="about-text">
            <h3>{{ $t('officialWebsite.about.whyChooseUs') }}</h3>
            <p>{{ $t('officialWebsite.about.description1') }}</p>
            <p>{{ $t('officialWebsite.about.description2') }}</p>
            <ul>
              <li>{{ $t('officialWebsite.about.features.experience') }}</li>
              <li>{{ $t('officialWebsite.about.features.team') }}</li>
              <li>{{ $t('officialWebsite.about.features.service') }}</li>
              <li>{{ $t('officialWebsite.about.features.update') }}</li>
            </ul>
          </div>
          <!-- <div class="about-image">
            <img src="../../static/img/logo(1).png" alt="About Us">
          </div> -->
        </div>
        <!-- 复制的联系内容 -->
        <div class="contact-content">
          <div class="contact-info">
              <div class="contact-row">
                <div class="contact-item">
                  <i class="icon-phone"></i>
                  <div class="contact-text">
                    <h4>{{ $t('officialWebsite.contact.phoneTitle') }}</h4>
                    <span>{{ $t('officialWebsite.contact.phone') }}</span>
                  </div>
                </div>
                <div class="contact-item">
                  <i class="icon-email"></i>
                  <div class="contact-text">
                    <h4>{{ $t('officialWebsite.contact.emailTitle') }}</h4> 
                    <span>{{ $t('officialWebsite.contact.email') }}</span>
                  </div>
                </div>
              </div>
            <div class="contact-item address-item">
              <i class="icon-location"></i>
              <div class="contact-text">
                <h4>{{ $t('officialWebsite.contact.addressTitle') }}</h4>
                <span>{{ $t('officialWebsite.contact.address') }}</span>
              </div>
            </div>
          </div>
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
            <a href="#home" @click.prevent="goToSection('home')">{{ $t('nav.home') }}</a>
            <a href="#certificates" @click.prevent="goToSection('certificates')">{{ $t('nav.certificates') }}</a>
            <a href="#about" @click.prevent="goToSection('about')">{{ $t('nav.aboutUs') }}</a>
            <a href="#contact" @click.prevent="goToSection('contact')">{{ $t('nav.contactUs') }}</a> 
          </div>
          <div class="social-icons">
            <a href="#"><i class="icon-wechat"></i></a>
            <a href="#"><i class="icon-qq"></i></a>
            <a href="#"><i class="icon-weibo"></i></a>
          </div>
        </div>
        <div class="copyright">
          <p>{{ $t('officialWebsite.footer.copyright') }}</p>
        </div>
      </div>
    </footer> -->
  </div>
</template>

<script>
export default {
  name: 'OfficialWebsite',
  data() {
    return {
      formData: {
        name: '',
        email: '',
        message: ''
      },
      isMobileMenuOpen: false, // 控制移动端菜单开关
      isMoreMenuOpen: false, // 控制移动端更多菜单开关
      scrollPosition: 0, // 存储滚动位置（用于移动端菜单）
      previewScrollPosition: 0, // 存储滚动位置（用于图片预览）
      activeTab: 'ce', // 证书 Tab 切换：'ce' 或 'patent'
      isImagePreviewOpen: false, // 控制图片预览弹窗开关
      previewImageSrc: '', // 预览图片的 URL
      showMore: false, // 控制公司介绍更多内容显示/隐藏
      // 图片缩放相关
      imageScale: 1, // 图片缩放比例
      imageTranslateX: 0, // 图片 X 轴平移距离
      imageTranslateY: 0, // 图片 Y 轴平移距离
      isPinching: false, // 是否正在双指缩放
      initialPinchDistance: 0, // 初始双指距离
      initialScale: 1, // 初始缩放比例
      lastTouchX: 0, // 上次触摸 X 坐标
      lastTouchY: 0, // 上次触摸 Y 坐标
      isDragging: false, // 是否正在拖拽
      maxScale: 5, // 最大缩放比例
      minScale: 1, // 最小缩放比例
      companyImages: {
        image1: 'https://www.huanxizn.com/portal/static/img/logo(1).png', // 图片 1（位于第 1 段之前）
        image2: ''  // 图片 2（位于第 2、3 段之间）
      },
      // 门店轮播相关
      currentStoreIndex: 0,
      storeAutoPlayTimer: null,
      // CE 证书列表 - 添加证书时在此处配置
      ceCertificates: [
        {
          image: 'https://static.huanxizn.com/customerService/CE-0.webp',
          alt: 'CE 证书 1',
          name: 'CE 认证证书 - 产品 A'
        },
        {
          image: 'https://static.huanxizn.com/customerService/CE-1.webp',
          alt: 'CE 证书 2',
          name: 'CE 认证证书 - 产品 B'
        },
        {
          image: 'https://static.huanxizn.com/customerService/CE-2.webp',
          alt: 'CE 证书 3',
          name: 'CE 认证证书 - 产品 C'
        },
        {
          image: 'https://static.huanxizn.com/customerService/CE-3.webp',
          alt: 'CE 证书 4',
          name: 'CE 认证证书 - 产品 D'
        }
      ],
      // 专利证书列表 - 添加证书时在此处配置
      patentCertificates: [
        {
          image: 'https://static.huanxizn.com/customerService/image_001.webp',
          alt: '专利证书 1',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_002.webp',
          alt: '专利证书 2',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_003.webp',
          alt: '专利证书 3',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_004.webp',
          alt: '专利证书 4',
        },
                {
          image: 'https://static.huanxizn.com/customerService/image_005.webp',
          alt: '专利证书 5',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_006.webp',
          alt: '专利证书 6',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_007.webp',
          alt: '专利证书 7',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_008.webp',
          alt: '专利证书 8',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_009.webp',
          alt: '专利证书 9',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_010.webp',
          alt: '专利证书 10',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_011.webp',
          alt: '专利证书 11',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_012.webp',
          alt: '专利证书 12',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_013.webp',
          alt: '专利证书 13',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_014.webp',
          alt: '专利证书 14',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_015.webp',
          alt: '专利证书 15',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_016.webp',
          alt: '专利证书 16',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_017.webp',
          alt: '专利证书 17',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_018.webp',
          alt: '专利证书 18',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_019.webp',
          alt: '专利证书 19',
        },
        {
          image: 'https://static.huanxizn.com/customerService/image_020.webp',
          alt: '专利证书 20',
        }
      ],
      // 证书轮播相关
      currentGroupIndex: 0, // 当前展示的证书组索引
      certificatesPerPage: 4, // 每页展示的证书数量
      autoPlayTimer: null, // 自动轮播定时器
      resumeAutoPlayTimer: null // 延时恢复自动轮播的定时器
    }
  },
  computed: {
    // 从 i18n 获取门店数据
    stores() {
      return this.$t('officialWebsite.stores.list') || []
    },
    // 公司介绍内容 - 使用 i18n
    companyContent() {
      return {
        part1: this.$t('officialWebsite.companyIntro.part1'),
        part2: this.$t('officialWebsite.companyIntro.part2'),
        part3: this.$t('officialWebsite.companyIntro.part3'),
        part5: this.$t('officialWebsite.companyIntro.part5')
      }
    },
    // 当前页展示的 CE 证书列表
    currentCeCertificates() {
      const start = this.currentGroupIndex * this.certificatesPerPage
      const end = start + this.certificatesPerPage
      return this.ceCertificates.slice(start, end)
    },
    // 当前页展示的专利证书列表
    currentPatentCertificates() {
      const start = this.currentGroupIndex * this.certificatesPerPage
      const end = start + this.certificatesPerPage
      return this.patentCertificates.slice(start, end)
    },
    // 总页数 - CE 证书
    totalCePages() {
      return Math.ceil(this.ceCertificates.length / this.certificatesPerPage)
    },
    // 总页数 - 专利证书
    totalPatentPages() {
      return Math.ceil(this.patentCertificates.length / this.certificatesPerPage)
    },
    // 当前展示的门店
    currentStore() {
      if (this.stores.length === 0) return null
      return this.stores[this.currentStoreIndex]
    },
    // 可见的指示器索引（一次最多显示 5 个）
    visibleIndicatorIndices() {
      const maxVisible = 5
      const total = this.stores.length
      if (total <= maxVisible) {
        return Array.from({ length: total }, (_, i) => i)
      }
      // 计算起始索引，确保当前选中的在中间
      let start = this.currentStoreIndex - Math.floor(maxVisible / 2)
      // 确保不超出边界
      start = Math.max(0, Math.min(start, total - maxVisible))
      return Array.from({ length: maxVisible }, (_, i) => start + i)
    }
  },
  mounted() {
    // 添加点击事件监听器到body，用于关闭移动端菜单
    document.body.addEventListener('click', this.handleOutsideClick);

    // 添加滚动监听器，当菜单打开时更新滚动位置
    window.addEventListener('scroll', this.updateScrollPosition);

    // 启动证书自动轮播
    this.startAutoPlay();
    
    // 启动门店自动轮播
    this.startStoreAutoPlay();
  },
  beforeDestroy() {
    // 移除事件监听器
    document.body.removeEventListener('click', this.handleOutsideClick);
    window.removeEventListener('scroll', this.updateScrollPosition);

    // 清除自动轮播定时器
    this.stopAutoPlay();
    this.stopStoreAutoPlay();

    // 恢复页面滚动和之前的位置
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    if (this.isMobileMenuOpen) {
      window.scrollTo(0, this.scrollPosition);
    }
  },
  // Vue 3 兼容性
  beforeUnmount() {
    // 移除事件监听器
    document.body.removeEventListener('click', this.handleOutsideClick);
    window.removeEventListener('scroll', this.updateScrollPosition);

    // 清除自动轮播定时器
    this.stopAutoPlay();
    this.stopStoreAutoPlay();

    // 恢复页面滚动和之前的位置
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    if (this.isMobileMenuOpen) {
      window.scrollTo(0, this.scrollPosition);
    }
  },
  methods: {
    // 切换更多内容显示/隐藏
    toggleMore() {
      this.showMore = !this.showMore;
    },
    // 切换更多菜单
    toggleMoreMenu() {
      this.isMoreMenuOpen = !this.isMoreMenuOpen;
    },
    // 关闭更多菜单
    closeMoreMenu() {
      this.isMoreMenuOpen = false;
    },
    // 启动自动轮播
    startAutoPlay() {
      // 如果定时器已存在，先清除
      this.stopAutoPlay();
      // 每 3 秒切换到下一组
      this.autoPlayTimer = setInterval(() => {
        this.nextGroup();
      }, 2000);
    },
    // 停止自动轮播
    stopAutoPlay() {
      if (this.autoPlayTimer) {
        clearInterval(this.autoPlayTimer);
        this.autoPlayTimer = null;
      }
      // 清除延时恢复定时器
      if (this.resumeAutoPlayTimer) {
        clearTimeout(this.resumeAutoPlayTimer);
        this.resumeAutoPlayTimer = null;
      }
    },
    // 30 秒后恢复自动轮播
    resumeAutoPlayDelayed() {
      // 清除之前的延时定时器
      if (this.resumeAutoPlayTimer) {
        clearTimeout(this.resumeAutoPlayTimer);
      }
      // 30 秒后恢复自动轮播
      this.resumeAutoPlayTimer = setTimeout(() => {
        // 直接启动轮播，不再调用 stopAutoPlay
        if (this.autoPlayTimer) {
          clearInterval(this.autoPlayTimer);
        }
        this.autoPlayTimer = setInterval(() => {
          this.nextGroup();
        }, 2000);
      }, 30000);
    },
    // 切换到下一组证书
    nextGroup() {
      const currentTab = this.activeTab;
      const totalPages = currentTab === 'ce' ? this.totalCePages : this.totalPatentPages;
      // 如果只有一页或没有数据，不切换
      if (totalPages <= 1) return;
      // 循环切换
      this.currentGroupIndex = (this.currentGroupIndex + 1) % totalPages;
    },
    // 切换到上一组证书
    prevGroup() {
      const currentTab = this.activeTab;
      const totalPages = currentTab === 'ce' ? this.totalCePages : this.totalPatentPages;
      // 如果只有一页或没有数据，不切换
      if (totalPages <= 1) return;
      // 循环切换
      this.currentGroupIndex = (this.currentGroupIndex - 1 + totalPages) % totalPages;
    },
    // 跳转到指定组
    goToGroup(index) {
      const currentTab = this.activeTab;
      const totalPages = currentTab === 'ce' ? this.totalCePages : this.totalPatentPages;
      // 如果只有一页或没有数据，不切换
      if (totalPages <= 1) return;
      // 限制索引范围
      this.currentGroupIndex = Math.max(0, Math.min(index, totalPages - 1));
    },
    // 手动切换到下一组（停止自动轮播 30 秒）
    nextGroupManual() {
      this.nextGroup();
      this.stopAutoPlay();
      this.resumeAutoPlayDelayed();
    },
    // 手动切换到上一组（停止自动轮播 30 秒）
    prevGroupManual() {
      this.prevGroup();
      this.stopAutoPlay();
      this.resumeAutoPlayDelayed();
    },
    // 手动跳转到指定组（停止自动轮播 30 秒）
    goToGroupManual(index) {
      this.goToGroup(index);
      this.stopAutoPlay();
      this.resumeAutoPlayDelayed();
    },
    updateScrollPosition() {
      // 只在菜单未打开时更新滚动位置，避免干扰菜单打开时的固定定位
      if (!this.isMobileMenuOpen) {
        this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      }
    },
    // 切换证书 Tab
    switchTab(tab) {
      this.activeTab = tab;
      // 重置当前组索引为 0
      this.currentGroupIndex = 0;
    },
    goToSection(sectionId) {
      // 对于页面内的锚点跳转，直接跳转到对应的 anchor 元素
      const anchorElement = document.getElementById(sectionId + '-anchor'); 
      if (anchorElement) {
        // 临时恢复页面滚动以执行跳转
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';

        // 根据不同部分设置不同的偏移量，以匹配锚点元素的样式
        let offsetAdjustment;
        switch(sectionId) {
          case 'home':
            offsetAdjustment = 45; // home-anchor 使用 top: -60px
            break;
          case 'certificates':
          case 'about':
          case 'contact':
          default:
            offsetAdjustment = 80; // 其他 anchor 使用 top: -80px
            break;
        }

        // 计算需要滚动到的位置，考虑导航栏高度和锚点偏移
        const headerOffset = 70; // 导航栏高度
        const elementPosition = anchorElement.offsetTop;
        const offsetPosition = elementPosition - headerOffset + offsetAdjustment;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // 滚动完成后，延迟重新应用滚动限制
        setTimeout(() => {
          if (this.isMobileMenuOpen) {
            // 重新应用滚动限制
            document.body.style.position = 'fixed';
            document.body.style.top = -this.scrollPosition + 'px';
            document.body.style.width = '100%';
          }
        }, 600); // 增加延时以确保滚动完成

        // 关闭移动端菜单（如果打开的话）
        if (this.isMobileMenuOpen) {
          this.closeMobileMenu();
        }
      }
    },
    goToPage(route) {
      // 使用Vue Router进行页面间跳转
      this.$router.push(route);

      // 关闭移动端菜单
      this.closeMobileMenu();
    },
    submitForm() {
      // 这里可以添加表单提交逻辑
      alert('感谢您的留言，我们会尽快与您联系！')
      this.formData = {
        name: '',
        email: '',
        message: ''
      }
    },
    // 查看门店图片/视频大图
    viewStoreImage(imageSrc) {
      if (!imageSrc) return
      this.previewImageSrc = imageSrc
      this.isImagePreviewOpen = true
      // 记录当前滚动位置
      this.previewScrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
      // 使用 fixed 定位禁止滚动并保持当前位置，避免页面跳动
      document.body.style.position = 'fixed'
      document.body.style.top = -this.previewScrollPosition + 'px'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    },
    // 查看证书大图
    viewCertificateImage(imageSrc) {
      this.previewImageSrc = imageSrc
      this.isImagePreviewOpen = true
      // 记录当前滚动位置
      this.previewScrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
      // 使用 fixed 定位禁止滚动并保持当前位置，避免页面跳动
      document.body.style.position = 'fixed'
      document.body.style.top = -this.previewScrollPosition + 'px'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    },
    // 查看公司介绍图片大图
    viewCompanyImage(imageSrc) {
      if (!imageSrc) return
      this.previewImageSrc = imageSrc
      this.isImagePreviewOpen = true
      // 记录当前滚动位置
      this.previewScrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
      // 使用 fixed 定位禁止滚动并保持当前位置，避免页面跳动
      document.body.style.position = 'fixed'
      document.body.style.top = -this.previewScrollPosition + 'px'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    },
    // 关闭图片预览
    closeImagePreview() {
      this.isImagePreviewOpen = false
      this.previewImageSrc = ''
      // 重置缩放状态
      this.imageScale = 1
      this.imageTranslateX = 0
      this.imageTranslateY = 0
      // 先恢复页面样式
      const scrollPosition = this.previewScrollPosition
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      // 确保在样式恢复后滚动回原来的位置
      this.$nextTick(() => {
        window.scrollTo(0, scrollPosition)
      })
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
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen;

      // 控制页面滚动并保持当前位置
      if (this.isMobileMenuOpen) {
        // 保存当前滚动位置
        this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        // 禁止页面滚动并保持当前位置
        document.body.style.position = 'fixed';
        document.body.style.top = -this.scrollPosition + 'px';
        document.body.style.width = '100%';
      } else {
        // 恢复页面滚动和之前的位置
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, this.scrollPosition);
      }
    },
    closeMobileMenu() {
      // 恢复页面滚动和之前的位置
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, this.scrollPosition);

      this.isMobileMenuOpen = false;
    },
    handleOutsideClick(event) {
      // 如果更多菜单是打开的，点击菜单外部则关闭
      if (this.isMoreMenuOpen) {
        const moreMenu = document.querySelector('.mobile-more-menu');
        const moreMenuItem = event.target.closest('.more-menu-item');
        
        if (moreMenu && !moreMenu.contains(event.target) && !moreMenuItem) {
          this.closeMoreMenu();
        }
      }
      
      // 如果菜单是打开的，且点击的不是菜单本身、汉堡按钮或导航链接，则关闭菜单
      if (this.isMobileMenuOpen) {
        const menu = document.querySelector('.mobile-nav-menu');
        const hamburger = document.querySelector('.hamburger');
        const navLink = event.target.closest('.nav-link'); // 检查是否点击了导航链接

        // 如果点击的目标不在菜单内，也不在汉堡按钮内，也不是导航链接，则关闭菜单
        if ((menu && !menu.contains(event.target)) &&
            (hamburger && !hamburger.contains(event.target)) &&
            !navLink) {
          this.closeMobileMenu();
        }
      }
    },
    // 切换语言
    switchLanguage(locale) {
      this.$i18n.setLocale(locale)
    },
    // 启动门店自动轮播
    startStoreAutoPlay() {
      // 如果定时器已存在，先清除
      this.stopStoreAutoPlay();
      // 如果只有一个门店或没有门店，不启动轮播
      if (this.stores.length <= 1) return;
      // 每 5 秒切换到下一个门店
      this.storeAutoPlayTimer = setInterval(() => {
        this.nextStore();
      }, 3000);
    },
    // 停止门店自动轮播
    stopStoreAutoPlay() {
      if (this.storeAutoPlayTimer) {
        clearInterval(this.storeAutoPlayTimer);
        this.storeAutoPlayTimer = null;
      }
    },
    // 切换到下一个门店
    nextStore() {
      if (this.stores.length <= 1) return;
      this.currentStoreIndex = (this.currentStoreIndex + 1) % this.stores.length;
    },
    // 切换到上一个门店
    prevStore() {
      if (this.stores.length <= 1) return;
      this.currentStoreIndex = (this.currentStoreIndex - 1 + this.stores.length) % this.stores.length;
    },
    // 跳转到指定门店
    goToStore(index) {
      if (this.stores.length <= 1) return;
      this.currentStoreIndex = Math.max(0, Math.min(index, this.stores.length - 1));
    },
    // 手动切换到下一个门店（停止自动轮播 30 秒）
    nextStoreManual() {
      this.nextStore();
      this.stopStoreAutoPlay();
      this.resumeStoreAutoPlayDelayed();
    },
    // 手动切换到上一个门店（停止自动轮播 30 秒）
    prevStoreManual() {
      this.prevStore();
      this.stopStoreAutoPlay();
      this.resumeStoreAutoPlayDelayed();
    },
    // 手动跳转到指定门店（停止自动轮播 30 秒）
    goToStoreManual(index) {
      this.goToStore(index);
      this.stopStoreAutoPlay();
      this.resumeStoreAutoPlayDelayed();
    },
    // 跳转到门店详情页
    goToStoreDetail(storeId) {
      if (!storeId) return;
      this.$router.push(`/store/${storeId}`);
    },
    // 30 秒后恢复自动轮播
    resumeStoreAutoPlayDelayed() {
      if (this.storeAutoPlayTimer) {
        clearTimeout(this.storeAutoPlayTimer);
      }
      this.storeAutoPlayTimer = setTimeout(() => {
        this.startStoreAutoPlay();
      }, 30000);
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

.official-website {
  font-family: Microsoft YaHei, sans-serif;
  line-height: 1.7;
  color: $text-color;
  background: $white;
  overflow-x: clip; /* 使用 clip 替代 hidden，允许 sticky 定位正常工作 */

  .navbar {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
    z-index: 1000;
    padding: 0.1rem 0; /* 再次降低40% */

    .nav-container {
      max-width: 1500px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2rem 0 1rem;
      position: relative; /* 为更多菜单提供定位上下文 */

      .nav-logo {
        display: flex;
        align-items: center;

        .logo-img {
          height: 1.0rem; /* 再次降低40% */
          margin-right: 0.1rem;
          border-radius: 50%;
        }

        .logo-text {
          font-size: 0.7rem; /* 再次降低40% */
          font-weight: 700;
          background: linear-gradient(135deg, $primary-color, $secondary-color);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          white-space: nowrap; /* 防止文字换行 */
        }
      }

      .hamburger {
        display: none; /* 默认隐藏汉堡菜单 */
        flex-direction: column;
        cursor: pointer;
        padding: 0.3rem;
        z-index: 1004; /* 高于遮罩层和侧边菜单，确保始终可点击 */

        span {
          width: 25px;
          height: 3px;
          background: $text-color;
          margin: 3px 0;
          transition: 0.3s;
          border-radius: 2px;
        }

        &.active {
          span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
          }

          span:nth-child(2) {
            opacity: 0;
          }

          span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
          }
        }
      }

      .mobile-nav-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
        z-index: 1002; /* 高于导航栏，但低于汉堡按钮，确保遮罩覆盖导航栏 */
        display: block;
      }

      // 桌面端隐藏快捷导航栏和更多菜单
      .mobile-quick-nav {
        display: none;
      }

      .mobile-more-menu {
        display: none;
      }

      .mobile-nav-menu {
        display: none; /* 默认隐藏移动端菜单 */
        position: fixed;
        top: 0;
        left: -100%;
        width: 80%;
        max-width: 280px; 
        height: 100vh;
        background: $white;
        box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        padding: 1.5rem 0 2rem 0; /* 顶部内边距再次减小一半 */
        transition: left 0.3s ease;
        z-index: 1003; /* 高于遮罩层，确保菜单在遮罩之上 */
        overflow-y: auto;

        &.open {
          left: 0;
        }

        .nav-link {
          display: block;
          width: 100%;
          text-align: center;
          padding: 0.4rem 0; /* 调整菜单链接内边距，降低20% */
          margin: 0;
          border-bottom: 1px solid #eee;
          text-decoration: none;
          color: $text-color;
          font-weight: 500;
          transition: background 0.3s;

          &:hover {
            background: $bg-color;
          }
        }
      }

      .nav-menu {
        display: flex;

        .nav-link {
          margin-left: 0.5rem; /* 再次降低40% */
          white-space: nowrap;
          text-decoration: none;
          color: $text-color;
          font-weight: 500;
          position: relative;
          padding: 0.1rem 0; /* 再次降低40% */
          transition: color 0.3s;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(to right, $primary-color, $secondary-color);
            transition: width 0.3s;
          }

          &:hover {
            color: $primary-color;

            &::after {
              width: 100%;
            }
          }
        }
      }
    }
  }

  // 门店展示区域样式
  .stores {
    padding: 1rem 0 2rem;
    background: $white;

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .section-title {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: $text-color;
      font-weight: 700;
    }

    .section-subtitle {
      text-align: center;
      font-size: 1.2rem;
      color: $text-light;
      margin-bottom: 0.75rem;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;

      // 移动端样式（门店区域）
      @media (max-width: 768px) {
        font-size: 0.55rem !important;
        margin-bottom: 0.6rem !important;
        max-width: 700px !important;
      }
    }

    // 门店轮播容器样式
    .store-carousel {
      position: relative;
    }

    // 门店地址样式
    .store-address {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      margin-bottom: 0.75rem;
      padding: 0.5rem 1.2rem;
      background: linear-gradient(135deg, rgba($primary-color, 0.08), rgba($secondary-color, 0.08));
      border-radius: $border-radius;
      font-size: 0.6rem;
      color: $text-color;
      font-weight: 500;

      i {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, $primary-color, $secondary-color);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $white;
        font-size: 1.2rem;
      }
    }

    // 门店轮播控制按钮样式
    .store-carousel-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      margin-top: 2rem;

      .carousel-btn {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg, $primary-color, $secondary-color);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $white;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba($primary-color, 0.3);
        flex-shrink: 0;

        &:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba($primary-color, 0.4);
        }

        &:active {
          transform: scale(0.95);
        }

        svg {
          width: 24px;
          height: 24px;
          fill: currentColor;
        }
      }

      .carousel-indicators {
        display: flex;
        gap: 0.5rem;
        overflow: hidden;

        .indicator {
          min-width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ddd;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          font-weight:500;
          color: $text-color;
          padding: 0;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

          &.active {
            background: linear-gradient(135deg, $primary-color, $secondary-color);
            color: $white;
            transform: scale(1.15);
            box-shadow: 0 4px 10px rgba($primary-color, 0.3);
          }

          &:hover {
            background: $primary-color;
            color: $white;
          }
        }
      }
    }

    // 无门店数据提示样式
    .store-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #999;

      i {
        font-size: 3rem;
        margin-bottom: 0.5rem;
        opacity: 0.5;
      }

      span {
        font-size: 0.9rem;
      }
    }

    // 门店图片/视频网格
    .store-image-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      justify-content: center;
      justify-items: center;

      // 根据文件数量动态调整列数
      &.files-1 {
        grid-template-columns: 1fr;
        max-width: 500px;
        margin: 0 auto;
      }

      &.files-2 {
        grid-template-columns: repeat(2, 1fr);
        max-width: 800px;
        margin: 0 auto;
      }

      .store-item-card {
        background: $white;
        border-radius: $border-radius;
        overflow: hidden;
        box-shadow: $shadow;
        transition: all 0.3s ease;
        cursor: pointer;

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
        }

        &:active {
          transform: translateY(-2px);
        }

        // 视频容器样式
        .store-media-wrapper {
          position: relative;
          width: 100%;
          height: 400px;
          background: #000;
          overflow: hidden;

          .store-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
            pointer-events: none;
          }
        }

        // 图片容器样式
        .store-image-wrapper {
          width: 100%;
          height: 400px;
          overflow: hidden;
          position: relative;
          background: #f5f5f5;

          .store-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          &:hover {
            .store-image {
              transform: scale(1.1);
            }
          }
        }
      }
    }
  }

  .certificates {
    padding: 1rem 0 2rem; /* 进一步减少顶部内边距，保持底部内边距 */
    background: $bg-color;

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .section-title {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 0.5rem; /* 进一步减少标题下方间距 */
      color: $text-color;
      font-weight: 700;
    }

    .section-subtitle {
      text-align: center;
      font-size: 1.2rem;
      color: $text-light;
      margin-bottom: 1rem; /* 进一步减少副标题下方间距 */
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;

      // 移动端样式（证书区域）
      @media (max-width: 768px) {
        font-size: 0.55rem !important;
        margin-bottom: 0.6rem !important;
        max-width: 700px !important;
      }
    }

    // 证书 Tab 切换样式
    .certificate-tabs {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;

      .certificate-tab {
        padding: 0.8rem 2rem;
        font-size: 1.1rem;
        font-weight: 600;
        color: $text-light;
        background: $white;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          border-color: $primary-color;  
          color: $primary-color;
        }

        &.active {
          background: linear-gradient(135deg, $primary-color, $secondary-color);
          color: $white;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba($primary-color, 0.3);
        }
      }
    }

    // 证书内容区域
    .certificate-content {
      // 内容区域无需额外样式
    }

    // 证书网格样式
    .certificate-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
      justify-content: center;

      .certificate-card {
        background: $white;
        border-radius: $border-radius;
        padding: 1rem;
        text-align: center;
        box-shadow: $shadow;
        transition: all 0.3s ease;
        overflow: hidden;

        &:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
        }

        .certificate-image-wrapper {
          width: 100%;
          height: 450px;
          margin-bottom: 1rem;
          overflow: hidden;
          border-radius: 8px;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;

          .certificate-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            transition: transform 0.3s ease;
          }

          // 放大提示遮罩层
          .image-zoom-hint {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            color: $white;

            i {
              font-size: 2rem;
              margin-bottom: 0.5rem;
            }

            span {
              font-size: 0.9rem;
            }
          }

          &:hover {
            .image-zoom-hint {
              opacity: 1;
            }
            .certificate-image {
              transform: scale(1.1);
            }
          }

          .certificate-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #999;

            i {
              font-size: 3rem;
              margin-bottom: 0.5rem;
              opacity: 0.5;
            }

            span {
              font-size: 0.9rem;
            }
          }
        }

        .certificate-name {
          font-size: 1rem;
          color: $text-color;
          font-weight: 500;
          margin: 0;
          padding: 0.5rem;
          border-top: 1px solid #eee;
        }

        &.placeholder {
          border: 2px dashed #ddd;
          box-shadow: none;
          background: #fafafa;

          &:hover {
            transform: none;
            box-shadow: none;
          }
        }
      }
    }

    // 轮播控制按钮样式
    .certificate-carousel-controls {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
      margin-top: 2rem;

      .carousel-btn {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg, $primary-color, $secondary-color);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $white;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba($primary-color, 0.3);

        &:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba($primary-color, 0.4);
        }

        &:active {
          transform: scale(0.95);
        }

        svg {
          width: 24px;
          height: 24px;
          fill: currentColor;
        }
      }

      .carousel-indicators {
        display: flex;
        gap: 0.5rem;

        .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ddd;
          cursor: pointer;
          transition: all 0.3s ease;

          &.active {
            background: linear-gradient(135deg, $primary-color, $secondary-color);
            width: 30px;
            border-radius: 5px;
          }

          &:hover {
            background: $primary-color;
          }
        }
      }
    }
  }

  // 图片预览弹窗样式
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

    // 缩放提示
    .zoom-hint {
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      padding: 10px 20px;
      border-radius: 20px;
      color: $white;
      font-size: 0.9rem;
      animation: fadeInOut 2s ease forwards;

      span {
        white-space: nowrap;
      }
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

  .hero {
    min-height: 100vh; /* 使用最小高度，允许内容撑开 */
    background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
    display: flex;
    align-items: flex-start; /* 改为顶部对齐 */
    justify-content: center;
    text-align: center;
    color: $text-color;
    position: relative;
    overflow: visible; /* 允许内容溢出显示 */
    padding: 2rem 0 3rem; /* 增加底部内边距 */

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
      max-width: 1200px; /* 增加最大宽度以容纳更多产品 */
      padding: 0 2rem;
      position: relative;
      z-index: 1;
      width: 100%; /* 确保内容区域占满宽度 */

      .hero-title {
        font-size: 2.2rem; /* 进一步减小标题字体大小，降低30% */
        margin-bottom: 0.5rem; /* 进一步减少标题下方间距 */
        font-weight: 700;
        background: linear-gradient(135deg, $primary-color, $secondary-color);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        animation: fadeInUp 1s ease;
      }

      .hero-subtitle {
        font-size: 1rem; /* 进一步减小副标题字体大小，降低30% */
        margin-bottom: 1.5rem; /* 进一步减少副标题下方间距 */
        color: $text-light;
        line-height: 1.2; /* 进一步减小行高 */
        animation: fadeInUp 1s ease 0.2s both;
      }

      .hero-buttons {
        animation: fadeInUp 1s ease 0.4s both;
        margin-bottom: 2rem; /* 减少底部边距 */
        display: flex;
        justify-content: center;
        gap: 1rem; /* 添加按钮间的间距 */

        .btn {
          padding: 0.7rem 1.8rem; /* 减小内边距降低按钮高度 */
          border: none;
          border-radius: 50px;
          font-size: 0.9rem; /* 进一步减小按钮字体大小 */
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: $shadow;
          white-space: nowrap; /* 防止文字换行 */
          min-width: 120px; /* 设置最小宽度以容纳文字 */
          display: inline-flex; /* 使用flexbox确保文字居中 */
          align-items: center; /* 垂直居中 */
          justify-content: center; /* 水平居中 */

          &:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
          }
        }

        .btn-primary {
          background: linear-gradient(135deg, $primary-color, $secondary-color);
          color: $white;
        }

        .btn-secondary {
          background: $white;
          color: $primary-color;
          border: 2px solid $primary-color;
        }
      }

      // 公司介绍布局样式
      .hero-logo-section {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 1.5rem;
        animation: fadeInUp 1s ease both;

        .hero-logo-wrapper {
          width: auto;
          height: 150px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba($primary-color, 0.2);
          background: linear-gradient(135deg, rgba($primary-color, 0.1), rgba($secondary-color, 0.1));
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;

          &:hover {
            transform: scale(1.05);
            box-shadow: 0 12px 35px rgba($primary-color, 0.3);
          }

          .hero-logo-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            transition: transform 0.3s ease;
          }
        }
      }

      // 视频展示区样式
      .hero-video-section {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 1.5rem;
        animation: fadeInUp 1s ease 0.1s both;

        .hero-video-wrapper {
          width: 100%;
          max-width: 640px;
          border-radius: $border-radius;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          background: #000;

          .hero-video {
            width: 100%;
            height: auto;
            display: block;
            max-height: 360px;
            object-fit: cover;
          }
        }
      }

      // 公司介绍布局样式
      .company-intro {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        margin-top: 1rem;
        background: $white;
        border-radius: $border-radius;
        padding: 1.25rem;
        box-shadow: $shadow;
        animation: fadeInUp 1s ease 0.6s both;
        max-width: 900px;
        margin-left: auto;
        margin-right: auto;

        // 文字块样式
        .company-text-block {
          .company-text {
            font-size: 0.45rem;
            line-height: 2;
            color: $text-color;
            text-indent: 2em; // 首行缩进
            text-align: justify; // 两端对齐
          }

          .company-text-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            background: #f8f9fa;
            border-radius: 8px;
            border: 2px dashed #ddd;
            color: #999;

            i {
              font-size: 2.5rem;
              margin-bottom: 0.5rem;
              opacity: 0.5;
            }

            span {
              font-size: 0.9rem;
            }
          }
        }

        // 更多按钮样式
        .company-more-btn {
          display: flex;
          justify-content: center;
          margin: 0.5rem 0;

          .more-btn {
            display: flex;
            align-items: center;
            padding: 0.6rem 1.5rem;
            background: linear-gradient(135deg, $primary-color, $secondary-color);
            color: $white;
            border: none;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba($primary-color, 0.3);

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba($primary-color, 0.4);
            }

            &:active {
              transform: translateY(0);
            }
          }
        }

        // 更多内容区域样式
        .company-more-content {
          // 使用过渡动画
        }

        // 展开/收起动画
        .expand-enter-active,
        .expand-leave-active {
          transition: all 0.3s ease;
          max-height: 2000px;
          opacity: 1;
        }

        .expand-enter,
        .expand-leave-to {
          max-height: 0;
          opacity: 0;
        }

        // 图片块样式
        .company-image-block {
          .company-image-wrapper {
            width: 100%;
            height: 330px;
            background: linear-gradient(135deg, rgba($primary-color, 0.08), rgba($secondary-color, 0.08));
            border-radius: $border-radius;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            position: relative;
            cursor: pointer;

            .company-image {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s ease;
            }

            // 放大提示遮罩层
            .image-zoom-hint {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: opacity 0.3s ease;
              color: $white;

              i {
                font-size: 2rem;
                margin-bottom: 0.5rem;
              }

              span {
                font-size: 0.9rem;
              }
            }

            &:hover {
              .image-zoom-hint {
                opacity: 1;
              }
              .company-image {
                transform: scale(1.1);
              }
            }

            .company-image-placeholder {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: #999;

              i {
                font-size: 3rem;
                margin-bottom: 0.5rem;
                opacity: 0.5;
              }

              span {
                font-size: 0.9rem;
              }
            }
          }
        }

        // 视频块样式
        .company-video-block {
          .company-video-wrapper {
            width: 100%;
            border-radius: $border-radius;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            background: #000;

            .company-video {
              width: 100%;
              height: auto;
              display: block;
              max-height: 450px;
              object-fit: cover;
            }
          }
        }
      }

      // 产品网格样式（保留用于移动端）
      .product-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr); /* PC 端 3 列布局 */
        gap: 1.2rem;
        margin-top: 1.5rem;
        justify-content: center;
        max-width: 900px; /* 限制最大宽度，3 列更美观 */
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
    }
  }


  .about {
    padding: 1rem 0 2rem; /* 进一步减少顶部内边距，保持底部内边距 */

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .section-title {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 0.5rem; /* 进一步减少标题下方间距 */
      color: $text-color;
      font-weight: 700;
    }

    .section-subtitle {
      text-align: center;
      font-size: 1.2rem;
      color: $text-light;
      margin-bottom: 1rem; /* 进一步减少副标题下方间距 */
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;

      // 移动端样式（Hero 区域）
      @media (max-width: 768px) {
        font-size: 0.55rem !important;
        margin-bottom: 0.6rem !important;
        max-width: 700px !important;
      }
    }
    
    .about-content {
      display: flex;
      align-items: center;
      gap: 4rem;
      
      .about-text {
        flex: 1;
        
        h3 {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          color: $text-color;
          font-weight: 600;
        }
        
        p {
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
          color: $text-light;
          line-height: 1.8;
        }
        
        ul {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;

          li {
            margin-bottom: 0.8rem;
            color: $text-light;
            position: relative;
            font-size: 1.2rem; /* 增大列表项字体大小 */
            font-weight: 500; /* 稍微加重字体 */

            &::before {
              content: '✓';
              position: absolute;
              left: -1.5rem;
              color: $primary-color;
              font-weight: bold;
            }
          }
        }
      }
      
      .about-image {
        flex: 1;
        border-radius: $border-radius;
        overflow: hidden;
        box-shadow: $shadow;
        transition: transform 0.4s ease;

        &:hover {
          transform: scale(1.03);
        }

        img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.5s ease;

          &:hover {
            transform: scale(1.05);
          }
        }
      }
    }

    // 复制的联系内容样式
    .contact-content {
      display: flex;
      gap: 4rem;
      margin-top: 1rem; 

      .contact-info {
        flex: 1;

        // 电话和邮箱左右排布容器
        .contact-row {
          display: flex;
          gap: 2rem;
          margin-bottom: 2.5rem;

          .contact-item {
            flex: 1;
            margin-bottom: 0;
          }
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 2.5rem;

          i {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, $primary-color, $secondary-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: $white;
            margin-right: 1.2rem;
            flex-shrink: 0;
            font-size: 1.3rem;
          }

          .contact-text {
            h4 {
              font-size: 1.2rem;
              margin-bottom: 0.3rem;
              color: $text-color;
            }

            span {
              font-size: 1.1rem;
              color: $text-light;
            }
          }
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


@media (max-width: 768px) {
  .official-website {
    overflow-x: visible !important; /* 移动端允许横向内容显示 */
  }

  .navbar .nav-container {
    flex-direction: column; /* 改为垂直布局，logo 和快捷导航上下排列 */
    padding: 0.15rem 0.3rem !important; /* 进一步减小移动端导航栏的padding，并确保优先级 */
    align-items: center; /* 确保内容垂直居中 */

    .nav-logo {
      display: flex; /* 使用flex布局确保内容在同一行 */
      align-items: center; /* 垂直居中对齐 */
      justify-content: center; /* 水平居中对齐 */
      width: 100%; /* 占满宽度 */

      .logo-img {
        height: 1.8rem; /* 调整移动端logo大小 */
      }

      .logo-text {
        font-size: 0.55rem !important; /* 调整移动端logo文字大小，降低50% */
        white-space: nowrap; /* 防止文字换行 */
        margin-left: 0.15rem; /* 添加与logo图片的间距，进一步减少间距 */
      }
    }

    .mobile-nav-overlay {
      display: block !important; /* 在移动端强制显示覆盖层 */
      z-index: 1002; /* 高于导航栏，但低于汉堡按钮，确保遮罩覆盖导航栏 */
    }

    // 移动端快捷导航栏样式
    .mobile-quick-nav {
      display: flex !important; /* 在移动端强制显示 */
      width: 100%;
      justify-content: space-around;
      align-items: center;
      padding: 0.1rem 0 !important;
      margin-top: 0;
      background: rgba(255, 255, 255, 0.95);
      order: 2; /* 确保在 logo 之后显示 */

      .quick-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        color: $text-color;
        font-size: 0.35rem !important;
        transition: all 0.3s ease;
        padding: 0rem 0.2rem !important;
        border-radius: 8px;
        min-width: 60px;

        i {
          font-size: 1.2rem;
          margin-bottom: 0.15rem;
          color: $primary-color;
          transition: all 0.3s ease;
        }

        span {
          white-space: nowrap;
          font-weight: 500;
        }

        &:hover,
        &:active {
          background: linear-gradient(135deg, rgba($primary-color, 0.1), rgba($secondary-color, 0.1));
          
          i {
            color: $secondary-color;
            transform: scale(1.1);
          }
        }
      }
    }

    // 移动端更多菜单样式
    .mobile-more-menu {
      display: block !important; /* 在移动端强制显示 */
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      max-height: 60vh;
      background: $white;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      border-radius: 0 0 12px 12px;
      overflow-y: auto;
      z-index: 1001;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      pointer-events: none;

      &.show {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .more-menu-content {
        padding: 0.5rem 0;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        justify-items: center;

        .more-menu-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: $text-color;
          font-size: 0.45rem;
          padding: 0.1rem 0.2rem;
          border-radius: 8px;
          width: 100%;
          max-width: 90px;
          aspect-ratio: 1 / 1;
          transition: all 0.3s ease;
          background: #f8f9fa;

          i {
            font-size: 1.3rem;
            margin-bottom: 0.2rem;
            color: $primary-color;
            transition: all 0.3s ease;
          }

          span {
            white-space: nowrap;
            font-weight: 500;
          }

          &:hover,
          &:active {
            background: linear-gradient(135deg, rgba($primary-color, 0.1), rgba($secondary-color, 0.1));

            i {
              color: $secondary-color;
              transform: scale(1.1);
            }
          }
        }
      }
    }

    .mobile-nav-menu {
      display: flex !important; /* 在移动端强制显示侧边菜单 */
      position: fixed;
      top: 0;
      left: -100%; /* 菜单位置在最左侧外 */
      width: 80%;
      max-width: 280px;
      height: 100vh;
      background: $white;
      box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      padding: 1.5rem 0 2rem 0; /* 顶部内边距再次减小一半 */
      transition: left 0.3s ease;
      z-index: 1003; /* 高于遮罩层，确保菜单在遮罩之上 */
      overflow-y: auto; 

      &.open {
        left: 0; /* 菜单向右滑入视窗 */
      }

      .nav-link {
        display: block;
        width: 100%;
        text-align: center;
        padding: 0.15rem 0 !important; /* 调整移动端菜单链接内边距，降低20% */
        margin: 0;
        border-bottom: 1px solid #eee;
        text-decoration: none;
        color: $text-color;
        font-weight: 500;
        transition: background 0.3s;
        font-size: 0.65rem; /* 调整移动端菜单链接文字大小，降低35% */

        &:hover {
          background: $bg-color;
        }
      }
    }

    .nav-menu {
      display: none !important; /* 在移动端强制隐藏桌面端导航菜单 */
    }
  }

  .hero {
    height: auto !important; /* 让高度完全自适应内容 */
    min-height: unset !important; /* 不设置最小高度 */
    padding: 0.6rem 0 !important; /* 增加上下内边距 */
    display: block !important; /* 改为块级元素，不使用flexbox */
    align-items: unset !important; /* 取消flexbox对齐设置 */
    justify-content: unset !important; /* 取消flexbox对齐设置 */
    overflow: visible !important; /* 确保内容不被隐藏 */
    margin: 0 !important; /* 移除可能的外边距 */
    position: static !important; /* 确保位置正常 */

    .hero-content {
      position: static !important;
      z-index: auto !important;
      width: 100% !important;
      max-width: 100% !important;
      padding: 0 0.6rem !important;
      box-sizing: border-box !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      .hero-title {
        font-size: 1.1rem !important; /* 调整标题大小，降低50% */
        line-height: 1.3; /* 调整行高 */
        margin-bottom: 0.3rem !important; /* 进一步调整间距 */
      }
      .hero-subtitle {
        font-size: 0.55rem !important; /* 调整副标题大小，降低50% */   
        line-height: 1.4; /* 调整行高 */
        margin-bottom: 0.5rem !important; /* 进一步调整间距 */
      }

      // 移动端 Logo 展示区样式
      .hero-logo-section {
        margin-bottom: 0.8rem !important;

        .hero-logo-wrapper {
          width: auto !important;
          height: 90px !important;
          box-shadow: 0 4px 15px rgba($primary-color, 0.15) !important;
        }
      }

      // 移动端视频展示区样式
      .hero-video-section {
        margin-bottom: 0.8rem !important;

        .hero-video-wrapper {
          max-width: 100% !important;
          border-radius: 8px !important;

          .hero-video {
            max-height: 240px !important;
          }
        }
      }

      .hero-buttons {
        flex-direction: column; /* 按钮垂直排列 */
        gap: 0.8rem; /* 进一步调整按钮间距 */
        margin-bottom: 1rem !important; /* 增加底部边距 */

        .btn {
          width: 100%; /* 按钮占满宽度 */
          max-width: 260px; /* 设置最大宽度 */
          padding: 0.6rem 1.2rem; /* 进一步调整按钮内边距 */
          margin: 0.15rem 0 !important; /* 进一步调整按钮外边距 */
          font-size: 0.45rem !important; /* 调整按钮文字大小，降低50% */
        }
      }

      // 移动端公司介绍样式
      .company-intro {
        display: flex !important;
        flex-direction: column !important;
        gap: 0.5rem !important;
        margin-top: 0.8rem !important;
        padding: 0.75rem 0.5rem !important;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1) !important;
        max-width: 100% !important;

        // 文字块样式
        .company-text-block {
          .company-text {
            font-size: 0.3rem !important;
            line-height: 1.8 !important;
            text-indent: 1em !important; // 移动端首行缩进
            text-align: justify !important;
          }

          .company-text-placeholder {
            padding: 1rem !important;
            font-size: 0.35rem !important;
          }
        }

        // 更多按钮样式（移动端）
        .company-more-btn {
          .more-btn {
            padding: 0.2rem 0.6rem !important;
            font-size: 0.325rem !important;
            box-shadow: 0 2px 8px rgba($primary-color, 0.25) !important;

            &:hover {
              transform: none !important;
            }
          }
        }

        // 更多内容区域样式（移动端）
        .company-more-content {
          // 移动端样式
        }

        // 图片块样式
        .company-image-block {
          .company-image-wrapper {
            height: 120px !important;
            border-radius: 6px !important;
            position: relative;
            cursor: pointer;

            .image-zoom-hint {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: opacity 0.3s ease;
              color: $white;

              i {
                font-size: 1.5rem;
                margin-bottom: 0.3rem;
              }

              span {
                font-size: 0.7rem;
              }
            }

            &:hover {
              .image-zoom-hint {
                opacity: 1;
              }
            }
          }
        }

        // 视频块样式
        .company-video-block {
          .company-video-wrapper {
            border-radius: 6px !important;
            overflow: hidden;
            background: #000;

            .company-video {
              max-height: 200px !important;
            }
          }
        }
      }

      // 移动端产品网格样式
      .product-grid {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important; /* 移动端双列布局 */
        gap: 0.4rem !important; /* 移动端间距 */
        margin-top: 0.2rem;
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
          min-width: 0 !important; /* 防止卡片溢出 grid 容器 */
          aspect-ratio: 3 / 4; /* 控制卡片宽高比为 3:4，避免太细长 */

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
          }

          .product-cover {
            width: 100%;
            height: 90px; /* 移动端封面高度 - 降低高度 */
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
              object-fit: cover; /* 使用 cover 填充，图片更饱满 */
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
            align-items: center;
            justify-content: center;

            .product-name {
              font-size: 0.65rem !important; /* 移动端产品名字体 */
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
    }
  }

  .stores,
  .certificates,
  .about {
    padding: 1rem 0 !important; /* 调整各部分内边距 */

    .container {
      padding: 0 0.7rem !important; /* 增加容器内边距以适应小屏幕 */
    }

    .section-title {
      font-size: 1.1rem !important; /* 调整标题大小，降低50% */
      margin-bottom: 1rem; /* 调整间距 */
    }

    // 注意：各区域的 .section-subtitle 移动端样式已在对应区域内部定义
    // 如需调整，请在对应区域的 @media (max-width: 768px) 中修改

    .certificate-tabs {
      gap: 0.1rem !important;
      margin-bottom: 0.75rem !important;

      .certificate-tab {
        padding: 0.1rem 0.2rem !important;
        font-size: 0.55rem !important;
        border-radius: 6px;
        white-space: nowrap; /* 防止文字换行 */
      }
    }
  }

  .about .about-content {
    flex-direction: column; /* 内容垂直排列 */
    gap: 2.2rem; /* 调整间距 */
  }

  // 关于我们部分中的联系内容移动端样式
  .about .contact-content {
    margin-top: 0.6rem !important;

    .contact-info {
      .contact-row {
        flex-direction: row !important;
        gap: 0.5rem !important;
        margin-bottom: 0.5rem !important;

        .contact-item {
          flex: 1;
          margin-bottom: 0 !important;
        }
      }

      .contact-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 0.5rem !important;

        i {
          width: 35px !important;
          height: 35px !important;
          font-size: 0.9rem !important;
          margin-right: 0.8rem !important;
          flex-shrink: 0;
        }

        .contact-text {
          h4 {
            font-size: 0.45rem !important;
            margin-bottom: 0.15rem !important;
          }

          span {
            font-size: 0.4rem !important;
          }
        }
      }

      .contact-item.address-item {
        margin-bottom: 0.5rem !important;
      }
    }
  }

  .services-grid {
    grid-template-columns: 1fr; /* 服务网格单列显示 */
    gap: 1.8rem; /* 调整网格间距 */
  }

  /* 证书网格移动端双列布局 */
  .certificate-grid {
    grid-template-columns: repeat(2, 1fr) !important; /* 移动端双列显示 */
    gap: 0.3rem !important; /* 减小间距 */

    .certificate-card {
      padding: 0.3rem !important;

      .certificate-image-wrapper {
        margin-bottom: 0.2rem !important;
        height: 200px !important; /* 移动端图片高度 */

        .certificate-placeholder {
          i {
            font-size: 2rem;
          }
          span {
            font-size: 0.7rem;
          }
        }
      }

      .certificate-name {
        font-size: 0.75rem !important;
      }
    }
  }

  // 移动端门店网格布局
  .store-image-grid {
    grid-template-columns: repeat(3, 1fr) !important; /* 移动端默认三列显示 */
    gap: 0.5rem !important;

    // 1 个文件时单列显示
    &.files-1 {
      grid-template-columns: 1fr !important;
      max-width: 100% !important;
    }

    // 2 个文件时双列显示
    &.files-2 {
      grid-template-columns: repeat(2, 1fr) !important;
    }

    .store-item-card {
      // 视频容器移动端样式
      .store-media-wrapper {
        height: 180px !important; /* 移动端视频高度 */
      }

      // 图片容器移动端样式
      .store-image-wrapper {
        height: 180px !important; /* 移动端图片高度 */
      }
    }
  }

  // 移动端门店地址样式
  .store-address {
    flex-direction: row !important;
    gap: 0.5rem !important;
    padding: 0.8rem 1rem !important;
    font-size: 0.45rem !important;
    justify-content: center !important;

    i {
      width: 32px !important;
      height: 32px !important;
      font-size: 1rem !important;
      flex-shrink: 0;
    }

    span {
      text-align: center;
      word-break: break-all;
    }
  }

  // 移动端轮播控制按钮适配 - 证书部分
  .certificate-carousel-controls {
    gap: 0.5rem !important;
    margin-top: 1rem !important;

    .carousel-btn {
      width: 36px !important;
      height: 36px !important;

      svg {
        width: 20px !important;
        height: 20px !important;
      }
    }

    .carousel-indicators {
      gap: 0.3rem !important;

      .indicator {
        min-width: 24px !important;
        width: 24px !important;
        height: 24px !important;
        font-size: 0.65rem !important;
        border-radius: 50% !important;

        &.active {
          transform: scale(1.15) !important;
          width: 24px !important;
        }
      }
    }
  }

  // 移动端轮播控制按钮适配 - 门店部分
  .store-carousel-controls {
    gap: 0.5rem !important;
    margin-top: 1rem !important;

    .carousel-btn {
      width: 36px !important;
      height: 36px !important;

      svg {
        width: 30px !important;
        height: 30px !important;
      }
    }

    .carousel-indicators {
      gap: 0.25rem !important;

      .indicator {
        min-width: 30px !important;
        width: 30px !important;
        height: 30px !important;
        font-size: 0.55rem !important;
        border-radius: 50% !important;

        &.active {
          transform: scale(1.10) !important;
          width: 30px !important;
        }
      }
    }
  }

  // 移动端图片预览弹窗适配
  .image-preview-overlay {
    .image-preview-content {
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

      .close-preview-btn {
        top: -45px;
        width: 36px;
        height: 36px;
      }
    }
  }

  .service-card {
    padding: 1.8rem; /* 调整服务卡片内边距 */

    .service-icon {
      width: 75px; /* 调整图标大小 */
      height: 75px; /* 调整图标大小 */
      margin: 0 auto 1.4rem; /* 调整图标间距 */

      i {
        font-size: 1.1rem !important; /* 调整图标字体大小，降低50% */
      }
    }

    .service-title {
      font-size: 0.7rem !important; /* 调整服务标题大小，降低50% */
    }

    .service-desc {
      font-size: 0.5rem !important; /* 调整服务描述文字大小，降低50% */
    }
  }

  .about-text {
    h3 {
      font-size: 0.8rem !important; /* 调整子标题大小，降低50% */
      margin-bottom: 0.5rem !important;
    }

    p {
      font-size: 0.525rem !important; /* 调整段落文字大小，降低50% */
      margin-bottom: 0.6rem !important; /* 调整间距 */
      line-height: 1.6; /* 调整行高 */
    }

    ul {
      padding-left: 1.2rem; /* 调整列表左边距 */
      margin-bottom: 0.5rem !important;

      li {
        font-size: 0.55rem !important; /* 调整列表项文字大小，降低50% */
        margin-bottom: 0.5rem !important; /* 调整列表项间距 */
      }
    }
  }

  .about-image,
  .contact-info {
    width: 100%; /* 确保图片和联系信息占满宽度 */
  }

  // 移动端电话和邮箱也左右排布
  .contact-row {
    flex-direction: row !important;
    gap: 0.5rem !important;
    margin-bottom: 0.5rem !important;

    .contact-item {
      flex: 1;
      margin-bottom: 0 !important;
    }
  }

  .contact-item.address-item {
    margin-bottom: 0.5rem !important;
  }

  .contact-item {
    flex-direction: column; /* 联系方式垂直排列 */
    align-items: flex-start; /* 左对齐 */
    gap: 0.1rem !important; /* 调整间距 */

    i {
      margin-right: 0 !important; /* 移除图标右边距 */
      margin-bottom: 0.1rem !important; /* 添加图标下方间距 */
    }

    .contact-text {
      h4 {
        margin-bottom: 0.3rem; /* 调整标题间距 */
        font-size: 0.45rem !important; /* 调整联系信息标题大小，降低50% */
      }

      span {
        font-size: 0.4rem !important; /* 调整联系信息内容大小，降低50% */
      }
    }
  }

  .footer .footer-content {
    flex-direction: column;
    gap: 1.8rem; /* 调整页脚内容间距 */
    text-align: center;

    .footer-logo {
      .logo-img {
        height: 2.8rem; /* 调整页脚logo大小 */
      }

      .logo-text {
        font-size: 0.95rem; /* 调整页脚logo文字大小 */
      }
    }

    .footer-links {
      flex-wrap: wrap; /* 允许换行 */
      justify-content: center;
      gap: 1.2rem; /* 调整链接间距 */

      a {
        font-size: 0.5rem !important; /* 调整链接文字大小，降低50% */
      }
    }

    .social-icons {
      justify-content: center;
      gap: 1rem; /* 调整社交图标间距 */

      a {
        width: 38px; /* 调整社交图标大小 */
        height: 38px; /* 调整社交图标大小 */
        font-size: 0.55rem !important; /* 调整社交图标字体大小，降低50% */
      }
    }
  }

  .copyright {
    font-size: 0.475rem !important; /* 调整版权文字大小，降低50% */
  }
}


</style> 
