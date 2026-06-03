/**
 * 请求和响应拦截器
 */

import { BASE_URL } from './request.js';

// 请求拦截器
function requestInterceptor(options) {
  // 获取存储的token
  const token = uni.getStorageSync('token');
  
  // 设置默认请求头
  options.header = {
    'Content-Type': 'application/json',
    ...options.header
  };
  
  // 如果有token，则添加到请求头
  if (token) {
    options.header['Authorization'] = `Bearer ${token}`;
  }
  
    // 不在拦截器中添加基础URL，因为这可能导致重复添加
  // 基础URL应该在具体的请求函数中处理

  return options;
}

// 响应拦截器
function responseInterceptor(response) {
  // 可以在这里统一处理响应
  // 例如：检查登录状态、错误处理等
  const statusCode = response.statusCode;

  if (statusCode === 401) {
    // Token过期或无效，跳转到登录页
    uni.showToast({
      title: '登录已过期，请重新登录',
      icon: 'none'
    });

    setTimeout(() => {
      uni.redirect({
        url: '/pages/index/index'
      });
    }, 1500);
  }

  return response;
}

// 注册拦截器
uni.addInterceptor('request', {
  invoke(args) {
    return requestInterceptor(args);
  }
});

uni.addInterceptor('uploadFile', {
  invoke(args) {
    return requestInterceptor(args);
  }
});

export { requestInterceptor, responseInterceptor };