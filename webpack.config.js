const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: "production",
    entry: './src/custom-player.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'custom-player.js',
        library: 'SZPlayer', // 指定类库接口名，用于直接引用(比如script)
        libraryExport: "default", // 对外暴露default属性，就可以直接调用default里的属性
        globalObject: 'this', // 定义全局变量,兼容node和浏览器运行，避免出现"window is not defined"的情况
        libraryTarget: 'umd' // 定义打包方式Universal Module Definition,同时支持在CommonJS、AMD和全局变量使用
    },
    module: {
        rules: [{
            test: /\.js$/,
            include: [
                path.resolve(__dirname, 'src')
            ],
            exclude: path.resolve(__dirname, 'node_modules'),
            loader: "babel-loader",
        }]
    },
    plugins: [
        new webpack.ProvidePlugin({})
    ]
}