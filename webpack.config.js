const path = require('path')
const {
  NODE_ENV = 'development',
} = process.env

const WebpackShellPlugin = require('webpack-shell-plugin')
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: path.join(__dirname, './src/server.ts'),
  mode: 'development',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
      rules: [
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          test: /\.(ts|tsx)?$/,
          exclude: /(node_modules)/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: "../tsconfig.json"
            }
          }
        },
      ],
      
  },
  watch: NODE_ENV === 'development',
  plugins: [
    new WebpackShellPlugin({
      onBuildEnd: ['yarn run dev']
    })
  ]
}
