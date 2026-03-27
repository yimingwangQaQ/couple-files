<script>
export default {
  onLaunch() {
    wx.cloud.init({
      env: 'cloud1-3guoyhbdb79e524d',  // ⚠️ 换成你的云环境ID
      traceUser: true
    })
    console.log('App Launch - 我们的小窝 💕')
    // 注册用户openid，用于互相发送通知
    wx.cloud.callFunction({ name: 'registerUser' }).catch(() => {})
  },
  onShow() {
    console.log('App Show')
  }
}
</script>

<style>
page {
  background-color: #FFFAF5;
  font-family: -apple-system, 'PingFang SC', 'Helvetica Neue', sans-serif;
  color: #2D1B2E;
}
</style>
