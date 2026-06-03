const { defineConfig } = require('@vue/cli-service')
const path = require('path')
module.exports = defineConfig({
  outputDir: 'dist',
  filenameHashing: true,
  assetsDir: 'static',
  parallel: true,
  publicPath: './',
  transpileDependencies: true,
  lintOnSave: false,
  productionSourceMap: false,// 生产环境是否生成 sourceMap 文件,关闭防止源码泄漏
  configureWebpack: {
    devServer: {
      proxy: {
        '/v1': {
          target: 'http://120.26.123.36:8008', 
          changeOrigin: true, 
          pathRewrite: {
          },

        },
        '/api': {
          target: 'https://www.huanxizn.com', 
          changeOrigin: true,
          pathRewrite: {
            // 并将/api其重定向到 /PublicAccount/api
            '^/api': '/PublicAccount/api'
          }
        },
        '/q1': {
          target: 'http://120.26.123.36:5261',//http://localhost:5261 http://120.26.123.36:5261
          changeOrigin: true,
          pathRewrite: {
            '^/q1': '/api'
          }
        },

      }
    }

  }
}
)