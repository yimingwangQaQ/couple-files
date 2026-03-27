// 云函数：注册用户openid，首次启动时调用
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  // 避免重复注册
  const existing = await db.collection('users').where({ openid: OPENID }).get()
  if (existing.data.length === 0) {
    await db.collection('users').add({ data: { openid: OPENID, joinedAt: new Date() } })
  }
  return { openid: OPENID }
}
