<template>
  <div class="board-page">
    <div class="board-container">
      <div class="board-header">
        <h1>留言板</h1>
        <p>留下你的足迹</p>
      </div>

      <div class="messages-section">
        <div class="messages-list">
          <div v-if="messages.length === 0" class="empty-message">
            <p>还没有留言，快来抢沙发吧！</p>
          </div>
          <div
            v-for="message in messages"
            :key="message.id"
            class="message-card"
          >
            <div class="message-header">
              <div class="message-author">
                <img :src="getAvatar(message.id)" alt="avatar" class="author-avatar" />
                <span class="author-name">{{ message.nickname }}</span>
              </div>
              <span class="message-time">{{ formatTime(message.createTime) }}</span>
            </div>
            <div class="message-content">{{ message.content }}</div>
            <div class="message-actions">
              <button class="delete-btn" @click="deleteMessage(message.id)">🗑️ 删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="post-message-section">
      <div class="post-form">
        <input v-model="nickname" type="text" id="nicknameInput" placeholder="你的昵称" maxlength="20">
        <textarea v-model="content" id="messageInput" placeholder="写下你的留言..." maxlength="500"></textarea>
        <div class="post-actions">
          <span class="char-count">{{ content.length }}/500</span>
          <button class="post-btn" @click="postMessage">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API_BASE_URL = '/api/board'

const messages = ref([])
const nickname = ref('')
const content = ref('')

onMounted(() => {
  loadMessages()
})

async function loadMessages() {
  try {
    const response = await fetch(`${API_BASE_URL}/list?page=1&size=100`)
    const result = await response.json()
    if (result.code === 200) {
      messages.value = result.data.list
    }
  } catch (error) {
    console.error('Load messages error:', error)
  }
}

async function postMessage() {
  if (!nickname.value.trim()) {
    alert('请输入昵称！')
    return
  }
  if (!content.value.trim()) {
    alert('请输入留言内容！')
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname: nickname.value,
        content: content.value
      })
    })
    const result = await response.json()
    if (result.code === 200) {
      content.value = ''
      showToast('留言发表成功！')
      await loadMessages()
    }
  } catch (error) {
    console.error('Post message error:', error)
    alert('发表失败')
  }
}

async function deleteMessage(id) {
  if (!confirm('确定要删除这条留言吗？')) return

  try {
    const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
      method: 'DELETE'
    })
    const result = await response.json()
    if (result.code === 200) {
      showToast('留言已删除')
      await loadMessages()
    }
  } catch (error) {
    console.error('Delete message error:', error)
  }
}

function getAvatar(id) {
  const avatarNum = (id % 4) + 1
  return `/images/homepic${avatarNum}.png`
}

function formatTime(timeString) {
  if (!timeString) return '刚刚'
  const date = new Date(timeString)
  if (isNaN(date.getTime()) || date.getTime() === 0) return '刚刚'

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function showToast(message) {
  const toast = document.createElement('div')
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(102, 126, 234, 0.95);
    color: white;
    padding: 12px 24px;
    border-radius: 25px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    font-weight: 600;
  `
  document.body.appendChild(toast)
  setTimeout(() => {
    document.body.removeChild(toast)
  }, 2000)
}
</script>

<style scoped>
.board-page {
  width: 100%;
  min-height: 100vh;
}

/* 留言板容器 */
.board-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 90px 20px 220px 20px;
  position: relative;
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 留言板头部 */
.board-header {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(26, 10, 46, 0.9) 0%, rgba(46, 10, 46, 0.8) 100%);
  border-radius: 12px;
  backdrop-filter: blur(15px) saturate(180%);
  border: 1px solid rgba(139, 0, 255, 0.3);
  box-shadow: 0 0 30px rgba(139, 0, 255, 0.3),
              inset 0 0 20px rgba(139, 0, 255, 0.1),
              0 8px 32px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.6s ease;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.board-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg,
    transparent 30%,
    rgba(139, 0, 255, 0.1) 50%,
    transparent 70%);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-50%) translateY(-50%) rotate(0deg); }
  100% { transform: translateX(-50%) translateY(-50%) rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.board-header h1 {
  margin: 0;
  font-size: 2rem;
  color: #fff;
  text-shadow: 0 0 10px rgba(139, 0, 255, 0.8),
               0 0 20px rgba(255, 0, 139, 0.6);
  position: relative;
  z-index: 1;
}

.board-header p {
  margin: 5px 0 0 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  position: relative;
  z-index: 1;
}

/* 发表留言区域 - 固定在底部 */
.post-message-section {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 900px;
  padding: 35px 40px;
  min-height: 140px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  border: 2px solid rgba(139, 0, 255, 0.5);
  border-radius: 16px;
  box-shadow: 0 -8px 32px rgba(139, 0, 255, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.post-form {
  display: flex;
  gap: 10px;
  width: 100%;
  max-width: 800px;
  align-items: center;
  flex-wrap: nowrap;
}

#nicknameInput {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(139, 0, 255, 0.2);
}

#nicknameInput::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

#nicknameInput:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(139, 0, 255, 0.3),
              0 4px 12px rgba(139, 0, 255, 0.2);
  border-color: rgba(139, 0, 255, 0.6);
  transform: translateY(-1px);
}

#messageInput {
  flex: 3;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
  height: 60px;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(139, 0, 255, 0.2);
}

#messageInput::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

#messageInput:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(139, 0, 255, 0.3),
              0 4px 12px rgba(139, 0, 255, 0.2);
  border-color: rgba(139, 0, 255, 0.6);
  transform: translateY(-1px);
}

.post-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
}

.char-count {
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
}

.post-btn {
  background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%);
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
  position: relative;
  overflow: hidden;
}

.post-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.post-btn:hover::before {
  width: 300px;
  height: 300px;
}

.post-btn:hover {
  background: linear-gradient(135deg, #ff1493 0%, #ff69b4 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 105, 180, 0.5);
}

.post-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 105, 180, 0.3);
}

/* 留言列表区域 */
.messages-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 20px 0;
  gap: 20px;
  min-height: 0;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  justify-content: center;
}

/* 空状态 */
.empty-message {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

/* 留言卡片 */
.message-card {
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12px;
  padding: 20px;
  min-height: 140px;
  border: 1px solid rgba(139, 0, 255, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideIn 0.4s ease;
  width: 100%;
  backdrop-filter: blur(10px);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 20px rgba(139, 0, 255, 0.4),
              0 0 30px rgba(139, 0, 255, 0.2);
  border-color: rgba(139, 0, 255, 0.5);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.message-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(139, 0, 255, 0.5);
}

.author-name {
  font-weight: 600;
  color: #fff;
  font-size: 14px;
}

.message-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.message-content {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin-bottom: 10px;
  word-wrap: break-word;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
}

.delete-btn {
  background: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.8);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.delete-btn:hover {
  background: rgba(255, 0, 0, 0.4);
  border-color: rgba(255, 0, 0, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 0, 0, 0.3);
}
</style>
