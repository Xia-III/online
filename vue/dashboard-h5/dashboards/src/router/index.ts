import { createRouter, createWebHistory, RouteRecordRaw, createWebHashHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DefaultView from '../views/DefaultView.vue'
import QualificationView from '../views/QualificationView.vue'
import QualificationFormView from '../views/QualificationFormView.vue'
import UserView from '../views/UserView.vue'
import MerchantView from '../views/MerchantView.vue'
import MerchantForm from '../views/MerchantFormView.vue'
import MerchantBankCardUpdateFormView from '../views/MerchantBankCardUpdateFormView.vue'
import MerchantDetail from '../views/MerchantDetailView.vue'
import MenuView from '../views/MenuView.vue'
import SystemRoleView from '../views/SystemRoleView.vue'
import { getToken } from '@/utils/auth'
import { Api } from '@/api/index'
import jwt_decode from "jwt-decode";



const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'default',
    component: LoginView,
    children: [
      {
        //二级导航的路径不要加/
        path: 'homeIndex',
        name: 'homeIndex',
        meta: {
          keepAlive: true //此页面需要缓存
        },
        components: {
          default: DefaultView,
          homeIndex: DefaultView
        }
      },
      {
        //二级导航的路径不要加/
        path: 'qualification',
        name: 'qualification',
        meta: {
          keepAlive: true //此页面需要缓存
        },
        components: {
          default: QualificationView,
          qualification: QualificationView
        }

      },
      {
        //二级导航的路径不要加/
        path: 'user',
        name: 'user',
        meta: {
          keepAlive: true //此页面需要缓存
        },
        components: {
          default: UserView,
          user: UserView
        }

      },
      {
        //二级导航的路径不要加/
        path: 'qualificationForm',
        name: 'qualificationForm',
        meta: {
          keepAlive: true //此页面需要缓存
        },
        components: {
          default: QualificationFormView,
          qualificationForm: QualificationFormView
        }

      },
      {
        //二级导航的路径不要加/
        path: 'merchant',
        name: 'merchant',
        meta: {
          keepAlive: true //此页面需要缓存
        },
        components: {
          default: MerchantView,
          merchant: MerchantView
        }

      },
      {
        //二级导航的路径不要加/
        path: 'merchantForm',
        name: 'merchantForm',
        meta: {
          keepAlive: true //此页面需要缓存
        },
        components: {
          default: MerchantForm,
          merchantForm: MerchantForm
        }

      }, {
        //二级导航的路径不要加/
        path: 'merchantBankCardUpdateFormView/:merchantEntryId',
        name: 'merchantBankCardUpdateFormView',
        meta: {
          keepAlive: true //此页面需要缓存
        },
        components: {
          default: MerchantBankCardUpdateFormView,
          merchantBankCardUpdateFormView: MerchantBankCardUpdateFormView
        }

      }, {
        //二级导航的路径不要加/
        path: 'merchantDetail/:merchantEntryId',
        name: 'merchantDetail',
        meta: {
          keepAlive: true //此页面需要缓存
        },
        components: {
          default: MerchantDetail,
          merchantDetail: MerchantDetail
        }

      }, {
        //二级导航的路径不要加/
        path: 'menu',
        name: 'menu',
        meta: {
          keepAlive: true //此页面需要缓存
        },
        components: {
          default: MenuView,
          menu: MenuView
        }

      }, {
        //二级导航的路径不要加/
        path: 'systemRole',
        name: 'systemRole',
        meta: {
          keepAlive: true //此页面需要缓存
        },
        components: {
          default: SystemRoleView,
          systemRole: SystemRoleView
        }

      },


    ]
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})



router.beforeEach(async (to, from, next) => {
  next()
  // const token = getToken()
  // let hasToken = false
  // const api = new Api();
  // if (api.checkIsEmpty(token) == false) {
  //   const jwtData = jwt_decode(token) as any;
  //   const nowtime = new Date().getTime() / 1000

  //   if (nowtime < jwtData.exp) {
  //     hasToken = true
  //   }
  // }
  // if (hasToken) {
  //   //next()
  // } else {
  //   if (to.name === 'login') {
  //     next()
  //   } else {
  //     // next(`login`)
  //     next(`login`)
  //   }
  // }
})

export default router
