import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { getStorageExpire } from '../utils/storage'
import Index from '../views/index.vue'
import Login from '../views/login.vue'

const routes = [
  {
    path: '',
    redirect: 'index',
    meta: {
      title: '在线客服'
    }
  },
  {
    path: '/index',
    name: 'index',
    component: Index,
    meta: {
      title: "在线客服"
    }
  },
  {
    path: '/manage',
    redirect: 'login',
    meta: {
      title: '在线客服'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: "登录"
    }
  },
  {
    path: '/manage/databaseManage',
    component: () => import('@/views/manage/databaseManage.vue'),
    meta: {
      title: '知识库管理'
    }
  },
  {
    path: '/manage/apply',
    component: () => import('@/views/manage/apply.vue'),
    meta: {
      title: '管理员申请'
    }
  },
  {
    path: '/manage/audit',
    component: () => import('@/views/manage/audit.vue'),
    meta: {
      title: '审核管理'
    }
  },
  {
    path: '/manage/personalCenter',
    component: () => import('@/views/manage/personalCenter.vue'),
    meta: {
      title: '个人中心'
    }
  },
  {
    path: '/manage/template',
    component: () => import('@/views/manage/template.vue'),
    meta: {
      title: '模板管理'
    }
  },
  {
    path: '/manage/knowledge',
    component: () => import('@/views/manage/knowledge.vue'),
    meta: {
      title: '知识库'
    }
  },
  {
    path: '/manage/knowledge/:id',  // 修改为动态路由
    component: () => import('@/views/manage/knowledge.vue'),
    meta: {
      title: '知识库'
    }
  },
  {
    path: '/manage/knowledge/:id/document/:document_id',  // 修改为动态路由
    component: () => import('@/views/manage/segments.vue'),
    meta: {
      title: '知识库'
    }
  },

]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  // 根据路由的 meta 信息设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  } else {
    document.title = '知识库管理系统'  // 设置默认标题

  }
  next()
})

export default router
