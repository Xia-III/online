<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration"></div>
    <div class="bg-decoration-left"></div>
    <div class="bg-decoration-right"></div>
    
    <div class="login-container">
      <!-- 登录卡片 -->
      <div class="login-card">
        <!-- 头部Logo和标题 -->
        <div class="login-header">
          <div class="logo-wrapper">
            <van-icon name="lock" size="50" color="#1677ff" />
          </div>
          <h1 class="app-title">后台管理系统</h1>
          <p class="slogan">欢迎回来，请登录您的账号</p>
        </div>
        
        <!-- 登录表单 -->
        <van-form @submit="onSubmit" class="login-form">
          <!-- 用户名输入 -->
          <van-field
            v-model="accountNumber"
            name="accountNumber"
            placeholder="请输入账号"
            :rules="[{ required: true, message: '请填写账号' }]"
            clearable
            class="form-field"
          >
            <template #left-icon>
              <van-icon name="user" size="26" color="#86909c" />
            </template>
          </van-field>
          
          <!-- 密码输入 -->
          <van-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
            clearable
            class="form-field"
          >
            <template #left-icon>
              <van-icon name="lock" size="26" color="#86909c" />
            </template>
            <template #right-icon>
              <van-icon 
                :name="showPassword ? 'eye-o' : 'eye-close-o'" 
                size="26" 
                color="#86909c"
                @click.stop="showPassword = !showPassword"  
              />
            </template>
          </van-field>
          
          
          <!-- 登录按钮 -->
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            class="login-btn"
          >
            登录
          </van-button>
        
        </van-form>
        
        <!-- 注册链接 -->
        <!-- <div class="register-section">
          <span>还没有账号?</span>
          <van-button 
            type="text" 
            color="#1677ff" 
            @click="handleRegister"
            class="register-btn"
          >
            立即注册
          </van-button>
        </div> -->
      </div>
      
      <!-- 页脚信息 -->
      <div class="footer">
        <p>
          <a href="https://beian.miit.gov.cn" target="_blank" class="beian-link">
            粤ICP备2023017957号-1
          </a>
        </p>
        <p>广州欢喜莲莲信息科技服务有限公司</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { loginAPI, getUserInfoAPI } from '../api/index';
import { useUserStore } from '../stores/pinia';


// 路由实例
const router = useRouter();
// 用户store
const userStore = useUserStore();

// 表单数据
const accountNumber = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);

// 处理登录提交
const onSubmit = async () => {
  loading.value = true;
  
  try {
    // 调用登录API
    const res = await loginAPI({
      accountNumber: accountNumber.value,
      password: password.value
    });
    
    // 检查返回结果
    if (res.data.code === 0 && res.data.data) {
      // 登录成功，保存token到pinia
      userStore.setToken(res.data.data);
      // 获取用户信息
      const userInfoRes = await getUserInfoAPI();
      if (userInfoRes.data.code === 0 && userInfoRes.data.data) {
        // 登录成功，保存用户信息到pinia
        userStore.setUserInfo(userInfoRes.data.data);
      }
      //清空表单数据
      accountNumber.value = '';
      password.value = '';
      // 提示成功
      showToast({
        type: 'success',
        message: '登录成功',
        duration: 1500,
        onClose: () => {
          // 跳转到首页
          router.push('/manage/databaseManage');
        }
      });
    }
    else {
      // 登录失败
      showToast({
        type: 'fail',
        message: res.data.msg || '登录失败，请检查账号密码',
        duration: 2000
      });
    }
  } catch (error) {
    // 登录失败处理
    showToast({
      type: 'fail',
      message: '登录失败，请检查网络连接',
      duration: 2000
    });
    console.error('登录错误:', error);
  } finally {
    loading.value = false;
  }
};


// 前往注册
const handleRegister = () => {
  router.push('/register');
};
</script>

<style scoped lang="less">
/* 样式部分保持不变 */
// 基础样式保持不变，移动端优先
.login-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  position: relative;
  padding: 20px;
  
  .bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 350px;
    background: linear-gradient(135deg, #1677ff 0%, #0a58ca 100%);
    border-radius: 0 0 50% 50% / 20%;
    z-index: 1;
  }
  
  // 左右装饰，默认隐藏，仅在PC端显示
  .bg-decoration-left, .bg-decoration-right {
    display: none;
    position: absolute;
    top: 50%;
    width: 30%;
    height: 60%;
    background: linear-gradient(135deg, rgba(22, 119, 255, 0.05) 0%, rgba(10, 88, 202, 0.05) 100%);
    z-index: 1;
  }
  
  .bg-decoration-left {
    left: 0;
    transform: translateY(-50%) rotate(15deg);
    border-radius: 0 50% 50% 0;
  }
  
  .bg-decoration-right {
    right: 0;
    transform: translateY(-50%) rotate(-15deg);
    border-radius: 50% 0 0 50%;
  }
}

.login-container {
  position: relative;
  z-index: 2;
  max-width: 560px;
  margin: 0 auto;
  padding-top: 200px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-sizing: border-box;
}

.login-card {
  background-color: #fff;
  border-radius: 20px;
  padding: 70px 50px; /* 移动端内边距保持不变 */
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.15);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 60px;
  
  .logo-wrapper {
    width: 120px;
    height: 120px;
    background-color: rgba(22, 119, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 30px;
  }
  
  .app-title {
    font-size: 32px;
    font-weight: 600;
    color: #1d2129;
    margin: 0 0 15px;
  }
  
  .slogan {
    font-size: 22px;
    color: #86909c;
    margin: 0;
  }
}

.login-form {
  .form-field {
    margin-bottom: 28px;
    --van-field-input-height: 66px;
    --van-field-font-size: 18px;
    
    &::v-deep(.van-field__control) {
      padding-left: 15px;
    }
  }
  
  
  .login-btn {
    height: 66px;
    font-size: 20px;
    --van-button-primary-background: linear-gradient(90deg, #1677ff, #0a58ca);
    --van-button-primary-hover-background: linear-gradient(90deg, #0a58ca, #1677ff);
    margin-bottom: 38px;
    transition: all 0.3s ease;
  }
}

.register-section {
  text-align: center;
  margin-top: 38px;
  font-size: 22px;
  color: #86909c;
  
  .register-btn {
    padding: 0 6px;
    height: auto;
    font-size: 22px;
  }
}

.footer {
  margin-top: auto;
  padding: 35px 0;
  text-align: center;
  font-size: 20px;
  color: #86909c;
  
  p {
    margin: 5px 0;
  }
  
  .beian-link {
    color: #86909c;
    text-decoration: none;
    
    &:hover {
      color: #1677ff;
      text-decoration: underline;
    }
  }
}

// PC端适配样式 (屏幕宽度 >= 1024px) - 相比之前缩小40%
@media screen and (min-width: 1024px) {
  .login-page {
    padding: 0;
    
    .bg-decoration {
      height: 300px; /* 适当降低背景装饰高度，保持比例 */
    }
    
    // 显示左右装饰元素
    .bg-decoration-left, .bg-decoration-right {
      display: block;
    }
  }
  
  .login-container {
    max-width: 300px; /* 相比之前的500px缩小40% */
    padding-top: 100px; /* 调整顶部距离 */
  }
  
  .login-card {
    padding: 30px 24px; /* 相比之前的50px 40px缩小40% */
    border-radius: 12px; /* 按比例缩小圆角 */
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
    }
  }
  
  .login-header {
    margin-bottom: 30px; /* 相比之前的50px缩小40% */
    
    .logo-wrapper {
      width: 60px; /* 相比之前的100px缩小40% */
      height: 60px;
      margin-bottom: 15px; /* 按比例缩小间距 */
    }
    
    .app-title {
      font-size: 17px; /* 相比之前的28px缩小40% */
    }
    
    .slogan {
      font-size: 12px; /* 相比之前的20px缩小40% */
    }
  }
  
  .login-form {
    .form-field {
      margin-bottom: 15px; /* 相比之前的25px缩小40% */
      --van-field-input-height: 36px; /* 相比之前的60px缩小40% */
      --van-field-font-size: 10px; /* 按比例缩小字体 */
    }
    
    .login-btn {
      height: 36px; /* 相比之前的60px缩小40% */
      font-size: 11px; /* 按比例缩小字体 */
      margin-bottom: 18px; /* 相比之前的30px缩小40% */
    }
  }
  
  .footer {
    padding: 18px 0; /* 相比之前的30px缩小40% */
    font-size: 11px; /* 按比例缩小字体 */
  }
}

// 超大型屏幕适配 (屏幕宽度 >= 1440px)
@media screen and (min-width: 1440px) {
  .login-page {
    .bg-decoration {
      height: 350px;
    }
  }
  
  .login-container {
    max-width: 320px;
    padding-top: 120px;
  }
  
  .login-card {
    padding: 36px 30px; /* 按比例调整超大屏幕的内边距 */
  }
}
</style>
