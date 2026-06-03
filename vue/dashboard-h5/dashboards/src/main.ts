import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
// 引入这两个包
import "core-js";
import "regenerator-runtime/runtime";
import router from './router'
import store from './store'
import '@/utils/request'
import VueCookies from 'vue-cookies'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ArcoVue from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';
import registerDirectives from '@/utils/registerDirectives';
import emitter from '@/utils/emitter'

// 额外引入图标库
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
const app = createApp(App).use(store).use(router).use(VueCookies).use(ArcoVue).use(ArcoVueIcon).use(ElementPlus);
app.config.globalProperties.$router = router;
// 获取原型 
//.use(ElementPlus)
//按钮权限控制
registerDirectives(app);

import * as echarts from 'echarts'
import myjson from '@/assets/dark2.json';

// 注册主题
echarts.registerTheme('wonderland', myjson);
app.config.globalProperties.$echarts = echarts
import api, { Api } from '@/api/index'
app.use(api)
// declare module '@vue/runtime-core' {
//   interface ComponentCustomProperties {
//     //$notify: (a: NotifyMessage) => void;
//     //$toast: (a: string) => void;
//     //$dialog: any;
//     $api: Api;
//   }
// }



app.mount('#app')
