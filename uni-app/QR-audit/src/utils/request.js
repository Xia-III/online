/**
 * 统一请求处理工具
 */

// 基础URL配置
// 开发环境下使用代理（BASE_URL为空），生产环境下使用实际服务器地址
const isDev = process.env.NODE_ENV === 'development';
export const BASE_URL = 'https://www.huanxizn.com/Sales';

/**
 * 封装请求方法
 * @param {Object} options - 请求参数
 * @returns {Promise}
 */
function request(options) {
  return new Promise((resolve, reject) => {
    // 获取存储的token
    const token = uni.getStorageSync('token');
    
    // 设置默认请求头
    const headers = {
      'Content-Type': 'application/json',
      ...options.header
    };
    
    // 如果有token，则添加到请求头
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 发起请求
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: headers,
      success: (res) => {
        // 检查响应状态码
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          // 处理HTTP错误状态
          reject(res);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * GET请求
 * @param {String} url - 请求地址
 * @param {Object} data - 请求参数
 * @param {Object} header - 请求头
 * @returns {Promise}
 */
export function get(url, data = {}, header = {}) {
  return request({
    url,
    method: 'GET',
    data,
    header
  });
}

/**
 * POST请求
 * @param {String} url - 请求地址
 * @param {Object} data - 请求参数
 * @param {Object} header - 请求头
 * @returns {Promise}
 */
export function post(url, data = {}, header = {}) {
  return request({
    url,
    method: 'POST',
    data,
    header
  });
}

/**
 * PUT请求
 * @param {String} url - 请求地址
 * @param {Object} data - 请求参数
 * @param {Object} header - 请求头
 * @returns {Promise}
 */
export function put(url, data = {}, header = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    header
  });
}

/**
 * DELETE请求
 * @param {String} url - 请求地址
 * @param {Object} data - 请求参数
 * @param {Object} header - 请求头
 * @returns {Promise}
 */
export function del(url, data = {}, header = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    header
  });
}

/**
 * PATCH请求
 * @param {String} url - 请求地址
 * @param {Object} data - 请求参数
 * @param {Object} header - 请求头
 * @returns {Promise}
 */
export function patch(url, data = {}, header = {}) {
  return request({
    url,
    method: 'PATCH',
    data,
    header
  });
}