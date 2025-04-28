<template>
  <view class="app-container">
    <view class="header">
      <view class="logo-container">
        <view class="logo">
          <text class="iconfont icon-book"></text>
        </view>
        <text class="app-title">书智对谈</text>
      </view>
    </view>

    <view class="chat-container">
      <view class="welcome-container">
        <text class="iconfont icon-psychology welcome-icon"></text>
        <text class="welcome-title">欢迎使用书智对谈</text>
        <text class="welcome-text">扫描书籍ISBN码或手动输入，开启与书本的智能对话。从此阅读不再枯燥，让AI为你解读书中精彩。</text>
        
        <view class="features">
          <view class="feature-item">
            <text class="iconfont icon-books feature-icon"></text>
            <text class="feature-title">深度解析</text>
            <text class="feature-description">智能分析书籍内容，回答深度问题</text>
          </view>
          <view class="feature-item">
            <text class="iconfont icon-message feature-icon"></text>
            <text class="feature-title">智能对话</text>
            <text class="feature-description">与书籍进行自然交流，获取洞见</text>
          </view>
        </view>
        
        <view class="action-buttons">
          <button class="action-button" @click="scanISBN">
            <text class="iconfont icon-scan"></text>
            <text class="action-button-title">扫描ISBN</text>
            <text class="action-button-description">快速扫码识别书籍</text>
          </button>
          <button class="action-button" @click="manualInput">
            <text class="iconfont icon-edit"></text>
            <text class="action-button-title">手动输入</text>
            <text class="action-button-description">直接输入书籍信息</text>
          </button>
        </view>
      </view>
      
      <view v-for="(item, index) in messages" :key="index" 
            class="message" :class="item.type === 'user' ? 'message-user' : 'message-bot'">
        {{ item.content }}
      </view>
    </view>

    <view class="input-container">
      <button class="function-button">
        <text class="iconfont icon-mic"></text>
      </button>
      <input type="text" class="chat-input" v-model="inputMessage" 
             placeholder="输入问题，与书本对话..." @keypress.enter="sendMessage" />
      <button class="send-button" @click="sendMessage">
        <text class="iconfont icon-send"></text>
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      welcomeVisible: true,
      inputMessage: '',
      messages: []
    }
  },
  methods: {
    scanISBN() {
      uni.scanCode({
        scanType: ['barCode'],
        success: (res) => {
          console.log('扫码结果：', res.result);
          // 处理扫码结果，可以跳转到书籍详情页或直接开始对话
          this.startChat(`我想了解ISBN为${res.result}的书籍`);
        }
      });
    },
    manualInput() {
      uni.navigateTo({
        url: '/pages/book-input/book-input'
      });
    },
    sendMessage() {
      if (!this.inputMessage.trim()) return;
      
      // 添加用户消息
      this.messages.push({
        type: 'user',
        content: this.inputMessage
      });
      
      // 清空输入框
      const userMessage = this.inputMessage;
      this.inputMessage = '';
      
      // 隐藏欢迎界面
      this.welcomeVisible = false;
      
      // 模拟机器人回复
      setTimeout(() => {
        this.messages.push({
          type: 'bot',
          content: '我正在分析这本书的内容，请稍等...'
        });
        
        // 这里应该有实际的API请求来获取回复
        // 实际应用中应该调用后端API
      }, 1000);
    },
    startChat(message) {
      this.inputMessage = message;
      this.sendMessage();
    }
  }
}
</script>

<style>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #FAFAFA;
}

.header {
  padding: 32rpx;
  background-color: #5D5FEF;
  color: white;
  text-align: center;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 80rpx;
  height: 80rpx;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
}

.logo .iconfont {
  color: #5D5FEF;
  font-size: 48rpx;
}

.app-title {
  font-size: 48rpx;
  font-weight: bold;
}

.chat-container {
  flex: 1;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.welcome-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48rpx;
}

.welcome-icon {
  font-size: 128rpx;
  color: #5D5FEF;
  margin-bottom: 32rpx;
}

.welcome-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #1A1A2E;
  margin-bottom: 24rpx;
}

.welcome-text {
  font-size: 32rpx;
  color: #4A4A6A;
  margin-bottom: 48rpx;
  line-height: 1.5;
}

.features {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 100%;
  margin-top: 32rpx;
}

.feature-item {
  width: 45%;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.feature-icon {
  color: #5D5FEF;
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.feature-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.feature-description {
  font-size: 28rpx;
  color: #4A4A6A;
}

.action-buttons {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 48rpx;
}

.action-button {
  width: 45%;
  background-color: #5D5FEF;
  color: white;
  border: none;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.action-button:active {
  transform: scale(0.95);
}

.action-button .iconfont {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.action-button-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.action-button-description {
  font-size: 24rpx;
  opacity: 0.9;
}

.message {
  max-width: 80%;
  margin-bottom: 32rpx;
  padding: 24rpx 32rpx;
  border-radius: 36rpx;
}

.message-user {
  align-self: flex-end;
  background-color: #5D5FEF;
  color: white;
  border-bottom-right-radius: 8rpx;
}

.message-bot {
  align-self: flex-start;
  background-color: #F0F0F0;
  color: #1A1A2E;
  border-bottom-left-radius: 8rpx;
}

.input-container {
  padding: 24rpx 32rpx;
  background-color: #FFFFFF;
  border-top: 1rpx solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.function-button {
  background-color: transparent;
  border: none;
  padding: 0;
  margin-right: 24rpx;
}

.function-button .iconfont {
  font-size: 48rpx;
  color: #4A4A6A;
}

.chat-input {
  flex: 1;
  border: 1rpx solid rgba(0, 0, 0, 0.1);
  border-radius: 48rpx;
  padding: 24rpx 32rpx;
  font-size: 32rpx;
  background-color: #F5F5F5;
}

.send-button {
  background-color: #5D5FEF;
  color: white;
  border: none;
  border-radius: 50%;
  width: 88rpx;
  height: 88rpx;
  margin-left: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
}

.send-button:active {
  transform: scale(0.95);
}

.send-button .iconfont {
  font-size: 40rpx;
}
</style>
