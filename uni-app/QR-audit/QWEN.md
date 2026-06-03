# 项目上下文文件

## 技术栈
- **框架**: uni-app (Vue 3)
- **构建工具**: Vite
- **语言**: JavaScript
- **包管理器**: npm

## 开发约定
1. **页面路由**: 所有页面路径在 `src/pages.json` 中定义。
2. **请求拦截**: 所有 API 请求都会经过 `src/utils/interceptor.js` 中定义的拦截器处理。
3. **API 调用**: 推荐使用 `src/utils/request.js` 中封装的方法进行 API 调用。
4. **样式管理**: 全局样式定义在 `src/uni.scss` 中，各页面组件使用 scoped 样式或组件样式。

## 注意事项
- 项目中使用了 `uqrcodejs` 库生成二维码。
- `manifest.json` 中配置了各个平台的应用信息和权限设置。
- `vite.config.js` 中的代理配置主要用于开发环境下的 API 调试。