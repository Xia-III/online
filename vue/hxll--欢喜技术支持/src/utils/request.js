import axios from "axios";
import { Toast } from 'vant';
import router from '@/router';
import { delCookie } from './cookie.js'; // 自定义清除 cookie 的方法

// 创建独立的 axios 实例
const server = axios.create({
    baseURL: "https://www.huanxizn.com/publicaccount", 
    timeout: 30 * 1000,
    headers: {
        Accept: 'application/json;charset=UTF-8',
        companyCode: 'HXLL'
    },
    withCredentials: true // 允许跨域时 session id 一致
});

// 请求拦截器：处理 token 添加
server.interceptors.request.use(config => {
    if (localStorage.getItem('token')) { // 判断 token 是否存在
        config.headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');  // 将 token 设置到请求头
    }

    return config;
}, e => Promise.reject(e));

// 响应拦截器：处理响应的逻辑
server.interceptors.response.use(response => {
    if (response.data.errCode === 2) {
        router.push({
            path: "/login",
            query: { redirect: router.currentRoute.fullPath } // 从当前路由跳转到登录页
        });
    }
    return response;
}, error => {
    if (error && error.response) {
        switch (error.response.status) {
            case 400:
                Toast.fail("错误请求");
                break;
            case 401:
                Toast.fail("未授权，请重新登录");
                sessionStorage.clear();
                delCookie('username');
                router.push({
                    path: "/login",
                });
                break;
            case 403:
                Toast.fail("拒绝访问");
                break;
            case 404:
                Toast.fail("请求错误，未找到该资源");
                break;
            case 405:
                Toast.fail("请求方法未允许");
                break;
            case 408:
                Toast.fail("请求超时，请检查您的网络，然后刷新试试！");
                break;
            case 500:
                Toast.fail("服务器端出错");
                break;
            case 501:
                Toast.fail("网络未实现");
                break;
            case 502:
                Toast.fail("网络错误");
                break;
            case 505:
                Toast.fail("http版本不支持该请求");
                break;
            default:
                Toast.fail("链接错误");
        }
    } else {
        Toast.fail("网络出现问题，请稍后再试");
    }
    return Promise.reject(error);
});
// 添加响应拦截器
// axios.interceptors.response.use(
//     function (response) {
//         // 响应数据处理
//         if (response.data.code !== 200) {
//             // 如果 code 不为 200，统一处理错误提示
//             console.error('错误信息:', response.data.message);
//             return Promise.reject(response.data.message);
//         }
//         return response.data;
//     },
//     function (error) {
//         // 响应错误处理
//         console.error('响应错误:', error);
//         return Promise.reject(error);
//     }
// );
/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */

export function fetch(url, params = {}) {
    return new Promise((resolve, reject) => {
        server.get(url, {
            params: params
        })
            .then(response => {
                resolve(response.data);
            })
            .catch(err => {
                reject(err)
            })
    })
}


/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function post(url, data = {}) {
    return new Promise((resolve, reject) => {
        server.post(url, data)
            .then(response => {
                resolve(response.data);
            }, err => {
                reject(err)
            })
    })
}

export default server;
