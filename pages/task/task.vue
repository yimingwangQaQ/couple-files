<template>
  <view class="page">
    <view class="header">
      <view class="couple-row">
        <view class="avatar-pair">
          <view class="avatar">{{ avatar1 }}</view>
          <view class="avatar avatar2">{{ avatar2 }}</view>
        </view>
        <view class="couple-text">
          <text class="couple-name">{{ name1 }} & {{ name2 }} 💕</text>
          <text class="couple-sub">小董YYDS!!!!!!!!!</text>
        </view>
        <view class="days-badge">
          <text class="days-num">{{ daysCount }}</text>
          <text class="days-label">在一起天数</text>
        </view>
      </view>
    </view>

    <view class="stats-row">
      <view class="stat-card">
        <text class="stat-num">{{ tasks.length }}</text>
        <text class="stat-label">全部</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">{{ doneCount }}</text>
        <text class="stat-label">已完成</text>
      </view>
      <view class="stat-card">
        <text class="stat-num">{{ pendingCount }}</text>
        <text class="stat-label">待完成</text>
      </view>
    </view>

    <scroll-view class="filter-scroll" scroll-x="true" show-scrollbar="false">
      <view class="filter-row">
        <view v-for="f in filters" :key="f.key"
          :class="['filter-chip', activeFilter === f.key ? 'active' : '']"
          @tap="setFilter(f.key)">{{ f.label }}</view>
      </view>
    </scroll-view>

    <view class="section-header">
      <text class="section-title">🛒 任务清单</text>
      <view class="add-btn" @tap="openModal">
        <text class="add-btn-text">+ 新任务</text>
      </view>
    </view>

    <view v-if="!notifyEnabled" class="notify-bar" @tap="enableNotify">
      <text class="notify-bar-text">🔔 点这里开启接收对方的提醒消息</text>
      <text class="notify-bar-arrow">›</text>
    </view>

    <view v-if="filteredTasks.length === 0" class="empty-state">
      <text class="empty-icon">🎉</text>
      <text class="empty-text">没有任务啦，好好享受甜蜜时光～</text>
    </view>

    <view v-for="task in filteredTasks" :key="task._id"
      :class="['task-card', task.done ? 'done' : '']">
      <view :class="['check-circle', task.done ? 'checked' : '']" @tap="toggleTask(task._id)">
        <text v-if="task.done" class="check-icon">✓</text>
      </view>
      <view class="task-body">
        <text :class="['task-title', task.done ? 'task-done-text' : '']">{{ task.title }}</text>
        <view class="task-meta">
          <text :class="['tag', 'tag-' + task.type]">{{ typeNames[task.type] }}</text>
          <text v-if="task.deadline" class="task-deadline">📅 {{ task.deadline }}</text>
          <text class="task-assign">{{ task.assign }}</text>
        </view>
      </view>
      <view class="task-del" @tap="deleteTask(task._id)">🗑</view>
    </view>

    <view v-if="showAddModal" class="modal-mask" @tap="closeModal">
      <view class="modal-sheet" @tap.stop>
        <view class="modal-handle-bar"></view>
        <text class="modal-title">✅ 添加新任务</text>
        <view class="form-group">
          <text class="form-label">任务内容</text>
          <input class="form-input" v-model="newTitle"
            placeholder="例如：购买方便面3袋" placeholder-style="color:#B89AAA" />
        </view>
        <view class="form-row">
          <view class="form-group half">
            <text class="form-label">分类</text>
            <picker :value="typeIndex" :range="typeOptions" @change="onTypeChange">
              <view class="form-picker">
                <text>{{ typeOptions[typeIndex] }}</text>
                <text class="picker-arrow">▾</text>
              </view>
            </picker>
          </view>
          <view class="form-group half">
            <text class="form-label">执行人</text>
            <picker :value="assignIndex" :range="assignOptions" @change="onAssignChange">
              <view class="form-picker">
                <text>{{ assignOptions[assignIndex] }}</text>
                <text class="picker-arrow">▾</text>
              </view>
            </picker>
          </view>
        </view>
        <view class="form-group">
          <text class="form-label">截止日期（选填）</text>
          <picker mode="date" :value="newDeadline" @change="onDateChange">
            <view class="form-picker">
              <text>{{ newDeadline || '请选择日期' }}</text>
              <text class="picker-arrow">📅</text>
            </view>
          </picker>
        </view>
        <view class="modal-btn" @tap="submitTask">✨ 添加任务</view>
      </view>
    </view>
  </view>
</template>

<script>
import { store, TASK_TMPL_ID, PLAN_TMPL_ID } from '../../store/index.js'

export default {
  data() {
    return {
      tasks: [],
      name1: store.coupleInfo.name1,
      name2: store.coupleInfo.name2,
      avatar1: store.coupleInfo.avatar1,
      avatar2: store.coupleInfo.avatar2,
      startDate: store.coupleInfo.startDate,
      showAddModal: false,
      activeFilter: 'all',
      filters: [
        { key: 'all',   label: '全部' },
        { key: 'buy',   label: '🛍️ 购物' },
        { key: 'date',  label: '💕 约会' },
        { key: 'clean', label: '🧹 家务' },
        { key: 'other', label: '📝 其他' }
      ],
      typeNames: { buy: '购物', date: '约会', clean: '家务', other: '其他' },
      typeOptions: ['🛍️ 购物', '💕 约会', '🧹 家务', '📝 其他'],
      typeKeys:    ['buy', 'date', 'clean', 'other'],
      typeIndex: 0,
      assignOptions: ['👧 小董', '👦 小王', '👫 一起'],
      assignIndex: 0,
      newTitle: '',
      newDeadline: '',
      notifyEnabled: uni.getStorageSync('notifyEnabled') || false
    }
  },
  computed: {
    daysCount() {
      return Math.floor((Date.now() - new Date(this.startDate)) / 86400000)
    },
    doneCount() {
      return this.tasks.filter(t => t.done).length
    },
    pendingCount() {
      return this.tasks.filter(t => !t.done).length
    },
    filteredTasks() {
      var f = this.activeFilter
      var list = f === 'all' ? this.tasks.slice() : this.tasks.filter(t => t.type === f)
      return list.sort((a, b) => a.done - b.done)
    }
  },
  async onShow() {
    this.tasks = await store.loadTasks()
  },
  methods: {
    async enableNotify() {
      const subRes = await new Promise(resolve => {
        wx.requestSubscribeMessage({
          tmplIds: [TASK_TMPL_ID, PLAN_TMPL_ID],
          success: resolve,
          fail: () => resolve({})
        })
      })
      const accepted = subRes[TASK_TMPL_ID] === 'accept' || subRes[PLAN_TMPL_ID] === 'accept'
      if (accepted) {
        uni.setStorageSync('notifyEnabled', true)
        this.notifyEnabled = true
        uni.showToast({ title: '已开启，对方发消息会通知你 ✓', icon: 'none', duration: 2000 })
      } else {
        uni.showToast({ title: '已拒绝，可在微信设置中重新开启', icon: 'none', duration: 2500 })
      }
    },
    setFilter(key) { this.activeFilter = key },
    openModal() { this.showAddModal = true },
    closeModal() { this.showAddModal = false },
    onTypeChange(e) { this.typeIndex = e.detail.value },
    onAssignChange(e) { this.assignIndex = e.detail.value },
    onDateChange(e) { this.newDeadline = e.detail.value },
    async toggleTask(id) {
      const task = this.tasks.find(t => t._id === id)
      if (!task) return
      await store.toggleTask(id, task.done)
      this.tasks = await store.loadTasks()
      uni.showToast({ title: '已更新', icon: 'none' })
    },
    async deleteTask(id) {
      const confirm = await new Promise(resolve => {
        uni.showModal({
          title: '删除任务', content: '确定删除吗？',
          success: res => resolve(res.confirm)
        })
      })
      if (!confirm) return
      await store.deleteTask(id)
      this.tasks = await store.loadTasks()
    },
    async submitTask() {
      if (!this.newTitle.trim()) {
        uni.showToast({ title: '请填写任务内容', icon: 'none' })
        return
      }
      // 先请求订阅权限（必须在用户点击事件中调用）
      // ⚠️ msgData 的字段名需与你申请的模板一致
      const title = this.newTitle
      const assign = this.assignOptions[this.assignIndex]
      const deadline = this.newDeadline
      // time3 截止时间：有截止日期就格式化，没有就用今天
      const deadlineStr = (deadline
        ? deadline.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1年$2月$3日')
        : new Date().toLocaleDateString('zh-CN', { year:'numeric', month:'2-digit', day:'2-digit' }).replace(/\//g, '月').replace(/(\d+)月(\d+)月(\d+)$/, '$1年$2月$3日')
      ) + ' 00:00'
      store.subscribeAndNotify(TASK_TMPL_ID, 'pages/task/task', {
        thing1: { value: title.slice(0, 20) },
        time3:  { value: deadlineStr }
      })
      await store.addTask({
        title,
        type: this.typeKeys[this.typeIndex],
        assign,
        deadline: this.newDeadline,
        done: false
      })
      this.tasks = await store.loadTasks()
      this.newTitle = ''
      this.newDeadline = ''
      this.typeIndex = 0
      this.assignIndex = 0
      this.showAddModal = false
      uni.showToast({ title: '添加成功！', icon: 'none' })
    }
  }
}
</script>

<style scoped>
.page { background: #FFFAF5; min-height: 100vh; padding-bottom: 32rpx; }
.notify-bar { display: flex; align-items: center; justify-content: space-between; margin: 0 24rpx 16rpx; padding: 20rpx 24rpx; background: linear-gradient(135deg, rgba(255,107,138,0.08), rgba(255,179,71,0.08)); border: 2rpx solid rgba(255,107,138,0.25); border-radius: 16rpx; }
.notify-bar-text { font-size: 26rpx; color: #FF6B8A; font-weight: 500; }
.notify-bar-arrow { font-size: 36rpx; color: #FFB3C1; }
.header { background: linear-gradient(135deg, #FF6B8A 0%, #FF8C69 60%, #FFB347 100%); padding: 88rpx 32rpx 36rpx; }
.couple-row { display: flex; align-items: center; gap: 20rpx; }
.avatar-pair { display: flex; }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; font-size: 36rpx; border: 4rpx solid rgba(255,255,255,0.7); }
.avatar2 { margin-left: -20rpx; }
.couple-text { flex: 1; }
.couple-name { color: #fff; font-size: 32rpx; font-weight: 700; display: block; }
.couple-sub  { color: rgba(255,255,255,0.8); font-size: 24rpx; display: block; margin-top: 4rpx; }
.days-badge  { background: rgba(255,255,255,0.2); border: 2rpx solid rgba(255,255,255,0.4); border-radius: 20rpx; padding: 12rpx 20rpx; text-align: center; }
.days-num    { color: #fff; font-size: 48rpx; font-weight: 800; display: block; line-height: 1; }
.days-label  { color: rgba(255,255,255,0.85); font-size: 20rpx; display: block; margin-top: 4rpx; }
.stats-row   { display: flex; gap: 16rpx; padding: 24rpx 24rpx 0; }
.stat-card   { flex: 1; background: #fff; border-radius: 20rpx; padding: 20rpx 12rpx; text-align: center; box-shadow: 0 4rpx 20rpx rgba(255,107,138,0.1); }
.stat-num    { font-size: 52rpx; font-weight: 800; display: block; color: #FF6B8A; }
.stat-label  { font-size: 22rpx; color: #B89AAA; display: block; margin-top: 4rpx; }
.filter-scroll { padding: 20rpx 24rpx 0; }
.filter-row  { display: flex; gap: 12rpx; }
.filter-chip { flex-shrink: 0; padding: 10rpx 24rpx; border-radius: 32rpx; font-size: 24rpx; color: #7A5C6E; background: #fff; border: 2rpx solid rgba(255,107,138,0.2); }
.filter-chip.active { background: linear-gradient(135deg, #FF6B8A, #FF8C69); color: #fff; border-color: transparent; }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 24rpx 16rpx; }
.section-title  { font-size: 32rpx; font-weight: 800; color: #2D1B2E; }
.add-btn      { background: linear-gradient(135deg, #FF6B8A, #FF8C69); border-radius: 32rpx; padding: 12rpx 24rpx; }
.add-btn-text { color: #fff; font-size: 26rpx; font-weight: 600; }
.task-card    { display: flex; align-items: center; gap: 20rpx; background: #fff; border-radius: 20rpx; padding: 20rpx 24rpx; margin: 0 24rpx 16rpx; box-shadow: 0 4rpx 20rpx rgba(255,107,138,0.1); border-left: 6rpx solid #FF6B8A; }
.task-card.done { opacity: 0.55; }
.check-circle { width: 44rpx; height: 44rpx; border-radius: 50%; border: 3rpx solid #FFB3C1; background: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.check-circle.checked { background: linear-gradient(135deg, #FF6B8A, #FF8C69); border-color: transparent; }
.check-icon   { color: #fff; font-size: 22rpx; font-weight: 800; }
.task-body    { flex: 1; }
.task-title   { font-size: 28rpx; font-weight: 600; color: #2D1B2E; display: block; margin-bottom: 8rpx; }
.task-done-text { text-decoration: line-through; color: #B89AAA; }
.task-meta    { display: flex; align-items: center; gap: 10rpx; flex-wrap: wrap; }
.tag          { font-size: 22rpx; padding: 4rpx 14rpx; border-radius: 16rpx; font-weight: 600; }
.tag-buy      { background: #FFF0E8; color: #FF6B35; }
.tag-date     { background: #FFF0F3; color: #FF6B8A; }
.tag-clean    { background: #E8F8F0; color: #34C978; }
.tag-other    { background: #F0F0FF; color: #8B7CF6; }
.task-deadline { font-size: 22rpx; color: #8B7CF6; background: #F5F0FF; padding: 4rpx 12rpx; border-radius: 12rpx; }
.task-assign  { font-size: 22rpx; color: #B89AAA; }
.task-del     { font-size: 36rpx; padding: 8rpx; }
.empty-state  { text-align: center; padding: 80rpx 40rpx; }
.empty-icon   { font-size: 100rpx; display: block; }
.empty-text   { font-size: 28rpx; color: #B89AAA; display: block; margin-top: 16rpx; }
.modal-mask   { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.45); z-index: 999; display: flex; align-items: flex-end; }
.modal-sheet  { background: #fff; border-radius: 40rpx 40rpx 0 0; padding: 24rpx 32rpx 60rpx; width: 100%; }
.modal-handle-bar { width: 80rpx; height: 8rpx; background: #E8D8DE; border-radius: 8rpx; margin: 0 auto 32rpx; }
.modal-title  { font-size: 36rpx; font-weight: 800; color: #2D1B2E; display: block; text-align: center; margin-bottom: 32rpx; }
.form-group   { margin-bottom: 24rpx; }
.form-group.half { flex: 1; }
.form-row     { display: flex; gap: 20rpx; }
.form-label   { font-size: 26rpx; font-weight: 600; color: #7A5C6E; display: block; margin-bottom: 10rpx; }
.form-input   { width: 100%; height: 88rpx; padding: 20rpx 24rpx; border: 3rpx solid rgba(255,107,138,0.2); border-radius: 20rpx; font-size: 28rpx; background: #FFF0F3; box-sizing: border-box; line-height: 48rpx; }
.form-picker  { padding: 20rpx 24rpx; border: 3rpx solid rgba(255,107,138,0.2); border-radius: 20rpx; font-size: 28rpx; background: #FFF0F3; display: flex; justify-content: space-between; align-items: center; }
.picker-arrow { color: #B89AAA; }
.modal-btn    { display: block; margin: 16rpx auto 0; padding: 28rpx 80rpx; border-radius: 28rpx; text-align: center; font-size: 32rpx; font-weight: 700; color: #fff; background: linear-gradient(135deg, #FF6B8A, #FF8C69); }
</style>
