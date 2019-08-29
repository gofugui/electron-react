'use strict'

process.env.BABEL_ENV = 'renderer'

const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const { dependencies } = require('../package.json')
const path = require('path');
const BabiliWebpackPlugin = require('babili-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
let whiteListedModules = ['React']

function resolve(relatedPath) {
    return path.join(__dirname, relatedPath)
}

let rendererConfig = {
    devtool: '#cheap-module-eval-source-map',
    entry:{
        renderer: resolve('../src/start.js'),
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '../dist/electron')
    },
    externals: [
        ...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))
    ],
    module:{
        rules:[
            {
                test: /\.js[x]?$/,
                enforce:'pre',
                exclude: /node_modules/,
                use: {
                    loader: 'eslint-loader',
                    options: {
                      formatter: require('eslint-friendly-formatter')
                    }
                },
                include: [resolve('../src')],
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.node$/,
                use: 'node-loader'
            },
            {
                test: /\.styl(us)?$/,
                use: [
                
                  'stylus-loader'
                ],
            },
            {
                test: /\.scss$/,
                use: ['css-loader', 'sass-loader']
            },
            {
                test: /\.sass$/,
                use: ['css-loader', 'sass-loader?indentedSyntax']
            },
            {
                test: /\.less$/,
                use: ['css-loader', 'less-loader']
            },
            {
                test: /\.css$/,
                use:['style-loader', 'css-loader']  
            },
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: {
                  loader: 'url-loader',
                  query: {
                    limit: 10000,
                    name: 'imgs/[name]--[folder].[ext]'
                  }
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                  limit: 10000,
                  name: 'media/[name]--[folder].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: {
                  loader: 'url-loader',
                  query: {
                    limit: 10000,
                    name: 'fonts/[name]--[folder].[ext]'
                  }
                }
            }
        ]
    },
    node: {
        __dirname: process.env.NODE_ENV !== 'production',
        __filename: process.env.NODE_ENV !== 'production'
      },
    optimization: {
        minimize: process.env.NODE_ENV === 'production' ? true : false, //是否进行代码压缩
        splitChunks: {
          chunks: "initial",
          minSize: 30000, //模块大于30k会被抽离到公共模块
          minChunks: 2, //模块出现1次就会被抽离到公共模块
          maxAsyncRequests: 5, //异步模块，一次最多只能被加载5个
          maxInitialRequests: 3, //入口模块最多只能加载3个
          name: true,
          cacheGroups: {
            default: {
              name : 'default',
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              name : 'vendors'
            }
          }
        },
        runtimeChunk:{
          name: "runtime"
        }
      },
    plugins:[
        new MiniCssExtractPlugin({filename: 'styles.css'}),
       
        new htmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, '../src/index.ejs'),
            minify: {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true
              },
            nodeModules: false
            
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],
    resolve: {
        alias: {
            '@': path.join(__dirname, '../src/renderer'),
            
        },
        extensions: ['.js', '.jsx', '.json', '.css', '.node']
    },
    target: 'electron-renderer'
}

/**
 * Adjust rendererConfig for development settings
 */
if (process.env.NODE_ENV !== 'production') {
    
    rendererConfig.plugins.push(
      new webpack.DefinePlugin({
        '__static': `"${path.join(__dirname, '../static').replace(/\\/g, '\\\\')}"`
      })
    )
}
  
/**
 * Adjust rendererConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
    rendererConfig.devtool = ''
    
    rendererConfig.plugins.push(
        new BabiliWebpackPlugin(),
        new CopyWebpackPlugin([
        {
            from: path.join(__dirname, '../static'),
            to: path.join(__dirname, '../dist/electron/static'),
            ignore: ['.*']
        }
        ]),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    )
}

module.exports = rendererConfig