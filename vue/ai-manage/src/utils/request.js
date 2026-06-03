// 网络请求的二次封装 - 使用axios.create()创建独立实例
import axios from "axios";
import { showToast } from 'vant';
import { useRouter } from "vue-router"
import { delCookie } from './cookie.js'

// 创建路由实例（注意：在非组件环境中使用需确保路由已初始化）
const router = useRouter()

// 创建axios实例
const request = axios.create({
    baseURL: process.env.VUE_APP_API_BASE,
    timeout: 300000,
    headers: {
        Accept: 'application/json;charset=UTF-8'
    },
    withCredentials: true // 允许跨域时session id一致
})

const apiKey = 'app-xPJ41Pa0JlFZm0NzzvgS9l3b'

// 请求拦截器
request.interceptors.request.use(config => {
    // 给当前实例添加Authorization头
    config.headers['Authorization'] = 'Bearer ' + `${apiKey}`;
    return config
}, e => Promise.reject(e))

// 响应拦截器
request.interceptors.response.use(response => {
    if (response.data.errCode == 2) {
        // 这里修复了query的拼写错误
        router.push({
            path: "/login",
            query: { redirect: router.currentRoute.value.fullPath }//从哪个页面跳转
        })
    }
    return response;
}, error => {
    if (error && error.response) {
        switch (error.response.status) {  //处理状态码
            case 400:
                showToast("错误请求");
                break;
            case 403:
                showToast("拒绝访问");
                break;
            case 404:
                showToast("请求错误，未找到该资源");
                break;
            case 405:
                showToast("请求方法未允许");
                break;
            case 408:
                showToast("请求超时，请检查您的网络，然后刷新试试！");
                break;
            case 500:
                showToast("服务器端重启中");
                break;
            case 501:
                showToast("网络未实现");
                break;
            case 502:
                showToast("网络错误");
                break;
            case 505:
                showToast("http版本不支持该请求");
                break;
            default:
                showToast("链接错误");
        }
    } else if (error.request) {
        // 请求已发送但无相应（网络问题）
        showToast("网络错误，请检查连接");
    } else {
        // 请求配置错误（如url格式错误）
        showToast(`请求配置错误：${error.message}`);
    }
    return Promise.reject(error)
})

export default request
