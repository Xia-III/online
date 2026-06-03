<template>
  <div class="language-switcher">
    <van-button
      size="small"
      type="default"
      @click="toggleLanguage"
      class="lang-btn"
    >
      {{ currentLang === 'zh' ? 'English' : '中文' }}
    </van-button>
  </div>
</template>

<script>
export default {
  name: 'LanguageSwitcher',
  data() {
    return {
      currentLang: this.$i18n.locale
    }
  },
  methods: {
    toggleLanguage() {
      const newLang = this.currentLang === 'zh' ? 'en' : 'zh'
      this.$i18n.setLocale(newLang)
      this.currentLang = newLang
      
      // 如果在官网首页，需要更新页面锚点导航
      this.$emit('language-changed', newLang)
    }
  }
}
</script>

<style lang="scss" scoped>
.language-switcher {
  display: inline-block;
  
  .lang-btn {
    font-size: 0.28rem;
    padding: 0 0.3rem;
    height: 0.6rem;
    line-height: 0.6rem;
  }
}
</style>
