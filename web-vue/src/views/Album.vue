<template>
  <div class="album-container">
    <div class="upload-section">
      <button class="upload-btn" @click="triggerFileInput">上传图片</button>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileSelect"
      >
    </div>

    <div class="mid">
      <div class="banner">
        <div v-if="loading" class="skeleton-cards">
          <div v-for="i in 6" :key="i" class="skeleton-card">
            <div class="skeleton-image"></div>
          </div>
        </div>
        <div v-else class="image-grid">
          <div v-for="(img, index) in images" :key="index" class="image-card" @click="viewImage(img)">
            <img :src="img.fileUrl" :alt="img.originalName" loading="lazy">
            <p v-if="img.description">{{ img.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 大图查看模态框 -->
    <div v-if="selectedImage" class="image-modal" @click="closeImage">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeImage">✕</button>
        <img :src="selectedImage.fileUrl" :alt="selectedImage.originalName">
      </div>
    </div>

    <!-- 上传预览模态框 -->
    <div v-if="uploadPreview" class="upload-modal">
      <div class="upload-modal-content">
        <h2>上传图片</h2>
        <div class="preview-area">
          <img :src="uploadPreview" alt="预览">
        </div>
        <input
          v-model="uploadDescription"
          type="text"
          placeholder="图片描述（可选）"
          class="desc-input"
          maxlength="100"
        >
        <div class="upload-actions">
          <button @click="cancelUpload" class="btn-cancel">取消</button>
          <button @click="confirmUpload" :disabled="uploading" class="btn-confirm">
            {{ uploading ? '上传中...' : '确认上传' }}
          </button>
        </div>
        <p v-if="uploadMessage" :class="['upload-message', uploadStatus]">{{ uploadMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, onActivated } from 'vue'

const API_BASE_URL = '/api/album'

const REQUEST_SIZE = 100
const MIN_REFRESH_INTERVAL = 3000

const images = ref([])
const loading = ref(true)
const selectedImage = ref(null)
const fileInput = ref(null)
const uploadPreview = ref(null)
const uploadDescription = ref('')
const uploading = ref(false)
const uploadMessage = ref('')
const uploadStatus = ref('')
const selectedFile = ref(null)
let lastRefreshAt = 0

onMounted(async () => {
  console.log('Album页面加载，开始加载图片...')
  await loadImages(true)
  window.addEventListener('focus', handleWindowFocus)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onActivated(() => {
  loadImages(true)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', handleWindowFocus)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

function handleWindowFocus() {
  refreshIfNeeded()
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    refreshIfNeeded()
  }
}

function refreshIfNeeded() {
  const now = Date.now()
  if (now - lastRefreshAt < MIN_REFRESH_INTERVAL) {
    return
  }
  loadImages(true)
}

async function loadImages(forceRefresh = false) {
  try {
    if (forceRefresh) {
      loading.value = true
    }

    console.log('📡 正在从 API 获取相册图片列表...')
    const requestUrl = `${API_BASE_URL}/list?page=1&size=${REQUEST_SIZE}&_t=${Date.now()}`
    const response = await fetch(requestUrl, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()
    lastRefreshAt = Date.now()

    console.log('API返回结果:', result)

    if (result.code === 200) {
      console.log('✅ 成功加载相册图片列表')
      console.log('图片列表数据:', result.data)

      // 按上传时间倒序排列（新的在前面）
      if (result.data.list && Array.isArray(result.data.list)) {
        images.value = result.data.list.sort((a, b) =>
          new Date(b.uploadTime) - new Date(a.uploadTime)
        )
        console.log('设置的图片数量:', images.value.length)
      } else {
        console.error('数据格式错误，没有list字段')
        images.value = []
      }
    } else {
      console.error('加载图片失败:', result.message)
      images.value = []
    }
  } catch (error) {
    console.error('加载图片失败:', error)
    images.value = []
  } finally {
    loading.value = false
  }
}

function triggerFileInput() {
  fileInput.value.click()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件！')
    return
  }

  // 验证文件大小（10MB）
  if (file.size > 10 * 1024 * 1024) {
    alert('图片大小不能超过10MB！')
    return
  }

  selectedFile.value = file

  // 预览图片
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadPreview.value = e.target.result
    uploadDescription.value = ''
    uploadMessage.value = ''
  }
  reader.readAsDataURL(file)
}

function cancelUpload() {
  uploadPreview.value = null
  uploadDescription.value = ''
  selectedFile.value = null
  uploadMessage.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function confirmUpload() {
  if (!selectedFile.value) {
    alert('请先选择图片！')
    return
  }

  uploading.value = true
  uploadMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    if (uploadDescription.value.trim()) {
      formData.append('description', uploadDescription.value.trim())
    }

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    if (result.code === 200) {
      uploadMessage.value = '✅ 上传成功！'
      uploadStatus.value = 'success'

      // 延迟关闭并刷新
      setTimeout(() => {
        cancelUpload()
        // 重新加载图片列表
        loadImages(true)
      }, 1000)
    } else {
      throw new Error(result.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败:', error)
    uploadMessage.value = '❌ 上传失败: ' + error.message
    uploadStatus.value = 'error'
  } finally {
    uploading.value = false
  }
}

function viewImage(img) {
  selectedImage.value = img
}

function closeImage() {
  selectedImage.value = null
}
</script>

<style scoped>
.album-container {
  min-height: 100vh;
  padding: 0;
  width: 100%;
}

.upload-section {
  position: fixed;
  bottom: 30px;
  left: 30px;
  z-index: 1001;
  width: fit-content;
  height: fit-content;
  pointer-events: none;
}

.upload-btn {
  background: linear-gradient(135deg, #FF6B9D 0%, #C9379D 50%, #9D25B7 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 25px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.4);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.upload-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.6);
}

.upload-btn:active {
  transform: translateY(-1px);
}

.mid {
  min-height: calc(100vh - 70px);
  width: 100%;
  padding: 100px 20px 80px;
}

.banner {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  justify-content: center;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(6, 300px);
  gap: 20px;
  justify-content: center;
}

.image-card {
  width: 300px;
  height: 400px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
}

.image-card::after {
  content: '🔍 点击查看大图';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  white-space: nowrap;
}

.image-card:hover::after {
  opacity: 1;
}

.image-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.image-card img {
  width: 300px;
  height: 400px;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 0.3s ease;
  background: rgba(255, 255, 255, 0.2);
}

.image-card:hover img {
  transform: scale(1.05);
}

.image-card p {
  padding: 10px;
  margin: 0;
  color: #fff;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.5);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 骨架屏样式 */
.skeleton-cards {
  display: grid;
  grid-template-columns: repeat(6, 300px);
  gap: 20px;
  width: 100%;
  justify-content: center;
}

.skeleton-card {
  width: 300px;
  height: 400px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  overflow: hidden;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 大图查看模态框 */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
}

.modal-content img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  background: transparent;
  border-radius: 0;
}

.close-btn {
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 30px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

/* 响应式：屏幕小于1900px时改为5列 */
@media (max-width: 1900px) {
  .image-grid,
  .skeleton-cards {
    grid-template-columns: repeat(5, 300px);
  }
}

/* 响应式：屏幕小于1600px时改为4列 */
@media (max-width: 1600px) {
  .image-grid,
  .skeleton-cards {
    grid-template-columns: repeat(4, 300px);
  }
}

/* 响应式：屏幕小于1300px时改为3列 */
@media (max-width: 1300px) {
  .image-grid,
  .skeleton-cards {
    grid-template-columns: repeat(3, 300px);
  }
}

/* 响应式：屏幕小于1000px时改为2列 */
@media (max-width: 1000px) {
  .image-grid,
  .skeleton-cards {
    grid-template-columns: repeat(2, 300px);
  }
}

/* 响应式：屏幕小于700px时改为1列 */
@media (max-width: 700px) {
  .image-grid,
  .skeleton-cards {
    grid-template-columns: repeat(1, 300px);
  }
}

/* 上传模态框 */
.upload-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}

.upload-modal-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
}

.upload-modal-content h2 {
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
}

.preview-area {
  width: 100%;
  max-height: 300px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  overflow: hidden;
}

.preview-area img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.desc-input {
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.desc-input:focus {
  outline: none;
  border-color: #FF6B9D;
}

.upload-actions {
  display: flex;
  gap: 10px;
}

.upload-actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.btn-cancel:hover {
  background: rgba(0, 0, 0, 0.2);
}

.btn-confirm {
  background: linear-gradient(135deg, #FF6B9D 0%, #C9379D 50%, #9D25B7 100%);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.4);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-message {
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
}

.upload-message.success {
  color: #4caf50;
}

.upload-message.error {
  color: #f44336;
}
</style>
