const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

const distDir = path.join(__dirname, 'dist')

function generateBase(stage) {
  return {
    mode: 'development',
    entry: './src/index.tsx',
    output: {
      filename: '[name].[fullhash].' + Math.floor(Date.now() / 60000) + '.js',
      path: distDir,
      publicPath: '/',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json', '.css'],
      alias: {
        configuration: path.join(__dirname, 'config', stage),
      },
      fallback: { events: require.resolve('events/') },
    },
    module: {
      rules: [
        { test: /\.tsx?$/, loader: 'swc-loader', exclude: /node_modules/ },
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
        { test: /\.(png|jpeg|svg)/, type: 'asset/resource' },
        { test: /\.ne$/, use: ['@leetcode/nearley-loader'] },
      ],
    },
    devServer: {
      compress: true,
      host: '0.0.0.0',
      hot: true,
      historyApiFallback: true,
    },
    devtool: 'eval-source-map',
    plugins: [
      new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '')
      }),
      new HtmlWebpackPlugin({
        template: 'src/index.html',
        favicon: 'src/icon.svg',
      }),
    ],
  }
}

module.exports = generateBase
