// 网络请求的二次封装 - 使用axios.create()创建独立实例
import axios from "axios";
import { showToast } from 'vant';
import { useRouter } from "vue-router"
import { delCookie } from './cookie.js'

// 创建路由实例
const router = useRouter()

// 创建axios实例并配置基础参数
const request2 = axios.create({
    baseURL: process.env.VUE_APP_API_BASE,
    timeout: 300000, // 5分钟超时
    headers: {
        Accept: 'application/json;charset=UTF-8',
    },
    withCredentials: true // 允许跨域时携带cookie
})

// 固定API密钥
const apiKey = 'dataset-8Jm5kTTc8QJ4yPwFdMkvWbCA'

// 请求拦截器：添加请求头
request2.interceptors.request.use(
    config => {
        // 为当前实例的请求添加Authorization头
        config.headers['Authorization'] = `Bearer ${apiKey}`;
        return config;
    },
    error => {
        return Promise.reject(error);
    }
)

// 响应拦截器：处理响应和错误
request2.interceptors.response.use(
    response => {
        // 处理特定错误码（如登录失效）
        if (response.data.errCode === 2) {
            // 清除cookie（如果需要）
            delCookie();
            // 跳转到登录页并记录当前路径
            router.push({
                path: "/login",
                query: { redirect: router.currentRoute.value.fullPath } // 修复query拼写错误
            });
        }
        return response;
    },
    error => {
        // 处理不同状态码的错误提示
        if (error && error.response) {
            switch (error.response.status) {
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
            // 无响应（网络问题）
            showToast("网络错误，请检查连接");
        } else {
            // 请求配置错误
            showToast(`请求配置错误：${error.message}`); // 修复字符串拼接方式
        }
        return Promise.reject(error);
    }
)

// 导出实例供外部使用
export default request2;
