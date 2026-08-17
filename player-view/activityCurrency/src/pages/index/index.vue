<template>
  <view class="content">
    <view class="center-message">
      <text class="title">{{ message }}</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      message: '正在进行验证...',
      salesQRCodeId: null
    }
  },
  onLoad(options) {
    console.log('页面加载，接收到的参数:', options);

    // 尝试从 URL 参数中获取值（兼容 H5 环境）
    let code = options.code || this.getUrlParam('code');
    let state = options.state || this.getUrlParam('state');
    let salesQRCodeId = options.salesQRCodeId || this.getUrlParam('salesQRCodeId');

    console.log('解析后的参数 - code:', code, 'state:', state, 'salesQRCodeId:', salesQRCodeId);

    // 检查是否存在 code 和 state 参数（来自微信授权回调）
    if (code && state) {
      // 执行微信授权后的登录流程
      this.handleWechatAuthCallback(code, state);
    } else if (salesQRCodeId) {
      // 如果有 salesQRCodeId 参数，则跳转到微信授权链接
      this.salesQRCodeId = salesQRCodeId;
      console.log('接收到 salesQRCodeId:', this.salesQRCodeId);
      this.redirectToWechatAuth();
    } else {
      // 如果没有任何参数传入，直接提示用户重新扫描二维码
      console.log('没有任何参数传入，提示用户重新扫描二维码');
      this.message = '请重新扫描二维码进入';
    }
  },
  methods: {
    // 从 URL 中获取查询参数的方法
    getUrlParam(name) {
      if (typeof window !== 'undefined' && window.location) {
        // H5 环境
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
      } else {
        // App 环境（理论上不应该走到这里，因为 onLoad 应该已经接收到参数）
        return null;
      }
    },
    async handleWechatAuthCallback(code, state) {
      // 更新页面消息
      this.message = '正在登录...';

      try {
        // 导入 api 工具
        const api = await import('@/utils/api.js');

        // 发送登录请求
        const response = await api.default.post('/api/Auth/PlayerAuth', {
          code: code,
          salesQRCodeId: parseInt(state) // 将 state 转换为整数
        }, {
          header: {
            'Content-Type': 'application/json-patch+json'
          }
        });

        console.log('登录响应:', response);

        // 检查响应状态
        if (response.data && response.data.code === 200) {
          // 登录成功，临时保存 token 和 addressId 到 sessionStorage
          if (response.data.data && response.data.data.token) {
            // 使用 sessionStorage 临时保存，浏览器关闭时会自动清除
            if (typeof window !== 'undefined' && window.sessionStorage) {
              window.sessionStorage.setItem('token', response.data.data.token);
              window.sessionStorage.setItem('addressId', response.data.data.addressId.toString());
            } else {
              // 如果在非浏览器环境，仍然使用 uni.setStorageSync
              uni.setStorageSync('token', response.data.data.token);
              uni.setStorageSync('addressId', response.data.data.addressId);
            }
          }

          // 跳转到主页面，并传递 state 参数
          uni.navigateTo({
            url: `/pages/home/home?salesQRCodeId=${parseInt(state)}`
          });
        } else {
          // 登录失败，优先显示后端返回的具体错误信息，否则回退到通用提示
          console.error('登录失败:', response);
          this.message = (response.data && response.data.message) || '登录失败，请重试';
        }
      } catch (error) {
        console.error('登录请求出错:', error);
        this.message = '登录请求失败，请检查网络';
        // 可以在这里添加错误处理逻辑
      }
    },
    redirectToWechatAuth() {
      console.log('准备跳转到微信授权链接');
      console.log('当前平台:', uni.getSystemInfoSync().platform); 
      console.log('salesQRCodeId:', this.salesQRCodeId);

      // 构造微信授权链接
      const appid = 'wx7f23f819116cc247';
      const redirectUri = encodeURIComponent('https://www.huanxizn.com/activityCurrency/');
      const state = this.salesQRCodeId;
      const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=${state}&connect_redirect=1#wechat_redirect`;

      console.log('授权链接:', authUrl);

      // 根据平台选择合适的跳转方式
      // 检查是否在 H5 环境中（通过检查 window 对象是否存在）
      if (typeof window !== 'undefined' && window.location) {
        // H5 环境使用 window.location.href
        console.log('在H5环境跳转到外部链接');
        window.location.href = authUrl;
      } else {
        // App 环境使用 plus.runtime.openURL
        console.log('在App环境跳转到外部链接');
        plus.runtime.openURL(authUrl);
      }
    },
    performVerification() {
      // 检查存储中是否存在有效的 token（优先检查 sessionStorage，再检查 localStorage）
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

      if (token) {
        // 如果存在 token，认为用户已登录，直接跳转到主页面
        console.log('检测到有效 token，跳转到主页面');

        // 检查是否有 salesQRCodeId 参数需要传递
        let url = '/pages/home/home';
        if (this.salesQRCodeId) {
          url += `?salesQRCodeId=${this.salesQRCodeId}`;
        }

        uni.navigateTo({
          url: url
        });
      } else {
        // 如果不存在 token，提示用户登录已失效，需要重新扫码
        console.log('未检测到 token，提示用户登录已失效');
        this.message = '登录信息已失效，请重新扫描二维码';
        // 可以在这里添加更多引导用户的UI元素或操作
      }
    }
  },
}
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* 防止出现滚动条 */
  position: fixed; /* 固定页面位置 */
  top: 0;
  left: 0;
}

.center-message {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  text-align: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
