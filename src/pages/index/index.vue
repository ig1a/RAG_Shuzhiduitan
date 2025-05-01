<template>
  <view class="app-container">
    <view class="chat-container">
      <view class="welcome-container">
        <image class="welcome-icon" src="/static/logo.png"></image>
        <text class="welcome-title">欢迎使用书智对谈</text>
        <text class="welcome-text">扫描书籍ISBN码或手动输入，开启与书本的智能对话。从此阅读不再枯燥，让AI为你解读书中精彩。</text>
        
        <view class="features">
          <view class="feature-item">
            <uni-icons class="feature-icon" type="list" size="30" color="#5D5FEF"></uni-icons>
            <text class="feature-title">深度解析</text>
            <text class="feature-description">智能分析书籍内容，回答深度问题</text>
          </view>
          <view class="feature-item">
            <uni-icons class="feature-icon" type="chatboxes" size="30" color="#5D5FEF"></uni-icons>
            <text class="feature-title">智能对话</text>
            <text class="feature-description">与书籍进行自然交流，获取洞见</text>
          </view>
        </view>
        
        <view class="action-buttons">
          <button class="action-button" @click="scanISBN">
            <uni-icons class="action-icon" type="scan" size="30" color="#FFFFFF"></uni-icons>
            <text class="action-button-title">扫描ISBN</text>
            <text class="action-button-description">快速扫码识别书籍</text>
          </button>
          <button class="action-button" @click="manualInput">
            <uni-icons class="action-icon" type="font" size="30" color="#FFFFFF"></uni-icons>
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
        <uni-icons type="mic-filled" size="25" color="#4A4A6A"></uni-icons>
      </button>
      <input type="text" class="chat-input" v-model="inputMessage" 
             placeholder="输入问题，与书本对话..." @keypress.enter="sendMessage" />
      <button class="send-button" @click="sendMessage">
        <uni-icons type="paperplane" size="20" color="#FFFFFF"></uni-icons>
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
        onlyFromCamera: false,
        success: (res) => {
          console.log('条码类型：' + res.scanType);
          console.log('条码内容：' + res.result);
          
          if (res.result && (res.result.length === 10 || res.result.length === 13)) {
            this.startChat(`我想了解ISBN为${res.result}的书籍`);
          } else {
            uni.showToast({
              title: '无效的ISBN码，请重新扫描',
              icon: 'none',
              duration: 2000
            });
          }
        },
        fail: (err) => {
          console.error('扫码失败:', err);
          uni.showToast({
            title: '扫码失败，请重试',
            icon: 'none',
            duration: 2000
          });
        },
        complete: () => {
          console.log('扫码操作完成');
        }
      });
    },
    manualInput() {
      // 弹出输入框让用户输入ISBN
      uni.showModal({
        title: '手动输入ISBN',
        placeholderText: '请输入13位ISBN码',
        editable: true,
        success: (res) => {
          if (res.confirm && res.content) {
            // 验证ISBN格式（简单验证，可以扩展为更复杂的验证）
            if (res.content.length === 13 || res.content.length === 10) {
              // 开始与输入的ISBN对应的书籍对话
              this.startChat(`我想了解ISBN为${res.content}的书籍`);
            } else {
              // ISBN格式不正确，提示用户
              uni.showToast({
                title: 'ISBN格式不正确，请输入10位或13位ISBN',
                icon: 'none',
                duration: 2000
              });
            }
          }
        }
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

.chat-container {
  flex: 1;
  padding: 20rpx;
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
  padding: 30rpx;
}

.welcome-icon {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
}

.welcome-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #1A1A2E;
  margin-bottom: 20rpx;
}

.welcome-text {
  font-size: 28rpx;
  color: #4A4A6A;
  margin-bottom: 40rpx;
  line-height: 1.5;
}

.features {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 20rpx;
  margin-bottom: 40rpx;
  gap: 24rpx;
}

.feature-item {
  flex: 1;
  background-color: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx 15rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.feature-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
  margin-top: 10rpx;
}

.feature-description {
  font-size: 24rpx;
  color: #4A4A6A;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 30rpx;
  gap: 24rpx;
}

.action-button {
  flex: 1;
  background-color: #5D5FEF;
  color: white;
  border: none;
  border-radius: 20rpx;
  padding: 24rpx 15rpx;
  margin-bottom: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.15);
}

.action-button:active {
  transform: scale(0.95);
}

.action-button-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
  margin-top: 10rpx;
}

.action-button-description {
  font-size: 24rpx;
  opacity: 0.9;
}

.message {
  max-width: 80%;
  margin-bottom: 20rpx;
  padding: 20rpx;
  border-radius: 30rpx;
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
  padding: 20rpx;
  background-color: #FFFFFF;
  border-top: 1rpx solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.function-button {
  background-color: transparent;
  border: none;
  padding: 0;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-input {
  flex: 1;
  border: 1rpx solid rgba(0, 0, 0, 0.1);
  border-radius: 40rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #F5F5F5;
}

.send-button {
  background-color: #5D5FEF;
  color: white;
  border: none;
  border-radius: 50%;
  width: 70rpx;
  height: 70rpx;
  margin-left: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
}

.send-button:active {
  transform: scale(0.95);
}
</style>
