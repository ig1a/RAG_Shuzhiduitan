<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/*每个页面公共css */
@import url('./static/iconfont.css');

page {
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'Droid Sans Fallback', 'Microsoft Yahei', sans-serif;
  background-color: #FAFAFA;
  color: #1A1A2E;
  font-size: 28rpx;
}
</style>
