import Vue from 'vue'
import Router from 'vue-router'

const OfficialWebsite = () => import('pages/officialWebsite')
const Index = () => import('pages/index')
const ProductDetails = () => import('pages/product-details')
const Flow = () => import('pages/flow')
const Merchant = () => import('pages/merchant-distribution')

const AllCourses = () => import('pages/allCourses')
const MessageBoard = () => import('pages/messageBoard')
const ScreenLightSetting = () => import('pages/screenLightSetting')
const ResourceDownload = () => import('pages/resourceDownload')
const ResourceCourses = () => import('pages/resourceCourses')
const ImageDownload = () => import('pages/imageDownload')
const ProductCenter = () => import('pages/productCenter')
const ProductDetail = () => import('pages/productDetail')
const ProductManager = () => import('pages/Controller/ProductManager')
const Login = () => import('pages/Controller/Login')

const LampTemplate = () => import('pages/lampTemplate')
const Store = () => import('pages/store')








Vue.config.productionTip = false
Vue.use(Router)

export default new Router({
  // mode:'history',  //去掉“#”
  scrollBehavior: () => ({ y: 0 }),  //对于所有路由导航，简单地让页面滚动到顶部。
  routes: [
    {
      path: '/',
      name: 'officialWebsite',
      component: OfficialWebsite,
      meta: {
        title: '官网'
      }
    },
    {
      path: '/index',
      name: 'index',
      component: OfficialWebsite,
      meta: {
        title: '首页'
      }
    },
    {
      name: 'productDetails',
      path: '/productDetails/:detId',
      component: ProductDetails,
      meta: {
        title: '绑定教程'
      }
    },
    {
      name: 'flow',
      path: '/flow',
      component: Flow,
      meta: {
        title: '后台注册'
      }
    },
    {
      name: 'merchant',
      path: '/merchant',
      component: Merchant,
      meta: {
        title: '商户分账'
      }
    },
    {
      name: 'allCourses',
      path: '/allCourses',
      component: AllCourses,
      meta: {
        title: '全部教程'
      }
    },
    {
      name: 'messageBoard',
      path: '/messageBoard',
      component: MessageBoard,
      meta: {
        title: '留言板'
      }
    },
    {
      name: 'screenLightSetting',
      path: '/screenLightSetting',
      component: ScreenLightSetting,
      meta: {
        title: '灯光PK秀'
      }
    },
    {
      name: 'resourceDownload',
      path: '/resourceDownload',
      component: ResourceDownload,
      meta: {
        title: '资源下载'
      }
    },
    {
      name: 'resourceCourses',
      path: '/resourceCourses',
      component: ResourceCourses,
      meta: {
        title: '视频教程'
      }
    },
    {
      name: 'imageDownload',
      path: '/imageDownload',
      component: ImageDownload,
      meta: {
        title: '视频教程'
      }
    },
    {
      name: 'lampTemplate',
      path: '/lampTemplate',
      component: LampTemplate,
      meta: {
        title: '视频教程'
      }
    },
    {
      name: 'productCenter',
      path: '/productCenter',
      component: ProductCenter,
      meta: {
        title: '产品中心'
      }
    },
    {
      name: 'productDetail',
      path: '/productDetail/:id', 
      component: ProductDetail,
      meta: {
        title: '产品详情'
      }
    },
    {
      name: 'productManager',
      path: '/productManager',
      component: ProductManager,
      meta: {
        title: '产品管理'
      }
    },
    {
      name: 'login',
      path: '/login',
      component: Login,
      meta: {
        title: '登录'
      }
    },
    {
      name: 'store',
      path: '/store/:id',
      component: Store,
      meta: {
        title: '门店信息'
      }
    },
  ],
  scrollBehavior(to, from, savedPosition) { //路由切换时页面如何滚动
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})
