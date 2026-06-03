<template>
    <div class="login-page">
        <div class="login-container">
            <!-- Logo 区域 -->
            <div class="logo-section">
                <div class="logo-placeholder">
                    <van-icon name="manager-o" size="40" color="#fff" />
                </div>
                <h1 class="title">欢喜技术支持</h1>
                <p class="subtitle">管理后台登录</p>
            </div>

            <!-- 登录表单 -->
            <div class="login-form">
                <van-field 
                    v-model="formData.username"
                    name="username"
                    label="用户名"
                    placeholder="请输入用户名"
                    required
                    clearable
                    :error-message="errors.username"
                >
                    <template #left-icon>
                        <van-icon name="manager" size="20" color="#1989fa" />
                    </template>
                </van-field>

                <van-field
                    v-model="formData.password"
                    type="password"
                    name="password"
                    label="密码"
                    placeholder="请输入密码"
                    required
                    :error-message="errors.password"
                    right-icon="eye-o"
                    @click-right-icon="togglePasswordVisible"
                >
                    <template #left-icon>
                        <van-icon name="lock" size="20" color="#1989fa" />
                    </template>
                </van-field>

                <div class="official-website-link">
                    <a @click="goToOfficialWebsite">前往官网</a>
                </div>

                <div class="login-button">
                    <van-button
                        type="primary"
                        block
                        round
                        :loading="loading"
                        loading-text="登录中..."
                        @click="onLogin"
                    >
                        登录
                    </van-button>
                </div>
            </div>

            <!-- 底部信息 -->
            <div class="footer-text">
                <p>© 2026 欢喜技术支持。All Rights Reserved.</p>
            </div>
        </div>
    </div>
</template>

<script>
import request1 from '@/utils/request1'
import { Toast } from 'vant'

export default {
    name: 'Login',
    data() {
        return {
            formData: {
                username: '',
                password: ''
            },
            errors: {
                username: '',
                password: ''
            },
            loading: false,
            passwordVisible: false
        }
    },
    methods: {
        // 切换密码可见
        togglePasswordVisible() {
            this.passwordVisible = !this.passwordVisible
        },

        // 验证表单
        validateForm() {
            let isValid = true
            this.errors = {}

            if (!this.formData.username || !this.formData.username.trim()) {
                this.errors.username = '请输入用户名'
                isValid = false
            }

            if (!this.formData.password) {
                this.errors.password = '请输入密码'
                isValid = false
            }

            return isValid
        },

        // 前往官网
        goToOfficialWebsite() {
            this.$router.push('/')
        },

        // 登录
        onLogin() {
            // 验证表单
            if (!this.validateForm()) {
                return
            }

            this.loading = true

            // 调用登录 API
            request1.post(`api/HXLL/Login?username=${encodeURIComponent(this.formData.username.trim())}&password=${encodeURIComponent(this.formData.password)}`, {})
            .then(res => {
                this.loading = false
                if (res.data.code === 0 || res.data.code === 200) {
                    Toast.success('登录成功')
                    // 保存 token 到 localStorage
                    if (res.data.data) {
                        localStorage.setItem('token', res.data.data)
                    }
                    // 跳转到产品管理页面
                    this.$router.push('/productManager')
                } else {
                    Toast.fail(res.data.msg || '登录失败')
                }
            })
            .catch(err => {
                this.loading = false
                console.error('登录失败:', err)
                Toast.fail('登录失败，请检查网络连接')
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.login-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.login-container {
    width: 100%;
    max-width: 400px;
    margin-bottom: 60px;
    background: #fff;
    border-radius: 16px;
    padding: 40px 30px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.logo-section {
    text-align: center;
    margin-bottom: 30px;

    .logo-placeholder {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 15px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .title {
        font-size: 24px;
        font-weight: 600;
        color: #333;
        margin: 0 0 8px 0;
    }

    .subtitle {
        font-size: 14px;
        color: #999;
        margin: 0;
    }
}

.login-form {
    .van-field {
        margin-bottom: 20px;
        background-color: #f7f8fa;
        border-radius: 8px;
        padding: 0 15px;
    }
}

.official-website-link {
    text-align: left;
    margin-top: -10px;
    margin-bottom: 20px;

    a {
        color: #667eea;
        font-size: 14px;
        cursor: pointer;
        text-decoration: underline;

        &:hover {
            opacity: 0.8;
        }
    }
}

.login-button {
    margin-top: 30px;

    .van-button {
        height: 48px;
        font-size: 16px;
        font-weight: 600;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
    }
}

.footer-text {
    margin-top: 30px;
    text-align: center;

    p {
        font-size: 12px;
        color: #999;
        margin: 0;
    }
}
</style>
