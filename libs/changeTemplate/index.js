const config = require('../../config')
const graphql = require('../../util/graphql')

module.exports = async (page, namespace) => {
  let templateCode = config.template
  if (!templateCode) {
    return
  }
  let author = config.author

  let query = `
  mutation ftpDeploy($templateCode: String!, $author: String!) {
    ftpDeploy(templateCode: $templateCode, author: $author) {
      success
      msg
    }
  }
  `
  let res = await graphql.request(query, {
    templateCode,
    author
  })

  console.log('模版ftpDeploy请求结果:')
  console.log(res)

  return
}
