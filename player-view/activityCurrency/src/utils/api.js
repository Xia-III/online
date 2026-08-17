// api.js - 统一请求管理及拦截器
// 基础URL配置
// 开发环境下使用代理（BASE_URL为空），生产环境下使用实际服务器地址
const isDev = process.env.NODE_ENV === 'development';
export const BASE_URL = isDev ? '' : 'https://www.huanxizn.com/Sales';

// 请求拦截器
const requestInterceptor = {
  // 请求发送前的拦截
  invoke: (config) => {
    // 从存储中获取 token（优先检查 sessionStorage，再检查 localStorage）
    let token;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      // 浏览器环境，优先检查 sessionStorage
      token = window.sessionStorage.getItem('token');
      if (!token) {
        // 如果 sessionStorage 中没有，再检查 localStorage
        token = uni.getStorageSync('token');
      }
    } else {
      // 非浏览器环境，使用 uni.storage
      token = uni.getStorageSync('token');
    }

    // 如果存在 token，则在请求头中添加
    if (token) {
      config.header = {
        ...config.header,
        'Authorization': `Bearer ${token}`, // 或者根据实际需求使用其他字段名
      };
    }

    // 添加基础URL
    if (BASE_URL && !config.url.startsWith('http')) {
      config.url = BASE_URL + config.url;
    }

    // 返回修改后的配置
    return config;
  }
};

// 封装请求方法
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 设置默认配置
    const config = {
      url: options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: options.header || {},
      dataType: options.dataType || 'json',
      responseType: options.responseType || 'text',
    };

    // 应用请求拦截器
    const interceptedConfig = requestInterceptor.invoke(config);

    // 发起请求
    uni.request({
      ...interceptedConfig,
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// 导出封装的请求方法和其他 HTTP 方法快捷方式
export default {
  request,
  get: (url, data, options = {}) => request({ url, method: 'GET', data, ...options }),
  post: (url, data, options = {}) => request({ url, method: 'POST', data, ...options }),
  put: (url, data, options = {}) => request({ url, method: 'PUT', data, ...options }),
  delete: (url, data, options = {}) => request({ url, method: 'DELETE', data, ...options }),
};