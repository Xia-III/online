# uni-preset-vue-vite 项目上下文

## 项目概述

这是一个基于 `uni-app` 框架和 `Vite` 构建工具的前端项目模板（preset）。它使用 Vue 3 作为主要的前端框架，并集成了对多种小程序平台（如微信、支付宝、百度、头条等）、H5、快应用以及 HarmonyOS 的支持。

项目的核心技术栈包括：
- **框架**: [uni-app](https://uniapp.dcloud.io/) (基于 Vue 3)
- **构建工具**: [Vite](https://vitejs.dev/)
- **编程语言**: JavaScript (ES6+), Vue SFC (Single File Component)
- **样式**: CSS, 支持 `rpx` 单位用于响应式设计

## 项目结构

```
G:\Project\wxapp\uni-preset-vue-vite\
├── index.html          # Vite 入口 HTML 文件
├── package.json        # 项目依赖和脚本定义
├── vite.config.js      # Vite 配置文件
├── shims-uni.d.ts      # TypeScript 类型声明文件 (uni-app 相关)
├── src/                # 源代码目录
│   ├── main.js         # Vue 应用入口
│   ├── App.vue         # 根组件
│   ├── manifest.json   # uni-app 项目配置
│   ├── pages.json      # 页面路由配置
│   ├── uni.scss        # 全局 SCSS 变量和混合
│   ├── pages/          # 页面组件目录
│   │   └── index/
│   │       └── index.vue # 示例首页
│   └── static/         # 静态资源目录
│       └── logo.png
```

## 构建与运行

### 开发环境

项目提供了丰富的开发命令，通过 `npm run` 或 `yarn` 执行：

- **通用开发模式**: `npm run dev:custom`
- **H5 开发模式**: `npm run dev:h5` (默认)
- **H5 SSR 开发模式**: `npm run dev:h5:ssr`
- **各平台小程序开发模式**:
  - 微信: `npm run dev:mp-weixin`
  - 支付宝: `npm run dev:mp-alipay`
  - 百度: `npm run dev:mp-baidu`
  - 头条: `npm run dev:mp-toutiao`
  - QQ: `npm run dev:mp-qq`
  - 快手: `npm run dev:mp-kuaishou`
  - 飞书: `npm run dev:mp-lark`
  - 京东: `npm run dev:mp-jd`
  - 小红书: `npm run dev:mp-xhs`
  - HarmonyOS: `npm run dev:mp-harmony`
- **快应用开发模式**:
  - 通用: `npm run dev:quickapp-webview`
  - 华为: `npm run dev:quickapp-webview-huawei`
  - 联盟: `npm run dev:quickapp-webview-union`

### 生产构建

同样提供对应的构建命令来生成生产环境包：

- **通用构建**: `npm run build:custom`
- **H5 构建**: `npm run build:h5` (默认)
- **H5 SSR 构建**: `npm run build:h5:ssr`
- **各平台小程序构建**:
  - 微信: `npm run build:mp-weixin`
  - 支付宝: `npm run build:mp-alipay`
  - 百度: `npm run build:mp-baidu`
  - 头条: `npm run build:mp-toutiao`
  - QQ: `npm run build:mp-qq`
  - 快手: `npm run build:mp-kuaishou`
  - 飞书: `npm run build:mp-lark`
  - 京东: `npm run build:mp-jd`
  - 小红书: `npm run build:mp-xhs`
  - HarmonyOS: `npm run build:mp-harmony`
- **快应用构建**:
  - 通用: `npm run build:quickapp-webview`
  - 华为: `npm run build:quickapp-webview-huawei`
  - 联盟: `npm run build:quickapp-webview-union`

这些命令由 `@dcloudio/vite-plugin-uni` 插件驱动，该插件是 `uni-app` 官方提供的 Vite 插件，负责处理跨平台编译。

## 开发约定

- **页面路由**: 在 `src/pages.json` 中定义。
- **全局样式**: 在 `src/uni.scss` 中定义，可在任何 `.vue` 文件中直接使用。
- **静态资源**: 存放于 `src/static/` 目录下，可通过绝对路径 `/static/...` 引用。
- **组件**: 推荐使用 Vue 3 Composition API 和 SFC 格式。
- **平台特定逻辑**: 可以使用 `uni-app` 提供的条件编译语法来处理不同平台的差异。
- **类型检查**: 项目包含 `shims-uni.d.ts` 以提供 `uni-app` 相关的类型定义，方便在 TypeScript 环境下开发。

## 关键配置文件

- **`package.json`**: 定义了项目元数据、依赖项（`@dcloudio/uni-*` 系列包）和所有可用的开发/构建脚本。
- **`vite.config.js`**: 配置 Vite 构建行为，核心是引入并使用 `@dcloudio/vite-plugin-uni` 插件。
- **`src/manifest.json`**: 配置 `uni-app` 的全局设置，如应用名称、版本、各平台特定配置等。
- **`src/pages.json`**: 定义页面路由、窗口表现等。