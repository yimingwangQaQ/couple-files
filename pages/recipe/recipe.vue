<template>
  <view class="page">
    <view class="order-banner">
      <text class="order-label">🍽️ 今日点单</text>
      <view v-if="selectedDishes.length === 0" class="order-empty">
        <text class="order-empty-text">还没点菜，去菜单里选吧～</text>
      </view>
      <scroll-view v-else scroll-x class="order-scroll" show-scrollbar="false">
        <view class="order-chips">
          <view v-for="dish in selectedDishes" :key="dish._id" class="dish-chip">
            <text class="dish-emoji">{{ dish.emoji }}</text>
            <text class="dish-name">{{ dish.name }}</text>
            <text class="dish-remove" @tap="removeDish(dish._id)">✕</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="section-header">
      <text class="section-title">📖 菜谱菜单</text>
      <view class="add-btn" @tap="openModal">
        <text class="add-btn-text">+ 上传菜谱</text>
      </view>
    </view>

    <view class="menu-grid">
      <view v-for="(recipe, index) in recipes" :key="recipe._id"
        class="menu-card" @tap="orderDish(recipe)">
        <view :class="['menu-emoji-bg', 'bg' + (index % 5)]">
          <text class="menu-emoji">{{ recipe.emoji }}</text>
          <view class="vote-badge"><text class="vote-text">❤️ {{ recipe.votes }}</text></view>
        </view>
        <view class="menu-info">
          <text class="menu-name">{{ recipe.name }}</text>
          <view class="menu-tags">
            <text class="menu-tag">{{ recipe.cuisine }}</text>
            <text class="menu-tag blue">{{ recipe.diff }}</text>
          </view>
        </view>
        <view class="menu-actions">
          <view class="action-btn" @tap.stop="voteRecipe(recipe._id)"><text>💕</text></view>
          <view class="action-btn" @tap.stop="deleteRecipe(recipe._id)"><text>🗑</text></view>
        </view>
      </view>
    </view>

    <view v-if="recipes.length === 0" class="empty-state">
      <text class="empty-icon">🍳</text>
      <text class="empty-text">还没有菜谱，快去上传吧～</text>
    </view>

    <view v-if="showAddModal" class="modal-mask" @tap="closeModal">
      <view class="modal-sheet" @tap.stop>
        <view class="modal-handle-bar"></view>
        <text class="modal-title">🍳 上传菜谱</text>
        <view class="form-group">
          <text class="form-label">菜名</text>
          <input class="form-input" v-model="newName"
            placeholder="例如：红烧肉" placeholder-style="color:#B89AAA" />
        </view>
        <view class="form-row">
          <view class="form-group half">
            <text class="form-label">菜系</text>
            <picker :value="cuisineIndex" :range="cuisineOptions" @change="onCuisineChange">
              <view class="form-picker">
                <text>{{ cuisineOptions[cuisineIndex] }}</text>
                <text class="picker-arrow">▾</text>
              </view>
            </picker>
          </view>
          <view class="form-group half">
            <text class="form-label">难度</text>
            <picker :value="diffIndex" :range="diffOptions" @change="onDiffChange">
              <view class="form-picker">
                <text>{{ diffOptions[diffIndex] }}</text>
                <text class="picker-arrow">▾</text>
              </view>
            </picker>
          </view>
        </view>
        <view class="form-group">
          <text class="form-label">选个表情</text>
          <view class="emoji-row">
            <view v-for="e in emojiList" :key="e"
              :class="['emoji-opt', newEmoji === e ? 'active' : '']"
              @tap="selectEmoji(e)">
              <text class="emoji-text">{{ e }}</text>
            </view>
          </view>
        </view>
        <view class="form-group">
          <text class="form-label">备注</text>
          <textarea class="form-textarea" v-model="newNote"
            placeholder="简单写写食材或步骤..." placeholder-style="color:#B89AAA" />
        </view>
        <view class="modal-btn" @tap="submitRecipe">🌟 添加到菜单</view>
      </view>
    </view>
  </view>
</template>

<script>
import { store } from '../../store/index.js'

export default {
  data() {
    return {
      recipes: [],
      selectedDishes: [],
      showAddModal: false,
      emojiList: ['🍖','🐟','🥩','🍜','🥗','🍲','🥚','🍰','🥘','🫕'],
      cuisineOptions: ['家常菜','川菜','粤菜','面食','汤品','甜品','快手菜'],
      diffOptions: ['简单','中等','复杂'],
      cuisineIndex: 0,
      diffIndex: 0,
      newName: '',
      newEmoji: '🍖',
      newNote: ''
    }
  },
  async onShow() {
    this.recipes = await store.loadRecipes()
  },
  methods: {
    openModal() { this.showAddModal = true },
    closeModal() { this.showAddModal = false },
    onCuisineChange(e) { this.cuisineIndex = e.detail.value },
    onDiffChange(e) { this.diffIndex = e.detail.value },
    selectEmoji(e) { this.newEmoji = e },
    orderDish(recipe) {
      if (this.selectedDishes.find(d => d._id === recipe._id)) {
        uni.showToast({ title: '已经点过啦', icon: 'none' })
        return
      }
      this.selectedDishes.push(recipe)
      uni.showToast({ title: '已点 ' + recipe.name, icon: 'none' })
    },
    removeDish(id) {
      this.selectedDishes = this.selectedDishes.filter(d => d._id !== id)
    },
    async voteRecipe(id) {
      await store.voteRecipe(id)
      this.recipes = await store.loadRecipes()
      uni.showToast({ title: '已点赞！', icon: 'none' })
    },
    async deleteRecipe(id) {
      const confirm = await new Promise(resolve => {
        uni.showModal({
          title: '删除菜谱', content: '确定删除吗？',
          success: res => resolve(res.confirm)
        })
      })
      if (!confirm) return
      await store.deleteRecipe(id)
      this.recipes = await store.loadRecipes()
    },
    async submitRecipe() {
      if (!this.newName.trim()) {
        uni.showToast({ title: '请填写菜名', icon: 'none' })
        return
      }
      await store.addRecipe({
        name: this.newName,
        emoji: this.newEmoji,
        cuisine: this.cuisineOptions[this.cuisineIndex],
        diff: this.diffOptions[this.diffIndex],
        note: this.newNote
      })
      this.recipes = await store.loadRecipes()
      this.newName = ''
      this.newEmoji = '🍖'
      this.newNote = ''
      this.cuisineIndex = 0
      this.diffIndex = 0
      this.showAddModal = false
      uni.showToast({ title: '上传成功！', icon: 'none' })
    }
  }
}
</script>

<style scoped>
.page { background: #FFFAF5; min-height: 100vh; padding-bottom: 32rpx; }
.order-banner { background: linear-gradient(135deg, rgba(255,107,138,0.08), rgba(255,179,71,0.08)); border: 2rpx solid #FFB3C1; border-radius: 24rpx; margin: 24rpx; padding: 24rpx; }
.order-label  { font-size: 26rpx; font-weight: 700; color: #FF6B8A; display: block; margin-bottom: 14rpx; }
.order-empty-text { font-size: 26rpx; color: #B89AAA; }
.order-scroll { white-space: nowrap; }
.order-chips  { display: flex; gap: 12rpx; }
.dish-chip    { display: inline-flex; align-items: center; gap: 8rpx; background: #fff; border: 2rpx solid #FFB3C1; border-radius: 32rpx; padding: 10rpx 18rpx; flex-shrink: 0; }
.dish-emoji   { font-size: 28rpx; }
.dish-name    { font-size: 26rpx; color: #2D1B2E; font-weight: 500; }
.dish-remove  { font-size: 22rpx; color: #B89AAA; padding-left: 4rpx; }
.section-header { display: flex; align-items: center; justify-content: space-between; padding: 16rpx 24rpx; }
.section-title  { font-size: 32rpx; font-weight: 800; color: #2D1B2E; }
.add-btn      { background: linear-gradient(135deg, #FF6B8A, #FF8C69); border-radius: 32rpx; padding: 12rpx 24rpx; }
.add-btn-text { color: #fff; font-size: 26rpx; font-weight: 600; }
.menu-grid    { display: flex; flex-wrap: wrap; gap: 16rpx; padding: 0 24rpx; }
.menu-card    { width: calc(50% - 8rpx); background: #fff; border-radius: 24rpx; overflow: hidden; box-shadow: 0 4rpx 20rpx rgba(255,107,138,0.1); }
.menu-emoji-bg { height: 160rpx; display: flex; align-items: center; justify-content: center; position: relative; }
.bg0 { background: #FFF5E8; } .bg1 { background: #E8F8F0; } .bg2 { background: #E8F0FF; } .bg3 { background: #FFF0F3; } .bg4 { background: #FFF8E8; }
.menu-emoji   { font-size: 70rpx; }
.vote-badge   { position: absolute; top: 12rpx; right: 12rpx; background: rgba(255,255,255,0.92); border-radius: 20rpx; padding: 4rpx 12rpx; }
.vote-text    { font-size: 22rpx; }
.menu-info    { padding: 16rpx 16rpx 8rpx; }
.menu-name    { font-size: 28rpx; font-weight: 700; color: #2D1B2E; display: block; margin-bottom: 8rpx; }
.menu-tags    { display: flex; gap: 8rpx; flex-wrap: wrap; }
.menu-tag     { font-size: 20rpx; padding: 4rpx 12rpx; border-radius: 12rpx; background: #FFF0F3; color: #FF6B8A; font-weight: 600; }
.menu-tag.blue { background: #EEF4FF; color: #4A90E2; }
.menu-actions { display: flex; gap: 12rpx; padding: 0 16rpx 16rpx; }
.action-btn   { flex: 1; padding: 10rpx; border-radius: 12rpx; text-align: center; font-size: 28rpx; background: rgba(255,107,138,0.06); }
.empty-state  { text-align: center; padding: 80rpx 40rpx; }
.empty-icon   { font-size: 100rpx; display: block; }
.empty-text   { font-size: 28rpx; color: #B89AAA; display: block; margin-top: 16rpx; }
.modal-mask   { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.45); z-index: 999; display: flex; align-items: flex-end; }
.modal-sheet  { background: #fff; border-radius: 40rpx 40rpx 0 0; padding: 24rpx 32rpx 60rpx; width: 100%; max-height: 85vh; overflow-y: auto; }
.modal-handle-bar { width: 80rpx; height: 8rpx; background: #E8D8DE; border-radius: 8rpx; margin: 0 auto 32rpx; }
.modal-title  { font-size: 36rpx; font-weight: 800; color: #2D1B2E; display: block; text-align: center; margin-bottom: 32rpx; }
.form-group   { margin-bottom: 24rpx; }
.form-group.half { flex: 1; }
.form-row     { display: flex; gap: 20rpx; }
.form-label   { font-size: 26rpx; font-weight: 600; color: #7A5C6E; display: block; margin-bottom: 10rpx; }
.form-input   { width: 100%; height: 88rpx; padding: 20rpx 24rpx; border: 3rpx solid rgba(255,107,138,0.2); border-radius: 20rpx; font-size: 28rpx; background: #FFF0F3; box-sizing: border-box; line-height: 48rpx; }
.form-picker  { padding: 20rpx 24rpx; border: 3rpx solid rgba(255,107,138,0.2); border-radius: 20rpx; font-size: 28rpx; background: #FFF0F3; display: flex; justify-content: space-between; align-items: center; }
.picker-arrow { color: #B89AAA; }
.form-textarea { width: 100%; padding: 20rpx 24rpx; border: 3rpx solid rgba(255,107,138,0.2); border-radius: 20rpx; font-size: 28rpx; background: #FFF0F3; height: 140rpx; box-sizing: border-box; }
.emoji-row    { display: flex; gap: 10rpx; flex-wrap: wrap; }
.emoji-opt    { padding: 12rpx 16rpx; border-radius: 16rpx; border: 3rpx solid transparent; background: rgba(255,107,138,0.06); }
.emoji-opt.active { border-color: #FF6B8A; background: #FFF0F3; }
.emoji-text   { font-size: 40rpx; }
.modal-btn    { display: block; margin: 16rpx auto 0; padding: 28rpx 80rpx; border-radius: 28rpx; text-align: center; font-size: 32rpx; font-weight: 700; color: #fff; background: linear-gradient(135deg, #FF6B8A, #FF8C69); }
</style>
