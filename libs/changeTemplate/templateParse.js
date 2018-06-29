const baseUrl = '//wap_front.dev.sina.cn/marauder'

const templateParse = ({ config, page }) => {
  return {
    $getUrl: (code, { relativePath }) => {
      let url = ''
      let [projectName, viewName] = code.split('/')
      url = `${baseUrl}/${projectName}/${viewName}/${relativePath}`
      return url
    },
    $getMd5: (code, {}) => {
      return ''
    },
    $getContent: (code, {}) => {
      return ''
    }
  }
}

module.exports = templateParse
