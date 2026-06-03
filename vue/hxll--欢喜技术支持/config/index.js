const path = require('path')

module.exports = {
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/portal/',  //项目的根目录 
    productionSourceMap: false,  //false打包不生成.map文件
    productionGzip: false,   //true  压缩率以及对加载会提升
    productionGzipExtensions: ['js', 'css'],
    bundleAnalyzerReport: process.env.npm_config_report
  },
  dev: {
    env: require('./dev.env'),
    port: 8090,
    autoOpenBrowser: true,
    assetsSubDirectory: 'static',
    assetsPublicPath: '/', 
    cssSourceMap: false
  }
}
