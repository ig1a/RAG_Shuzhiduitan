<template>
  <view class="app-container">
    <view class="chat-container">
      <!-- 欢迎界面 - 根据状态控制显示 -->
      <view class="welcome-container" v-if="!bookSelected" :style="{ opacity: welcomeOpacity }">
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
      
      <!-- 书籍信息栏 - 当选中书籍时显示 -->
      <view class="book-info-container" v-if="bookSelected" :style="{ opacity: bookInfoOpacity }">
        <view class="book-info-content">
          <image class="book-cover" :src="currentBook.coverUrl || '/static/default-book.png'"></image>
          <view class="book-details">
            <text class="book-title">{{currentBook.title}}</text>
            <text class="book-author">作者：{{currentBook.author}}</text>
            <text class="book-publisher">出版社：{{currentBook.publisher}}</text>
            <text class="book-intro-label">简介：</text>
            <text class="book-intro">{{currentBook.introduction}}</text>
          </view>
        </view>
        <button class="cancel-button" @click="cancelBookChat">
          <text>退出与本书对话</text>
        </button>
      </view>
      
      <!-- 聊天消息 -->
      <view v-for="(item, index) in messages" :key="index" 
            class="message" :class="item.type === 'user' ? 'message-user' : 'message-bot'">
        <rich-text v-if="item.type === 'bot'" :nodes="formatMessage(item.content)"></rich-text>
        <text v-else>{{ item.content }}</text>
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
// 功能变更记录
// 2025-05-06 接入后端 API，替换前端模拟数据与对话
// 2025-05-06 优化聊天逻辑，增加调试日志和错误处理
// 2025-05-06 修复聊天内容显示问题，确保正确接收并展示流式内容
// 2025-05-06 优化消息显示，支持富文本展示和简单 Markdown 格式
// 2025-05-06 修复真机上的堆栈溢出错误
// 2025-05-06 修复 Int8Array 与二进制数据处理相关错误
import { getBook } from '@/services/book.js'
import { streamChat } from '@/services/chat.js'
export default {
  data() {
    return {
      welcomeVisible: true,
      inputMessage: '',
      messages: [],
      bookSelected: false,
      welcomeOpacity: 1,
      bookInfoOpacity: 0,
      currentBook: {
        isbn: '',
        title: '',
        author: '',
        publisher: '',
        introduction: '',
        coverUrl: ''
      },
      sseTask: null // 新增：SSE 请求任务引用
    }
  },
  methods: {
    // 格式化消息内容，支持简单的富文本
    formatMessage(content) {
      if (!content) return '';
      
      // 机器人思考中状态显示加载动画
      if (content === '正在思考...') {
        return `<span style="color:#777;">${content}</span>`;
      }
      
      // 转义特殊字符
      let formatted = String(content)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      
      // 简单的 Markdown 转换
      // 粗体
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // 斜体
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
      // 代码
      formatted = formatted.replace(/`(.*?)`/g, '<code style="background:#f1f1f1;padding:2px 4px;border-radius:3px;">$1</code>');
      // 换行
      formatted = formatted.replace(/\n/g, '<br/>');
      
      return formatted;
    },
    scanISBN() {
      uni.scanCode({
        scanType: ['barCode'],
        onlyFromCamera: false,
        success: (res) => {
          console.log('条码类型：' + res.scanType);
          console.log('条码内容：' + res.result);
          
          if (res.result && (res.result.length === 10 || res.result.length === 13)) {
            // 调用后端获取书籍数据
            this.fetchBookInfo(res.result);
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
              // 调用后端获取书籍信息
              this.fetchBookInfo(res.content);
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
      
      // 机器人占位消息 - 先显示"正在思考..."
      const botMsg = { 
        type: 'bot', 
        content: '正在思考...' 
      };
      this.messages.push(botMsg);

      // 备份并清空输入
      const userInput = this.inputMessage;
      this.inputMessage = '';
      
      // 打印调试信息
      console.log('发送消息:', userInput);
      console.log('当前书籍:', this.currentBook);

      // 构造 OpenAI 消息上下文 - 只发送最近记录避免过长
      const recentMessages = this.messages
        .slice(0, this.messages.length - 1) // 去掉"正在思考..."占位符
        .slice(-10) // 只取最近10条
        .map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content
        }));
      
      console.log('发送上下文:', recentMessages);

      // 调用后端流式接口
      this.sseTask = streamChat({
        isbn: this.currentBook.isbn,
        messages: recentMessages,
        onMessage: (json) => {
          // 调试日志 - 检查 JSON 结构
          console.log('原始收到内容:', 
            typeof json === 'object' ? JSON.stringify(json).substring(0, 100) : json);
          
          // 清除"正在思考..."
          if (botMsg.content === '正在思考...') {
            botMsg.content = '';
          }
          
          // 提取增量内容
          let deltaText = '';
          
          // 匹配不同格式返回
          if (json.choices && json.choices.length > 0) {
            const choice = json.choices[0];
            
            // 增量格式 delta.content
            if (choice.delta && choice.delta.content !== undefined) {
              deltaText = choice.delta.content;
            }
            // 非增量格式 text 或 content
            else if (choice.text) {
              deltaText = choice.text;
            } else if (choice.content) {
              deltaText = choice.content;
            } else if (typeof choice === 'string') {
              deltaText = choice;
            }
            
            // 如果有 content 属性 
            if (choice.content && typeof choice.content === 'string') {
              deltaText = choice.content;
            }
          } else if (json.content) {
            // 直接返回内容格式
            deltaText = json.content;
          } else if (typeof json === 'string') {
            // 纯文本
            deltaText = json;
          }
          
          // 如果能提取到文本，则追加到消息中
          if (deltaText) {
            console.log(`追加文本: "${deltaText}"`);
            // 通过 Vue 的响应式 set 确保视图更新
            botMsg.content += deltaText;
            // 仅更新视图，不做自动滚动（避免堆栈溢出）
            this.$forceUpdate();
          } else {
            console.warn('无法从响应提取文本内容:', json);
          }
        },
        onError: (err) => {
          console.error('对话失败:', err);
          // 如果还是"正在思考"，则替换为错误提示
          if (botMsg.content === '正在思考...') {
            botMsg.content = '对话失败，请稍后重试。';
          } else {
            // 追加错误提示
            botMsg.content += '\n\n[对话中断，请稍后重试]';
          }
          uni.showToast({ title: '对话失败', icon: 'none' });
        },
        onComplete: () => {
          console.log('对话完成');
          // 如果最终内容仍为正在思考，说明没有接收到任何内容
          if (botMsg.content === '正在思考...') {
            botMsg.content = '抱歉，未能获取到回复内容。';
          }
          this.sseTask = null;
        }
      });
    },
    startChat(message) {
      this.inputMessage = message;
      this.sendMessage();
    },
    // 获取书籍信息
    async fetchBookInfo(isbn) {
      uni.showLoading({ title: '获取书籍信息...' });
      try {
        const data = await getBook(isbn);
        this.currentBook = {
          isbn: data.isbn,
          title: data.title,
          author: data.author,
          publisher: data.publisher,
          introduction: data.introduction,
          coverUrl: data.cover_url
        };
        uni.hideLoading();
        this.switchToBookMode();
      } catch (e) {
        uni.hideLoading();
        uni.showToast({ title: '获取书籍失败', icon: 'none' });
      }
    },
    // 切换到书籍对话模式
    switchToBookMode() {
      // 先将欢迎界面淡出
      this.welcomeOpacity = 0;
      
      setTimeout(() => {
        this.bookSelected = true;
        
        // 将书籍信息淡入
        setTimeout(() => {
          this.bookInfoOpacity = 1;
          
          // 添加一条系统消息
          this.messages = [{
            type: 'bot',
            content: `你好，我是《${this.currentBook.title}》的智能助手，请问有什么可以帮助你的吗？`
          }];
        }, 100);
      }, 300);
    },
    // 取消书籍对话
    cancelBookChat() {
      if (this.sseTask && this.sseTask.abort) this.sseTask.abort();
      // 先将书籍信息淡出
      this.bookInfoOpacity = 0;
      
      setTimeout(() => {
        this.bookSelected = false;
        
        // 清除对话记录
        this.messages = [];
        
        // 将欢迎界面淡入
        setTimeout(() => {
          this.welcomeOpacity = 1;
        }, 100);
      }, 300);
    },
    // 滚动到聊天底部 - 简化版本，避免循环引用
    scrollToBottom() {
      // 使用简单的滚动逻辑
      setTimeout(() => {
        uni.pageScrollTo({
          scrollTop: 9999,
          duration: 100
        });
      }, 200);
    },
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
  transition: opacity 0.3s ease;
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

/* 书籍信息样式 */
.book-info-container {
  width: 100%;
  background-color: #FFFFFF;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  transition: opacity 0.3s ease;
}

.book-info-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.book-cover {
  width: 180rpx;
  height: 240rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  margin-right: 20rpx;
}

.book-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1A1A2E;
  margin-bottom: 10rpx;
}

.book-author {
  font-size: 26rpx;
  color: #4A4A6A;
  margin-bottom: 8rpx;
}

.book-publisher {
  font-size: 26rpx;
  color: #4A4A6A;
  margin-bottom: 8rpx;
}

.book-intro-label {
  font-size: 26rpx;
  font-weight: bold;
  color: #4A4A6A;
  margin-top: 10rpx;
}

.book-intro {
  font-size: 24rpx;
  color: #4A4A6A;
  line-height: 1.5;
  margin-top: 4rpx;
}

.cancel-button {
  width: 100%;
  background-color: #F5F5F5;
  color: #5D5FEF;
  border: 1px solid #5D5FEF;
  border-radius: 40rpx;
  padding: 12rpx 0;
  margin-top: 20rpx;
  font-size: 26rpx;
}

.cancel-button:active {
  background-color: #EAEAEA;
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
