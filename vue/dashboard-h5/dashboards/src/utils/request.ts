
import axios from 'axios'
import { getToken, removeToken } from '@/utils/auth'
import { Toast } from 'vant'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 50000, // 请求超时时间
  withCredentials: true // 允许跨域时session id一致
})

//app.config.globalProperties.$axios = service;

// request拦截器
service.interceptors.request.use(
  config => {
    config.headers['Authorization'] = 'Bearer ' + getToken()
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    // debugger
    // const res = response.data

    // if (res.code !== 200) {
    //  // Notify(res.message || 'Error')

    //   //return Promise.reject(res.message || 'Error')
    //   return response
    // } else {
    //   return response
    // }

    return response
  },
  error => {

    try {


      // Unauthorized
      if (error.response.status === 401) {
        removeToken()
        location.reload()
      }
      else {
        error.message = "服务器异常";
      }
      // Notify(error)

    }
    catch (e) {
      // Toast('服务器异常');
      error.message = "服务器异常";
    }

    return Promise.reject(error)
  }
)

export default service

export interface IResp {
  code: number;
  message: string;
  data: any;
  totalCount: number;
}