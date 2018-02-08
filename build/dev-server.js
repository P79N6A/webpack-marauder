'use strict'

process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

process.on('unhandledRejection', err => {
  throw err
})

const config = require('../config')
const { getFreePort } = require('../libs/utils')
const getEntry = require('../libs/entry')
const maraConf = require(config.paths.marauder)

// 是否为交互模式
const isInteractive = process.stdout.isTTY

const webpack = require('webpack')
const clearConsole = require('react-dev-utils/clearConsole')
const openBrowser = require('react-dev-utils/openBrowser')
const DevServer = require('webpack-dev-server')
const getWebpackConfig = require('../webpack/webpack.dev.conf')
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || config.dev.port

const protocol = maraConf.https === true ? 'https' : 'http'

// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
const proxyTable = config.dev.proxyTable

async function getCompiler(webpackConf, uri) {
  // const uri = getServerUrl(webpackConf.devServer.host, port)
  const compiler = webpack(webpackConf)
  let isFirstCompile = true

  compiler.plugin('done', stats => {
    const messages = stats.toJson({}, true)

    if (isFirstCompile) {
      console.log(`> Listening at ${uri}\n`)
      isFirstCompile = false
    }

    // If errors exist, only show errors.
    if (messages.errors.length) return
  })

  // 为每一个入口文件添加 webpack-dev-server 客户端
  Object.values(webpackConf.entry).forEach(addHotDevClient)

  return compiler
}

function addHotDevClient(entry) {
  // client 在业务模块之前引入，以捕获初始化错误
  ;[].unshift.apply(entry, [
    require.resolve('react-dev-utils/webpackHotDevClient')
    // require.resolve('webpack-dev-server/client') + '?/',
    // require.resolve('webpack/hot/dev-server')
  ])
}

async function createDevServer(config, uri) {
  const serverConf = config.devServer
  const compiler = await getCompiler(config, uri)

  serverConf.https = protocol === 'https'
  // 安全原因，一般禁用 HostCheck
  // https://github.com/webpack/webpack-dev-server/issues/887
  serverConf.disableHostCheck = !proxyTable

  return new DevServer(compiler, serverConf)
}

function getServerUrl(host, port) {
  return `${protocol}://${host || 'localhost'}:${port}`
}

async function server(entryInput) {
  const webpackConf = getWebpackConfig(entryInput)

  const port = await getFreePort(DEFAULT_PORT)
  const uri = getServerUrl(webpackConf.devServer.host, port)
  const devServer = await createDevServer(webpackConf, uri)
  ;['SIGINT', 'SIGTERM'].forEach(sig => {
    process.on(sig, () => {
      devServer.close()
      process.exit()
    })
  })

  // 指定 listen host 0.0.0.0 允许来自 ip 或 localhost 的访问
  return devServer.listen(port, '0.0.0.0', err => {
    if (err) return console.log(err)

    let publicDevPath = config.dev.assetsPublicPath

    // 交互模式下清除 console
    isInteractive && clearConsole()

    // 以绝对路径 / 开头时，加入 url 中在浏览器打开
    // 以非 / 开头时，回退为 /，避免浏览器路径错乱
    publicDevPath = publicDevPath.startsWith('/') ? publicDevPath : '/'

    console.log('> Starting dev server...')
    openBrowser(`${uri + publicDevPath + entryInput.entry}.html`)
  })
}

getEntry().then(server)
