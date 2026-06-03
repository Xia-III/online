import Vue from 'vue'
import App from './App'
import router from './router'
import i18n from './i18n'
import './base/js/base.js'
import 'swiper/dist/css/swiper.css'

/* 引入 vant */
import Vant from 'vant'
import 'vant/lib/index.css'
Vue.use(Vant)

/*图片懒加载*/
import VueLazyload from 'vue-lazyload'
Vue.use(VueLazyload, {
  preLoad: 1.3,  //预加载高度比例
  error: require('@/assets/404.png'),  //图片路径错误时加载图片
  loading: require('@/assets/loading.gif'),  //预加载图片
  attempt: 3  //尝试加载图片数量
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  /* 路由发生变化修改页面 title */
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
})

// 引入视频
import VideoPlayer from 'vue-video-player'
require('video.js/dist/video-js.css')
require('vue-video-player/src/custom-theme.css')
Vue.use(VideoPlayer)

/*滑动事件*/
import VueTouch from 'vue-touch'
Vue.use(VueTouch, { name: 'v-touch' })

/* 轮播图 */
import VueAwesomeSwiper from 'vue-awesome-swiper'
Vue.use(VueAwesomeSwiper)

/* 引入 vue 日期选择组件 */
import Calendar from 'vue-mobile-calendar'
Vue.use(Calendar)

new Vue({
  el: '#app',
  router,
  i18n,
  render: h => h(App)
})
