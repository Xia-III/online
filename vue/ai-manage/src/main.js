import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// 引入pinia
import { createPinia } from 'pinia'
import piniaPluginPersist from 'pinia-plugin-persist'
const pinia = createPinia()

// 引入element-plus 核心库和样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'  // element-plus 样式文件

const app = createApp(App);
// pinia数据持久化插件：
pinia.use(piniaPluginPersist)

// h5rem适配
import 'amfe-flexible'

import './base/css/normalize.less'
/* 引入vant */
import Vant from 'vant'
import 'vant/lib/index.css';

// 将connection挂载，实现与服务器实时通讯
import connection from './utils/signalR'
app.config.globalProperties.$connection = connection

// 注册element-plus（新增）
app.use(ElementPlus)
// 原有注册
app.use(router).use(Vant).use(pinia).mount('#app')