import Vue from 'vue'
import VueI18n from 'vue-i18n'
import zh from './zh'
import en from './en'

Vue.use(VueI18n)

// 创建 i18n 实例
const i18n = new VueI18n({
  locale: localStorage.getItem('locale') || 'zh', // 默认语言，从 localStorage 获取
  messages: {
    zh, // 中文
    en  // 英文
  }
})

// 设置语言时自动保存到 localStorage
i18n.setLocale = (locale) => {
  localStorage.setItem('locale', locale)
  i18n.locale = locale
}

export default i18n
