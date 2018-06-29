const config = require('../../config')
const postgresql = require('../../util/postgresql')
const ejs = require('ejs')
const templateParse = require('./templateParse')
const formAxios = require('../../util/formAxios')

module.exports = async (page, namespace) => {
  let templateCode = config.template
  if (!templateCode) {
    return
  }
  postgresql.connect()
  let { rows } = await postgresql.queryAsync({
    text: `SELECT * from templates WHERE code=$1`,
    values: [templateCode]
  })
  let template = rows[0]
  if (!template) {
    console.log(`不存在code为${templateCode}的template`)
    postgresql.end()
    return
  }
  console.log(template.id)
  let templateRecordRows = (await postgresql.queryAsync({
    text: `SELECT * from templaterecord WHERE templateid=$1 AND iscurrent=true`,
    values: [template.id]
  })).rows
  let templateRecord = templateRecordRows[0]
  if (!templateRecord) {
    console.log(`不存在code为${templateCode}的templateRecord`)
    postgresql.end()
    return
  }
  let { content } = templateRecord
  let parseContent = ejs.render(
    content,
    templateParse({
      config,
      page
    })
  )
  postgresql.end()
  let username = config.author
  let res = await formAxios.post(
    `http://dev.cms.pub.sina.com.cn/index.php?r=interface/updateTemplate&key=${templateCode}&username=${username}&online=0`,
    {
      TemplateCode: [
        {
          code: parseContent
        }
      ]
    }
  )
  console.log('编译后模版为:')
  console.log(parseContent)
  if (res.data.status == 0) {
    console.log('成功更新dev模版')
  } else {
    console.log('更新dev模版失败')
  }
  console.log(res.data)
}
