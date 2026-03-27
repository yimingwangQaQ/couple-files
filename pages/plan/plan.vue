<template>
  <view class="page">
    <view class="plan-hero">
      <view class="hero-content">
        <text class="hero-title">下一站，是你 ✈️</text>
        <text class="hero-sub">和你一起走遍世界的每个角落</text>
        <view class="countdown-chip">
          <text class="countdown-text">{{ nextTripText }}</text>
        </view>
      </view>
      <text class="hero-plane">🗺️</text>
    </view>

    <view class="section-header">
      <text class="section-title">🌏 旅游计划</text>
      <view class="add-btn" @tap="openModal">
        <text class="add-btn-text">+ 新计划</text>
      </view>
    </view>

    <view v-if="plans.length === 0" class="empty-state">
      <text class="empty-icon">✈️</text>
      <text class="empty-text">还没有旅行计划，快来规划吧～</text>
    </view>

    <view v-for="plan in plans" :key="plan._id" class="plan-card">
      <view class="plan-top">
        <view class="plan-icon-wrap"><text class="plan-icon">🏝️</text></view>
        <view class="plan-title-area">
          <text class="plan-name">{{ plan.dest }}</text>
          <text class="plan-dates">📅 {{ plan.start }} ~ {{ plan.end }} · {{ calcDays(plan.start, plan.end) }}天</text>
        </view>
        <view :class="['plan-status', 'status-' + plan.status]">
          <text class="status-text">{{ statusMap[plan.status] }}</text>
        </view>
      </view>

      <scroll-view scroll-x class="highlights-scroll" show-scrollbar="false">
        <view class="highlights-row">
          <view v-for="(h, i) in plan.highlights" :key="i" class="highlight-item">
            <text class="highlight-day">Day {{ i+1 }}</text>
            <text class="highlight-name">{{ h }}</text>
          </view>
        </view>
      </scroll-view>

      <view v-if="plan.budget" class="budget-row">
        <text class="budget-label">💰 预算</text>
        <view class="budget-bar-wrap">
          <view class="budget-bar" :style="{ width: getBudgetWidth(plan.status) }"></view>
        </view>
        <text class="budget-amount">¥{{ plan.budget.toLocaleString() }}</text>
      </view>

      <view class="plan-actions">
        <picker :value="getStatusIndex(plan.status)" :range="statusOptions"
          @change="onStatusChange(plan._id, $event)">
          <view class="action-chip"><text class="action-text">更新状态 ▾</text></view>
        </picker>
        <view class="action-chip del" @tap="deletePlan(plan._id)">
          <text class="action-text">🗑 删除</text>
        </view>
      </view>
    </view>

    <view v-if="showAddModal" class="modal-mask" @tap="closeModal">
      <view class="modal-sheet" @tap.stop>
        <view class="modal-handle-bar"></view>
        <text class="modal-title">✈️ 制定旅游计划</text>
        <view class="form-group">
          <text class="form-label">目的地</text>
          <input class="form-input" v-model="newDest"
            placeholder="例如：京都·秋色之旅" placeholder-style="color:#B89AAA" />
        </view>
        <view class="form-row">
          <view class="form-group half">
            <text class="form-label">出发日期</text>
            <picker mode="date" :value="newStart" @change="onStartChange">
              <view class="form-picker">
                <text>{{ newStart || '请选择' }}</text>
                <text class="picker-arrow">📅</text>
              </view>
            </picker>
          </view>
          <view class="form-group half">
            <text class="form-label">返回日期</text>
            <picker mode="date" :value="newEnd" @change="onEndChange">
              <view class="form-picker">
                <text>{{ newEnd || '请选择' }}</text>
                <text class="picker-arrow">📅</text>
              </view>
            </picker>
          </view>
        </view>
        <view class="form-group">
          <text class="form-label">预算（元）</text>
          <input class="form-input" v-model="newBudget" type="number"
            placeholder="例如：8000" placeholder-style="color:#B89AAA" />
        </view>
        <view class="form-group">
          <text class="form-label">行程亮点（逗号分隔）</text>
          <input class="form-input" v-model="newHighlights"
            placeholder="例如：岚山,清水寺,祇园" placeholder-style="color:#B89AAA" />
        </view>
        <view class="form-group">
          <text class="form-label">状态</text>
          <picker :value="newStatusIndex" :range="statusOptions" @change="onNewStatusChange">
            <view class="form-picker">
              <text>{{ statusOptions[newStatusIndex] }}</text>
              <text class="picker-arrow">▾</text>
            </view>
          </picker>
        </view>
        <view class="modal-btn" @tap="submitPlan">🚀 创建计划</view>
      </view>
    </view>
  </view>
</template>

<script>
import { store, PLAN_TMPL_ID } from '../../store/index.js'

export default {
  data() {
    return {
      plans: [],
      showAddModal: false,
      statusMap: { plan: '💭 规划中', ready: '🎉 准备好了', done: '✅ 已完成' },
      statusOptions: ['💭 规划中', '🎉 准备好了', '✅ 已完成'],
      statusKeys: ['plan', 'ready', 'done'],
      newStatusIndex: 0,
      newDest: '',
      newStart: '',
      newEnd: '',
      newBudget: '',
      newHighlights: ''
    }
  },
  computed: {
    nextTripText() {
      var upcoming = this.plans.filter(p => p.status !== 'done' && new Date(p.start) > new Date())
        .sort((a, b) => new Date(a.start) - new Date(b.start))
      var trip = upcoming[0]
      if (!trip) return '快去规划一次旅行吧 💕'
      var days = Math.ceil((new Date(trip.start) - new Date()) / 86400000)
      return '距离「' + trip.dest + '」还有 ' + days + ' 天 🎒'
    }
  },
  async onShow() {
    this.plans = await store.loadPlans()
  },
  methods: {
    openModal() { this.showAddModal = true },
    closeModal() { this.showAddModal = false },
    onStartChange(e) { this.newStart = e.detail.value },
    onEndChange(e) { this.newEnd = e.detail.value },
    onNewStatusChange(e) { this.newStatusIndex = e.detail.value },
    calcDays(start, end) {
      return Math.round((new Date(end) - new Date(start)) / 86400000) + 1
    },
    getBudgetWidth(status) {
      return { done: '100%', ready: '70%', plan: '30%' }[status] || '30%'
    },
    getStatusIndex(status) {
      return this.statusKeys.indexOf(status)
    },
    async onStatusChange(id, e) {
      await store.updatePlanStatus(id, this.statusKeys[e.detail.value])
      this.plans = await store.loadPlans()
      uni.showToast({ title: '状态已更新', icon: 'none' })
    },
    async deletePlan(id) {
      const confirm = await new Promise(resolve => {
        uni.showModal({
          title: '删除计划', content: '确定删除这个旅行计划吗？',
          success: res => resolve(res.confirm)
        })
      })
      if (!confirm) return
      await store.deletePlan(id)
      this.plans = await store.loadPlans()
    },
    async submitPlan() {
      if (!this.newDest.trim() || !this.newStart || !this.newEnd) {
        uni.showToast({ title: '请填写目的地和日期', icon: 'none' })
        return
      }
      // 先请求订阅权限（必须在用户点击事件中调用）
      // ⚠️ msgData 的字段名需与你申请的模板一致
      const dest = this.newDest
      const start = this.newStart
      const end = this.newEnd
      store.subscribeAndNotify(PLAN_TMPL_ID, 'pages/plan/plan', {
        thing1: { value: '家' },
        thing2: { value: dest.slice(0, 20) },
        time3:  { value: start + ' ~ ' + end }
      })
      var highlights = this.newHighlights.split(/[,，]/).map(h => h.trim()).filter(h => h)
      await store.addPlan({
        dest: this.newDest,
        start: this.newStart,
        end: this.newEnd,
        budget: parseInt(this.newBudget) || 0,
        highlights: highlights.length ? highlights : ['待规划'],
        status: this.statusKeys[this.newStatusIndex]
      })
      this.plans = await store.loadPlans()
      this.newDest = ''
      this.newStart = ''
      this.newEnd = ''
      this.newBudget = ''
      this.newHighlights = ''
      this.newStatusIndex = 0
      this.showAddModal = false
      uni.showToast({ title: '计划创建成功！', icon: 'none' })
    }
  }
}
</script>

<style scoped>
.page { background: #FFFAF5; min-height: 100vh; padding-bottom: 32rpx; }
.plan-hero { background: linear-gradient(135deg, #667EEA, #764BA2); border-radius: 0 0 40rpx 40rpx; padding: 80rpx 36rpx 40rpx; display: flex; align-items: center; justify-content: space-between; }
.hero-content { flex: 1; }
.hero-title { color: #fff; font-size: 40rpx; font-weight: 800; display: block; margin-bottom: 8rpx; }
.hero-sub   { color: rgba(255,255,255,0.8); font-size: 26rpx; display: block; margin-bottom: 20rpx; }
.countdown-chip { display: inline-block; background: rgba(255,255,255,0.2); border-radius: 16rpx; padding: 8rpx 20rpx; }
.countdown-text { color: #fff; font-size: 24rpx; font-weight: 600; }
.hero-plane { font-size: 100rpx; opacity: 0.25; }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 28rpx 24rpx 16rpx; }
.section-title  { font-size: 32rpx; font-weight: 800; color: #2D1B2E; }
.add-btn { background: linear-gradient(135deg, #667EEA, #764BA2); border-radius: 32rpx; padding: 12rpx 24rpx; }
.add-btn-text { color: #fff; font-size: 26rpx; font-weight: 600; }
.plan-card { background: #fff; border-radius: 24rpx; padding: 24rpx; margin: 0 24rpx 20rpx; box-shadow: 0 4rpx 20rpx rgba(102,126,234,0.1); }
.plan-top  { display: flex; align-items: center; gap: 16rpx; margin-bottom: 20rpx; }
.plan-icon-wrap { width: 72rpx; height: 72rpx; border-radius: 18rpx; background: rgba(102,126,234,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.plan-icon { font-size: 40rpx; }
.plan-title-area { flex: 1; }
.plan-name  { font-size: 30rpx; font-weight: 700; color: #2D1B2E; display: block; margin-bottom: 6rpx; }
.plan-dates { font-size: 22rpx; color: #B89AAA; display: block; }
.plan-status { padding: 8rpx 16rpx; border-radius: 16rpx; flex-shrink: 0; }
.status-text { font-size: 22rpx; font-weight: 700; }
.status-plan  { background: #FFF8E8; } .status-plan .status-text  { color: #F0A500; }
.status-ready { background: #E8FFF4; } .status-ready .status-text { color: #00C96C; }
.status-done  { background: #F0F0FF; } .status-done .status-text  { color: #8B7CF6; }
.highlights-scroll { margin-bottom: 20rpx; white-space: nowrap; }
.highlights-row { display: flex; gap: 10rpx; }
.highlight-item { flex-shrink: 0; background: rgba(102,126,234,0.08); border-radius: 14rpx; padding: 10rpx 18rpx; }
.highlight-day  { font-size: 20rpx; color: #7A5C6E; display: block; margin-bottom: 4rpx; }
.highlight-name { font-size: 24rpx; color: #667EEA; font-weight: 600; display: block; }
.budget-row    { display: flex; align-items: center; gap: 12rpx; padding-top: 16rpx; border-top: 2rpx solid rgba(102,126,234,0.08); margin-bottom: 16rpx; }
.budget-label  { font-size: 24rpx; color: #7A5C6E; flex-shrink: 0; }
.budget-bar-wrap { flex: 1; height: 10rpx; background: rgba(102,126,234,0.1); border-radius: 10rpx; overflow: hidden; }
.budget-bar    { height: 100%; background: linear-gradient(90deg, #667EEA, #764BA2); border-radius: 10rpx; }
.budget-amount { font-size: 24rpx; color: #7A5C6E; font-weight: 600; }
.plan-actions  { display: flex; gap: 12rpx; }
.action-chip   { flex: 1; padding: 12rpx; border-radius: 14rpx; text-align: center; background: rgba(102,126,234,0.08); }
.action-chip.del { background: rgba(255,107,138,0.08); }
.action-text   { font-size: 24rpx; color: #667EEA; font-weight: 600; }
.action-chip.del .action-text { color: #FF6B8A; }
.empty-state   { text-align: center; padding: 80rpx 40rpx; }
.empty-icon    { font-size: 100rpx; display: block; }
.empty-text    { font-size: 28rpx; color: #B89AAA; display: block; margin-top: 16rpx; }
.modal-mask    { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.45); z-index: 999; display: flex; align-items: flex-end; }
.modal-sheet   { background: #fff; border-radius: 40rpx 40rpx 0 0; padding: 24rpx 32rpx 60rpx; width: 100%; max-height: 88vh; overflow-y: auto; }
.modal-handle-bar { width: 80rpx; height: 8rpx; background: #E8D8DE; border-radius: 8rpx; margin: 0 auto 32rpx; }
.modal-title   { font-size: 36rpx; font-weight: 800; color: #2D1B2E; display: block; text-align: center; margin-bottom: 32rpx; }
.form-group    { margin-bottom: 24rpx; }
.form-group.half { flex: 1; }
.form-row      { display: flex; gap: 20rpx; }
.form-label    { font-size: 26rpx; font-weight: 600; color: #7A5C6E; display: block; margin-bottom: 10rpx; }
.form-input    { width: 100%; height: 88rpx; padding: 20rpx 24rpx; border: 3rpx solid rgba(102,126,234,0.2); border-radius: 20rpx; font-size: 28rpx; background: #F0F0FF; box-sizing: border-box; line-height: 48rpx; }
.form-picker   { padding: 20rpx 24rpx; border: 3rpx solid rgba(102,126,234,0.2); border-radius: 20rpx; font-size: 28rpx; background: #F0F0FF; display: flex; justify-content: space-between; align-items: center; }
.picker-arrow  { color: #B89AAA; }
.modal-btn     { display: block; margin: 16rpx auto 0; padding: 28rpx 80rpx; border-radius: 28rpx; text-align: center; font-size: 32rpx; font-weight: 700; color: #fff; background: linear-gradient(135deg, #667EEA, #764BA2); }
</style>
