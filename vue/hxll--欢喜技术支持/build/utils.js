var path = require('path')
var config = require('../config')
var MiniCssExtractPlugin = require('mini-css-extract-plugin')

exports.assetsPath = function (_path) {
  var assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  var cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap,
      esModule: false  // 禁用 ES6 模块语法，使用 CommonJS 语法
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    var loaders = [cssLoader]

    if (loader) {
      // 针对less-loader进行特殊处理，确保兼容性
      if (loader === 'less') {
        loaders.push({
          loader: loader + '-loader',
          options: Object.assign({}, { sourceMap: options.sourceMap }, loaderOptions, {
            lessOptions: Object.assign({}, loaderOptions)
          })
        })
      } else {
        loaders.push({
          loader: loader + '-loader',
          options: Object.assign({}, loaderOptions, {
            sourceMap: options.sourceMap
          })
        })
      }
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return [MiniCssExtractPlugin.loader].concat(loaders)
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  var output = []
  var loaders = exports.cssLoaders(options)
  for (var extension in loaders) {
    var loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}
