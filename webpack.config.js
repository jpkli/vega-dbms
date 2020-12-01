const path = require('path')
const {
  NODE_ENV = 'development',
  port
} = process.env

const WebpackShellPlugin = require('webpack-shell-plugin')
const nodeExternals = require('webpack-node-externals')

const rules = [
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
  {
    // Include ts, tsx, js, and jsx files.
    test: /\.(ts|js)x?$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
  },
]

const frontendConfig = {
  entry: ['babel-polyfill', path.join(__dirname, './src/demo.ts')],
  target: 'web',
  mode: 'development',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'demo.js'
  },
  resolve: {
    extensions: ['.ts', 'tsx', '.js', 'jsx', '.json'],
  },
  module: {
      rules
  },
  watch: NODE_ENV === 'development',
  // devServer: {
  //   contentBase: path.join(__dirname, 'public'),
  //   watchContentBase: true, 
  //   hot: true,
  //   proxy: [ // allows redirect of requests to webpack-dev-server to another destination
  //     {
  //       context: ['/dbms', '/api', '/query'], 
  //       target: `http://localhost:${port}`,
  //       secure: false,
  //     },
  //   ],
  //   port: 3030,
  // }
}

const backendConfig = {
  entry: path.join(__dirname, './src/server.ts'),
  mode: 'development',
  target: 'node',
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'server.js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [{
      test: /\.(ts|tsx)?$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          configFile: "../tsconfig.json"
        }
      }
    }],
  },
  watch: NODE_ENV === 'development',
  plugins: [
    new WebpackShellPlugin({
      onBuildEnd: ['yarn run start-server-dev']
    })
  ]
}

module.exports = [backendConfig, frontendConfig]
