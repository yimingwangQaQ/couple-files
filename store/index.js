function db() {
  return wx.cloud.database()
}

// ⚠️ 替换为你在微信后台「订阅消息」申请的模板ID
// 微信公众平台 → 功能 → 订阅消息 → 公共模板库 → 搜索"任务"/"旅行"
export const TASK_TMPL_ID = 'URfKf5K9BKxfRyb3yHq5_Sukg7akmHimgXm8V3uEaOI'  // 待办任务开始提醒
export const PLAN_TMPL_ID = 'xK2SHJHKJKChCYYb1HTIEwUduob7i9l__XlnHGILfSw'  // 旅行规划完成通知

export const store = {
  coupleInfo: {
    name1: '小董', name2: '小王',
    avatar1: '👧', avatar2: '👦',
    startDate: '2019-07-04'
  },

  // ---- 任务 ----
  async loadTasks() {
    const res = await db().collection('tasks').orderBy('_createTime', 'desc').limit(100).get()
    return res.data
  },
  async addTask(task) {
    await db().collection('tasks').add({ data: task })
  },
  async toggleTask(id, done) {
    await db().collection('tasks').doc(id).update({ data: { done: !done } })
  },
  async deleteTask(id) {
    await db().collection('tasks').doc(id).remove()
  },

  // ---- 菜谱 ----
  async loadRecipes() {
    const res = await db().collection('recipes').limit(100).get()
    return res.data
  },
  async addRecipe(recipe) {
    recipe.votes = 0
    await db().collection('recipes').add({ data: recipe })
  },
  async deleteRecipe(id) {
    await db().collection('recipes').doc(id).remove()
  },
  async voteRecipe(id) {
    const database = db()
    await database.collection('recipes').doc(id).update({
      data: { votes: database.command.inc(1) }
    })
  },

  // ---- 计划 ----
  async loadPlans() {
    const res = await db().collection('plans').orderBy('_createTime', 'desc').limit(100).get()
    return res.data
  },
  async addPlan(plan) {
    await db().collection('plans').add({ data: plan })
  },
  async deletePlan(id) {
    await db().collection('plans').doc(id).remove()
  },
  async updatePlanStatus(id, status) {
    await db().collection('plans').doc(id).update({ data: { status } })
  },

  // ---- 通知 ----
  // 先弹出订阅授权，用户同意后再发送通知给对方
  // msgData 字段需与你申请的模板一致，例如 { thing1: { value: '买菜' }, thing2: { value: '小董' } }
  async subscribeAndNotify(templateId, page, msgData) {
    try {
      const subRes = await new Promise(resolve => {
        wx.requestSubscribeMessage({
          tmplIds: [templateId],
          success: resolve,
          fail: (err) => {
            uni.showToast({ title: '订阅弹窗失败:' + err.errMsg, icon: 'none', duration: 3000 })
            resolve({})
          }
        })
      })
      const status = subRes[templateId]
      if (status !== 'accept') {
        // reject=用户拒绝, ban=已永久拒绝, undefined=弹窗失败
        if (status === 'reject') uni.showToast({ title: '已拒绝订阅，对方不会收到通知', icon: 'none', duration: 2000 })
        return
      }
      const res = await wx.cloud.callFunction({
        name: 'sendNotify',
        data: { templateId, page, msgData }
      })
      const result = res.result
      console.log('sendNotify结果:', JSON.stringify(result))
      if (result && result.notified > 0) {
        uni.showToast({ title: '通知已发送给对方 💌', icon: 'none' })
      } else if (result && result.reason) {
        uni.showToast({ title: result.reason, icon: 'none', duration: 3000 })
      } else if (result && result.results) {
        const fail = result.results.find(r => !r.success)
        const msg = fail ? ('发送失败:' + fail.errCode + ' ' + (fail.errMsg || '')) : '未知错误'
        uni.showToast({ title: msg, icon: 'none', duration: 4000 })
      }
    } catch (e) {
      uni.showToast({ title: '通知失败:' + (e.message || e.errMsg || '未知错误'), icon: 'none', duration: 3000 })
    }
  }
}
