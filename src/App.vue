<script>
// 功能变更记录
// 2025-05-06 接入后端登录
// 2025-05-06 暂时改用 mockLogin 跳过微信登录流程（开发测试用）
import { login, mockLogin } from '@/services/auth.js'
export default {
  async onLaunch() {
    console.log('App Launch')
    try {
      // 暂时使用模拟登录，跳过微信授权流程
      // 正式环境应替换为: await login()
      await mockLogin()
    } catch (e) {
      console.error('登录失败', e)
    }
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
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
