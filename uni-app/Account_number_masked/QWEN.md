# uni-preset-vue-vite 项目上下文

## 项目概述

这是一个基于 uni-app 框架的多端应用项目，使用 Vue 3 作为主要的前端框架，并采用 Vite 作为构建工具。该项目旨在使用一套代码开发可在多个平台运行的应用，包括 H5、微信小程序、支付宝小程序、百度小程序、快应用等多个平台。

项目实现了一个完整的用户认证系统，包含登录、用户信息获取、页面导航和退出登录等功能。项目使用了现代化的前端技术栈，包括 Vue 3、Vite 构建工具以及 uni-app 的跨平台能力。

## 项目结构

```
G:\Project\uni-app\uni-preset-vue-vite\
├───.gitignore
├───index.html
├───package.json
├───shims-uni.d.ts
├───vite.config.js
└───src\
    ├───App.vue
    ├───main.js
    ├───manifest.json
    ├───pages.json
    ├───shime-uni.d.ts
    ├───uni.scss
    ├───pages\
    │   ├───index\
    │   │   └───index.vue (登录页面)
    │   └───main\ (主页面子包)
    │       ├───main.vue (主页面)
    │       ├───feature.vue (功能页面)
    │       └───profile.vue (个人资料页面)
    ├───static\ (静态资源)
    │   └───logo.jpg
    └───utils\ (工具函数)
        ├───interceptor.js (请求/响应拦截器)
        └───request.js (统一请求处理工具)
```

## 核心文件说明

- `package.json`: 项目依赖和脚本配置文件，定义了开发和生产环境所需的依赖包以及各种构建和开发命令。
- `vite.config.js`: Vite 构建工具的配置文件，集成了 `@dcloudio/vite-plugin-uni` 插件以支持 uni-app 的编译，并配置了 API 代理。
- `src/main.js`: 应用的入口文件，使用 `createSSRApp` 创建 Vue 应用实例，并注册了请求和响应拦截器。
- `src/App.vue`: 应用的根组件，定义了应用级别的生命周期函数。
- `src/pages.json`: uni-app 的页面配置文件，定义了应用的页面路径和窗口表现，包含启动页和子包配置。
- `src/manifest.json`: 应用的 manifest 配置文件，定义了应用的基本信息和各平台的特定配置。
- `src/uni.scss`: uni-app 内置的常用样式变量文件，用于统一项目样式。

## 页面功能说明

### 登录页面 (`src/pages/index/index.vue`)
- 用户登录界面，包含账号和密码输入框
- 登录成功后跳转到主页面
- 包含登录验证逻辑和错误提示

### 主页面 (`src/pages/main/main.vue`)
- 应用的主页面，包含欢迎信息
- 底部导航栏，支持在功能和个人页面之间切换
- 检查登录状态，无token时跳转回登录页

### 功能页面 (`src/pages/main/feature.vue`)
- 展示应用功能列表
- 提供退出登录按钮
- 包含底部导航栏

### 个人资料页面 (`src/pages/main/profile.vue`)
- 显示用户详细信息（用户ID、账号、昵称、身份）
- 根据用户角色显示不同身份名称
- 提供退出登录按钮

## 工具函数

### 请求拦截器 (`src/utils/interceptor.js`)
- 自动在请求头中添加 Authorization token
- 统一处理请求参数
- 响应拦截器处理 401 状态码（跳转到登录页）

### 统一请求处理 (`src/utils/request.js`)
- 封装了 GET、POST、PUT、DELETE 等常用请求方法
- 自动添加 token 到请求头
- 统一处理请求错误

## 构建和运行

### 开发模式

- `npm run dev:h5`: 启动 H5 平台的开发服务器
- `npm run dev:mp-weixin`: 启动微信小程序平台的开发模式
- `npm run dev:mp-alipay`: 启动支付宝小程序平台的开发模式
- `npm run dev:mp-baidu`: 启动百度小程序平台的开发模式
- 其他平台的开发命令格式为 `npm run dev:[平台名称]`

### 生产构建

- `npm run build:h5`: 构建 H5 平台的生产版本
- `npm run build:mp-weixin`: 构建微信小程序平台的生产版本
- `npm run build:mp-alipay`: 构建支付宝小程序平台的生产版本
- `npm run build:mp-baidu`: 构建百度小程序平台的生产版本
- 其他平台的构建命令格式为 `npm run build:[平台名称]`

## 依赖

- `vue`: Vue.js 框架（版本 ^3.4.21）
- `@dcloudio/uni-app`: uni-app 核心库
- `@dcloudio/vite-plugin-uni`: 用于 Vite 的 uni-app 插件
- `vite`: 构建工具（版本 5.2.8）
- `vue-i18n`: Vue 国际化支持

## 开发约定

- 使用 Vue 3 的 Composition API 或 Options API 进行组件开发
- 遵循 uni-app 的多端开发规范
- 使用 `pages.json` 进行页面路由配置
- 使用 `rpx` 单位进行响应式布局
- 使用统一的请求处理工具进行 API 调用
- 在请求拦截器中自动处理认证 token

## API 代理配置

在 `vite.config.js` 中配置了 API 代理，将 `/api` 路径的请求代理到 `http://localhost:5262`，方便开发环境下的 API 调试。

## 用户认证流程

1. 用户在登录页面输入账号和密码
2. 发送登录请求到 `/api/User/Login`
3. 登录成功后，将返回的 token 存储在本地存储中
4. 各页面通过请求拦截器自动在请求头中添加 token
5. 退出登录时清除本地存储的 token 并跳转到登录页面
6. 无有效 token 时自动跳转到登录页面