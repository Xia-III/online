import axios from "axios";
import { showToast } from 'vant';
import router from '../router'; // 直接引入 router 实例
import { delCookie } from './cookie.js'
import { useUserStore } from '../stores/pinia';

// 创建axios独立实例
const request3 = axios.create({
  baseURL: process.env.VUE_APP_API_BASE,
  timeout: 300000,
  headers: {
    Accept: 'application/json;charset=UTF-8'
  },
  withCredentials: true // 允许跨域时session id一致
});

// 获取token的函数
function getAuthToken() {
  const userStore = useUserStore();
  return userStore.token; // 返回当前 token
}

// 请求拦截器
request3.interceptors.request.use(config => {
  // 给请求添加token
  config.headers['Authorization'] = 'Bearer ' + `${getAuthToken()}`;
  return config;
}, e => Promise.reject(e));

// 响应拦截器
request3.interceptors.response.use(response => {
  // 处理错误码
  if (response.data.errCode == 2) {
    // 清除登录状态并跳转
    handleAuthError();
  }
  return response;
}, error => {
  // 处理HTTP错误状态码
  if (error && error.response) {
    switch (error.response.status) {
      case 401:
        // 处理未授权错误
        handleAuthError();
        console.error('未授权访问:', error);
        break;
      case 403:
        console.error('拒绝访问:', error);
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
    console.error('网络错误:', error);
    showToast("网络错误，请检查连接");
  } else {
    console.error('请求配置错误:', error);
    showToast(`请求配置错误：${error.message}`);
  }
  
  // 返回一个resolved的promise，防止错误继续传播
  return Promise.resolve({
    data: {
      success: false,
      message: error.message || '请求失败'
    }
  });
});

// 抽取处理授权错误的函数
function handleAuthError() {
  delCookie('token');
  const userStore = useUserStore();
  userStore.token = '';
  
  router.push({
    path: "/login",
    query: { redirect: router.currentRoute.value.fullPath }
  });
  showToast("登录已过期，请重新登录");
}

export default request3;
