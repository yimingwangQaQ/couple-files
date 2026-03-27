const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { templateId, page, msgData } = event

  const usersRes = await db.collection('users').get()
  const targets = usersRes.data.filter(u => u.openid !== OPENID)

  if (targets.length === 0) {
    return { success: false, reason: '没有找到其他用户，请确认对方已打开过app' }
  }

  const results = []
  for (const user of targets) {
    try {
      await cloud.openapi.subscribeMessage.send({
        touser: user.openid,
        template_id: templateId,
        page,
        data: msgData
      })
      results.push({ openid: user.openid, success: true })
    } catch (e) {
      results.push({
        openid: user.openid,
        success: false,
        errCode: e.errCode,
        errMsg: e.errMsg
      })
    }
  }

  const successCount = results.filter(r => r.success).length
  return {
    success: successCount > 0,
    notified: successCount,
    results  // 详细结果，可在云函数日志里查看
  }
}
