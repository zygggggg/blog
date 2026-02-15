<template>
  <div class="chat-wrapper">
    <div class="chat-container">
      <div class="chat-header">
        <div class="chat-avatar">
          <img src="/images/homepic1.png" alt="角色头像">
        </div>
        <div class="chat-info">
          <h2>WZY 助手</h2>
          <p class="status">在线</p>
        </div>
        <button class="clear-btn" @click="clearChat">🗑️ 清空对话</button>
      </div>

      <div class="chat-messages" ref="messagesContainer">
        <div class="welcome-message">
          <p>👋 你好！我是 WZY 助手，有什么可以帮助你的吗？</p>
        </div>
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.type]"
        >
          <div class="message-avatar">
            <img :src="msg.type === 'user' ? userAvatar : '/images/homepic1.png'" alt="头像">
          </div>
          <div class="message-bubble">{{ msg.content }}</div>
        </div>
        <div v-if="isWaiting" class="message ai">
          <div class="message-avatar">
            <img src="/images/homepic1.png" alt="头像">
          </div>
          <div class="message-bubble typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div class="chat-input-container">
        <textarea
          v-model="inputMessage"
          class="chat-input"
          placeholder="输入消息..."
          rows="1"
          @keydown.enter.exact="sendMessage"
        ></textarea>
        <button class="send-btn" @click="sendMessage">
          <span>发送</span>
          <span class="send-icon">📤</span>
        </button>
      </div>
    </div>

    <!-- 头像选择器 -->
    <div class="avatar-selector">
      <div class="avatar-selector-title">选择头像</div>
      <div class="avatar-options">
        <div
          :class="['avatar-option', { active: userAvatar === '/images/system_images/drifter_man_1.png' }]"
          @click="changeAvatar('/images/system_images/drifter_man_1.png')"
        >
          <img src="/images/system_images/drifter_man_1.png" alt="男漂">
          <span>男漂</span>
        </div>
        <div
          :class="['avatar-option', { active: userAvatar === '/images/system_images/drifter_woman_2.png' }]"
          @click="changeAvatar('/images/system_images/drifter_woman_2.png')"
        >
          <img src="/images/system_images/drifter_woman_2.png" alt="女漂">
          <span>女漂</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API_CONFIG = {
  baseUrl: '',
  chatEndpoint: '/api/chat/message'
}

const messages = ref([])
const inputMessage = ref('')
const messagesContainer = ref(null)
const isWaiting = ref(false)
const userAvatar = ref('/images/system_images/drifter_man_1.png') // 默认男漂

onMounted(() => {
  // 从 localStorage 加载历史消息
  const savedMessages = localStorage.getItem('chatMessages')
  if (savedMessages) {
    messages.value = JSON.parse(savedMessages)
  }

  // 从 localStorage 加载用户头像设置
  const savedAvatar = localStorage.getItem('chatUserAvatar')
  if (savedAvatar) {
    userAvatar.value = savedAvatar
  }
})

// 切换头像
function changeAvatar(avatarPath) {
  userAvatar.value = avatarPath
  localStorage.setItem('chatUserAvatar', avatarPath)
}

async function sendMessage() {
  if (!inputMessage.value.trim()) return

  const userMessage = inputMessage.value

  // 添加用户消息
  messages.value.push({
    type: 'user',
    content: userMessage
  })

  // 清空输入框
  inputMessage.value = ''
  scrollToBottom()

  // 显示等待指示器
  isWaiting.value = true

  // 调用后端API
  try {
    // 从 localStorage 获取或创建用户 ID
    let userId = localStorage.getItem('chatUserId')
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('chatUserId', userId)
    }

    const response = await fetch(API_CONFIG.baseUrl + API_CONFIG.chatEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userMessage,
        userId: userId
      })
    })

    if (!response.ok) {
      throw new Error('API 请求失败')
    }

    const data = await response.json()

    // 检查返回数据
    if (data.code === 200 && data.data && data.data.reply) {
      messages.value.push({
        type: 'ai',
        content: data.data.reply
      })
    } else {
      throw new Error('回复格式错误')
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    messages.value.push({
      type: 'ai',
      content: '抱歉，我遇到了一些问题。请稍后再试。🙏'
    })
  } finally {
    // 隐藏等待指示器
    isWaiting.value = false
  }

  // 保存消息到 localStorage
  saveMessages()
  scrollToBottom()
}

function saveMessages() {
  localStorage.setItem('chatMessages', JSON.stringify(messages.value))
}

function clearChat() {
  if (confirm('确定要清空对话吗？')) {
    messages.value = []
    localStorage.removeItem('chatMessages')
  }
}

function scrollToBottom() {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 100)
}
</script>

<style scoped>
.chat-wrapper {
  height: 100vh;
  width: 100%;
  padding-top: 70px;
  padding-left: 20px;
  padding-right: 20px;
  padding-bottom: 20px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.chat-container {
  max-width: 1000px;
  width: 100%;
  max-height: calc(100vh - 110px);
  background: rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.chat-header {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px 30px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.chat-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.chat-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-info {
  flex: 1;
}

.chat-info h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.chat-info .status {
  margin: 5px 0 0;
  color: #4caf50;
  font-size: 14px;
}

.clear-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.welcome-message {
  text-align: center;
  padding: 20px;
  color: #666;
  margin-bottom: 10px;
}

.message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message.ai {
  flex-direction: row;
  align-self: flex-start;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-bubble {
  max-width: 500px;
  padding: 12px 18px;
  border-radius: 18px;
  line-height: 1.5;
  word-wrap: break-word;
  word-break: break-word;
  font-size: 15px;
  color: #333 !important;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.message.user .message-bubble {
  border-bottom-right-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.message.ai .message-bubble {
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 等待输入动画 */
.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 12px 18px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(1) {
  animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.chat-input-container {
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 15px;
  align-items: center;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  padding: 12px 18px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 25px;
  font-size: 15px;
  resize: none;
  font-family: inherit;
  background: white;
  color: #333;
  transition: all 0.3s;
}

.chat-input:focus {
  outline: none;
  border-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
}

.send-btn {
  background: white;
  color: #333;
  border: 2px solid rgba(0, 0, 0, 0.1);
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.send-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: rgba(0, 0, 0, 0.2);
}

.send-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .chat-wrapper {
    padding: 80px 10px 10px;
  }

  .chat-container {
    max-height: calc(100vh - 110px);
    border-radius: 15px;
  }

  .chat-header {
    padding: 15px 20px;
  }

  .chat-messages {
    padding: 20px 15px;
  }

  .message-bubble {
    max-width: 300px;
  }

  .message-avatar {
    width: 35px;
    height: 35px;
  }
}

/* 头像选择器 */
.avatar-selector {
  position: fixed;
  right: 30px;
  top: 120px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  z-index: 100;
  width: 200px;
}

.avatar-selector-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.avatar-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid transparent;
}

.avatar-option:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-option.active {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.6);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.avatar-option img {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.avatar-option.active img {
  border-color: rgba(102, 126, 234, 0.6);
}

.avatar-option span {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.avatar-option.active span {
  color: rgba(102, 126, 234, 1);
  font-weight: 600;
}

@media (max-width: 768px) {
  .avatar-selector {
    right: 10px;
    top: 100px;
    width: 160px;
    padding: 15px;
  }

  .avatar-selector-title {
    font-size: 14px;
  }

  .avatar-option {
    padding: 10px;
  }

  .avatar-option img {
    width: 35px;
    height: 35px;
  }

  .avatar-option span {
    font-size: 14px;
  }
}
</style>
