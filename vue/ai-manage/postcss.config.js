module.exports = {
    plugins: {
        "autoprefixer": {},
        'postcss-pxtorem': {
            rootValue({ file }) { // 判断是否是vant的文件 如果是就使用 37.5为根节点字体大小
                // 否则使用75 因为vant使用的设计标准为375 但是市场现在的主流设置尺寸是750
                return file.indexOf('vant') !== -1 ? 37.5 : 75;
            },
            // replace: true,
            propList: ['*'],
            exclude: /node_modules/i,
        },
    },
};