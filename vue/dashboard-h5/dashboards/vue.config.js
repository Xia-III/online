const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  //打包后是否生成map文件，map文件能看到错误代码位置，设置为false不生成map文件，打包体积缩小
   productionSourceMap: false,   
    outputDir: 'dashboards',
    indexPath: 'index.html',
    lintOnSave: false,
    transpileDependencies: true,

})
