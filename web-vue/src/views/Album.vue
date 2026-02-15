<template>
  <div class="album-container">
    <div class="upload-section">
      <button class="upload-btn" @click="triggerFileInput">Upload Image</button>
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

    <div v-if="selectedImage" class="image-modal" @click="closeImage">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeImage">X</button>
        <img :src="selectedImage.fileUrl" :alt="selectedImage.originalName">
      </div>
    </div>

    <div v-if="uploadPreview" class="upload-modal">
      <div class="upload-modal-content">
        <h2>Upload Image</h2>
        <div class="preview-area">
          <img :src="uploadPreview" alt="Preview">
        </div>
        <input
          v-model="uploadDescription"
          type="text"
          placeholder="Image description (optional)"
          class="desc-input"
          maxlength="100"
        >
        <div class="upload-actions">
          <button @click="cancelUpload" class="btn-cancel">Cancel</button>
          <button @click="confirmUpload" :disabled="uploading" class="btn-confirm">
            {{ uploading ? 'Uploading...' : 'Confirm Upload' }}
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
const CACHE_TTL_MS = 5 * 60 * 1000
const CACHE_KEY = 'album_images_cache'
const CACHE_EXPIRES_AT_KEY = 'album_images_cache_expires_at'

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
  const hasCache = restoreImagesFromCache()
  loading.value = !hasCache
  await loadImages({ forceRefresh: true, background: hasCache })
  window.addEventListener('focus', handleWindowFocus)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onActivated(() => {
  refreshIfNeeded()
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', handleWindowFocus)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

function sortImages(list) {
  return [...list].sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime))
}

function writeImagesCache(list) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(list))
  localStorage.setItem(CACHE_EXPIRES_AT_KEY, String(Date.now() + CACHE_TTL_MS))
}

function clearImagesCache() {
  localStorage.removeItem(CACHE_KEY)
  localStorage.removeItem(CACHE_EXPIRES_AT_KEY)
}

function restoreImagesFromCache() {
  try {
    const cachedRaw = localStorage.getItem(CACHE_KEY)
    const expiresRaw = localStorage.getItem(CACHE_EXPIRES_AT_KEY)
    if (!cachedRaw || !expiresRaw) {
      return false
    }

    const expiresAt = Number(expiresRaw)
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
      clearImagesCache()
      return false
    }

    const cachedList = JSON.parse(cachedRaw)
    if (!Array.isArray(cachedList)) {
      clearImagesCache()
      return false
    }

    images.value = sortImages(cachedList)
    return true
  } catch (error) {
    console.error('Restore cache failed:', error)
    clearImagesCache()
    return false
  }
}

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
  loadImages({ forceRefresh: true, background: images.value.length > 0 })
}

async function loadImages({ forceRefresh = false, background = false } = {}) {
  try {
    if (!forceRefresh) {
      const hasCache = restoreImagesFromCache()
      if (hasCache) {
        loading.value = false
        return
      }
    }

    if (!background) {
      loading.value = true
    }

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

    if (result.code === 200) {
      if (result.data.list && Array.isArray(result.data.list)) {
        const nextList = sortImages(result.data.list)
        images.value = nextList
        writeImagesCache(nextList)
      } else if (!background) {
        images.value = []
        clearImagesCache()
      }
    } else if (!background) {
      images.value = []
      clearImagesCache()
    }
  } catch (error) {
    console.error('Load images failed:', error)
    if (!background && images.value.length === 0) {
      images.value = []
    }
  } finally {
    if (!background) {
      loading.value = false
    }
  }
}

function triggerFileInput() {
  fileInput.value.click()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    alert('Image size must be <= 10MB')
    return
  }

  selectedFile.value = file

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
    alert('Please select an image first')
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
      uploadMessage.value = 'Upload successful'
      uploadStatus.value = 'success'

      setTimeout(() => {
        cancelUpload()
        clearImagesCache()
        loadImages({ forceRefresh: true, background: false })
      }, 1000)
    } else {
      throw new Error(result.message || 'Upload failed')
    }
  } catch (error) {
    console.error('Upload failed:', error)
    uploadMessage.value = 'Upload failed: ' + error.message
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
  content: 'View';
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

/* 婵犵數濮烽弫鍛婃叏閹绢喗鍎夊鑸靛姇缁狙囧箹鐎涙ɑ灏ù婊呭亾娣囧﹪濡堕崟顓炲闂佸憡鐟ョ换鎰版箒闂佺绻愰崥瀣礊閹寸姷纾奸柍褜鍓氬鍕沪缁嬪じ澹曞Δ鐘靛仜閻忔繈宕濆顓滀簻闁挎柨鐏濆畵鍡欌偓瑙勬礃閸旀瑥鐣锋總绋垮嵆闁绘柨鎼鎶芥⒒娴ｅ憡鎯堥柛濠冩倐閹ê鈹戦崼銏㈩槸闂佸搫绉查崝搴ｇ不閸撗€鍋撻崗澶婁壕婵犵數濮崇欢姘跺磻濡ゅ懏鈷戠紓浣股戦幆鍕煕鐎ｎ亷宸ラ柣锝囧厴瀹曞ジ寮撮悙宥佹櫊閺屻劑寮崶鑸电秷闁诲孩淇哄Λ鍕煘閹达附鍋愭い鏃囧亹娴煎嫰姊虹涵鍛彧闁圭懓娲╁Λ鐔兼⒒娓氬洤澧紒澶嬫尦閹?*/
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

/* 婵犵數濮烽弫鍛婃叏閻戣棄鏋侀柛娑橈攻閸欏繐霉閸忓吋缍戦柛銊ュ€婚幉鎼佹偋閸繄鐟查梺绋款儏椤︾敻寮婚弴锛勭杸閻庯綆浜栭崑鎾诲即閻樼數鐒奸梺鍛婂姦閸犳鎮￠崘顔界厱婵犻潧妫楅鈺呮煛鐎ｃ劌鈧牜鎹㈠☉姗嗗晠妞ゆ棁鍋愭禒绋库攽椤旂》鍔熺紒顕呭灦楠炲繘宕ㄩ弶鎴濈獩婵犵數濮撮崯顐﹀礈閻㈠憡鈷戦柤濮愬€曟禒锕傛煕閹存繄绉虹€规洘鍨剁换婵嬪磼濠婂嫭顔曢梻浣告惈濞层垽宕归崷顓犵焼闁告劦鍠楅崑锝夋煕閵夈儲鎼愭俊顐㈢焸瀹曟垿骞樼拠鏌ユ暅濠德板€撻懗鍫曞储閸楃偐鏀介柣鎰綑閻忋儳鈧娲﹂崜娑㈠极椤曗偓閺佹劖寰勭€ｎ剙骞楅梻浣告惈閸燁偊宕愰崫銉︽殰闁割偅娲橀悡鐔兼煙閻戞ɑ灏伴柕鍥ㄧ箞閺岋紕浠﹂崜褎鍒涘Δ鐘靛仜濞差厼鐣峰鍕缂佸娉曢崢鎺撶節閻㈤潧浠滈柣掳鍔庨崚鎺戭吋婢跺﹦锛熼梺瑙勫劶婵倗绮婚幒妤佲拻濞达絿鎳撻婊呯磼鐠囨彃鈧潡骞冭椤劑宕煎┑鍡樺劒闂備礁鎲￠崝锕傚窗濡ゅ懏鍋傛繛鎴欏灪閻?*/
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

/* 闂傚倸鍊搁崐鎼佸磹閹间礁纾瑰瀣捣閻棗銆掑锝呬壕濡ょ姷鍋涢ˇ鐢稿极瀹ュ绀嬫い鎺嗗亾閹兼潙锕铏圭矙閹稿孩鎷辩紓渚囧枛闁帮綁骞嗗畝鍕缂備焦锚閳ь剛鏁婚弻娑⑩€﹂幋婵呯敖闂佺妫勯崯顐﹀煘閹达富鏁婇柦妯侯槴閺嬫瑩姊洪崫鍕伇闁哥姵鎸惧Σ鎰板箳閹冲磭鍠愬顏堝级閸喚浜栭梻鍌氬€烽悞锕傚箖閸洖纾归柡宥庣亹濞差亝鍋勯柛蹇曞帶娴滄顪冮妶鍡楀Ё缂佺姵鍨块幃娆愮節閸ャ劎鍘繝銏ｆ硾閻楀棝宕濆顑芥斀妞ゆ柨鎼悘顔剧磼鏉堛劍灏伴柟宄版嚇閹兘寮跺▎鐐秾濠碉紕鍋戦崐鎴﹀礉瀹€鍕櫇妞ゅ繐鐗忓畵渚€鏌涢幇鐢靛帥婵炵鍔戦弻宥堫檨闁告挾鍠栭悰顕€宕橀妸銏＄€婚梺鍦亾濞兼瑥鈻撻妶鍜佹富闁靛牆妫楃粭鎺楁煕鐎ｎ亝顥㈢€规洦鍓熷畷婊勬媴閾忕櫢绱抽梻浣侯焾閺堫剟鎮烽妸鈺佺閻忕偠袙閺€浠嬫煟閹般劍娅呭ù婊呭亾娣囧﹪鎮欓鍕ㄥ亾閹达箑纾块柡灞诲劚缁犱即鏌ゆ慨鎰偓妤呮儗婢跺备鍋撻獮鍨姎闁瑰嘲顑呴…鍥箥椤旂懓浜鹃柛蹇擃槸娴滈箖姊洪柅鐐茶嫰婢ф挳鏌熼鍏煎仴闁糕斁鍋撳銈嗗笒鐎氼參鎮″▎鎾寸厾闁革富鍘奸。鑲╂喐閹跺﹤鎳愮壕鐣屸偓骞垮劙缁€浣圭閹€鏀?900px闂傚倸鍊搁崐鎼佸磹閹间礁纾瑰瀣捣閻棗銆掑锝呬壕濡ょ姷鍋為悧鐘汇€侀弴銏℃櫇闁逞屽墴閹潡顢氶埀顒勫蓟閻旂厧绠氶柣妤€鐗滃Λ鍕⒑閸濆嫬顏ラ柛搴ｆ暬瀵鍨鹃幇浣告倯闁硅偐琛ラ埀顒€纾鎰版⒒娴ｅ憡鎯堟い鎴濆濞嗐垹顫濈捄楦挎憰濠电偞鍨剁划搴ㄦ偪閳ь剙鈹戦鏂や緵闁稿繑绋戞晥婵°倕鎳忛埛?闂?*/
@media (max-width: 1900px) {
  .image-grid,
  .skeleton-cards {
    grid-template-columns: repeat(5, 300px);
  }
}

/* 闂傚倸鍊搁崐鎼佸磹閹间礁纾瑰瀣捣閻棗銆掑锝呬壕濡ょ姷鍋涢ˇ鐢稿极瀹ュ绀嬫い鎺嗗亾閹兼潙锕铏圭矙閹稿孩鎷辩紓渚囧枛闁帮綁骞嗗畝鍕缂備焦锚閳ь剛鏁婚弻娑⑩€﹂幋婵呯敖闂佺妫勯崯顐﹀煘閹达富鏁婇柦妯侯槴閺嬫瑩姊洪崫鍕伇闁哥姵鎸惧Σ鎰板箳閹冲磭鍠愬顏堝级閸喚浜栭梻鍌氬€烽悞锕傚箖閸洖纾归柡宥庣亹濞差亝鍋勯柛蹇曞帶娴滄顪冮妶鍡楀Ё缂佺姵鍨块幃娆愮節閸ャ劎鍘繝銏ｆ硾閻楀棝宕濆顑芥斀妞ゆ柨鎼悘顔剧磼鏉堛劍灏伴柟宄版嚇閹兘寮跺▎鐐秾濠碉紕鍋戦崐鎴﹀礉瀹€鍕櫇妞ゅ繐鐗忓畵渚€鏌涢幇鐢靛帥婵炵鍔戦弻宥堫檨闁告挾鍠栭悰顕€宕橀妸銏＄€婚梺鍦亾濞兼瑥鈻撻妶鍜佹富闁靛牆妫楃粭鎺楁煕鐎ｎ亝顥㈢€规洦鍓熷畷婊勬媴閾忕櫢绱抽梻浣侯焾閺堫剟鎮烽妸鈺佺閻忕偠袙閺€浠嬫煟閹般劍娅呭ù婊呭亾娣囧﹪鎮欓鍕ㄥ亾閹达箑纾块柡灞诲劚缁犱即鏌ゆ慨鎰偓妤呮儗婢跺备鍋撻獮鍨姎闁瑰嘲顑呴…鍥箥椤旂懓浜鹃柛蹇擃槸娴滈箖姊洪柅鐐茶嫰婢ф挳鏌熼鍏煎仴闁糕斁鍋撳銈嗗笒鐎氼參鎮″▎鎾寸厾闁革富鍘奸。鑲╂喐閹跺﹤鎳愮壕鐣屸偓骞垮劙缁€浣圭閹€鏀?600px闂傚倸鍊搁崐鎼佸磹閹间礁纾瑰瀣捣閻棗銆掑锝呬壕濡ょ姷鍋為悧鐘汇€侀弴銏℃櫇闁逞屽墴閹潡顢氶埀顒勫蓟閻旂厧绠氶柣妤€鐗滃Λ鍕⒑閸濆嫬顏ラ柛搴ｆ暬瀵鍨鹃幇浣告倯闁硅偐琛ラ埀顒€纾鎰版⒒娴ｅ憡鎯堟い鎴濆濞嗐垹顫濈捄楦挎憰濠电偞鍨剁划搴ㄦ偪閳ь剙鈹戦鏂や緵闁稿繑绋戞晥婵°倕鎳忛埛?闂?*/
@media (max-width: 1600px) {
  .image-grid,
  .skeleton-cards {
    grid-template-columns: repeat(4, 300px);
  }
}

/* 闂傚倸鍊搁崐鎼佸磹閹间礁纾瑰瀣捣閻棗銆掑锝呬壕濡ょ姷鍋涢ˇ鐢稿极瀹ュ绀嬫い鎺嗗亾閹兼潙锕铏圭矙閹稿孩鎷辩紓渚囧枛闁帮綁骞嗗畝鍕缂備焦锚閳ь剛鏁婚弻娑⑩€﹂幋婵呯敖闂佺妫勯崯顐﹀煘閹达富鏁婇柦妯侯槴閺嬫瑩姊洪崫鍕伇闁哥姵鎸惧Σ鎰板箳閹冲磭鍠愬顏堝级閸喚浜栭梻鍌氬€烽悞锕傚箖閸洖纾归柡宥庣亹濞差亝鍋勯柛蹇曞帶娴滄顪冮妶鍡楀Ё缂佺姵鍨块幃娆愮節閸ャ劎鍘繝銏ｆ硾閻楀棝宕濆顑芥斀妞ゆ柨鎼悘顔剧磼鏉堛劍灏伴柟宄版嚇閹兘寮跺▎鐐秾濠碉紕鍋戦崐鎴﹀礉瀹€鍕櫇妞ゅ繐鐗忓畵渚€鏌涢幇鐢靛帥婵炵鍔戦弻宥堫檨闁告挾鍠栭悰顕€宕橀妸銏＄€婚梺鍦亾濞兼瑥鈻撻妶鍜佹富闁靛牆妫楃粭鎺楁煕鐎ｎ亝顥㈢€规洦鍓熷畷婊勬媴閾忕櫢绱抽梻浣侯焾閺堫剟鎮烽妸鈺佺閻忕偠袙閺€浠嬫煟閹般劍娅呭ù婊呭亾娣囧﹪鎮欓鍕ㄥ亾閹达箑纾块柡灞诲劚缁犱即鏌ゆ慨鎰偓妤呮儗婢跺备鍋撻獮鍨姎闁瑰嘲顑呴…鍥箥椤旂懓浜鹃柛蹇擃槸娴滈箖姊洪柅鐐茶嫰婢ф挳鏌熼鍏煎仴闁糕斁鍋撳銈嗗笒鐎氼參鎮″▎鎾寸厾闁革富鍘奸。鑲╂喐閹跺﹤鎳愮壕鐣屸偓骞垮劙缁€浣圭閹€鏀?300px闂傚倸鍊搁崐鎼佸磹閹间礁纾瑰瀣捣閻棗銆掑锝呬壕濡ょ姷鍋為悧鐘汇€侀弴銏℃櫇闁逞屽墴閹潡顢氶埀顒勫蓟閻旂厧绠氶柣妤€鐗滃Λ鍕⒑閸濆嫬顏ラ柛搴ｆ暬瀵鍨鹃幇浣告倯闁硅偐琛ラ埀顒€纾鎰版⒒娴ｅ憡鎯堟い鎴濆濞嗐垹顫濈捄楦挎憰濠电偞鍨剁划搴ㄦ偪閳ь剙鈹戦鏂や緵闁稿繑绋戞晥婵°倕鎳忛埛?闂?*/
@media (max-width: 1300px) {
  .image-grid,
  .skeleton-cards {
    grid-template-columns: repeat(3, 300px);
  }
}

/* 闂傚倸鍊搁崐鎼佸磹閹间礁纾瑰瀣捣閻棗銆掑锝呬壕濡ょ姷鍋涢ˇ鐢稿极瀹ュ绀嬫い鎺嗗亾閹兼潙锕铏圭矙閹稿孩鎷辩紓渚囧枛闁帮綁骞嗗畝鍕缂備焦锚閳ь剛鏁婚弻娑⑩€﹂幋婵呯敖闂佺妫勯崯顐﹀煘閹达富鏁婇柦妯侯槴閺嬫瑩姊洪崫鍕伇闁哥姵鎸惧Σ鎰板箳閹冲磭鍠愬顏堝级閸喚浜栭梻鍌氬€烽悞锕傚箖閸洖纾归柡宥庣亹濞差亝鍋勯柛蹇曞帶娴滄顪冮妶鍡楀Ё缂佺姵鍨块幃娆愮節閸ャ劎鍘繝銏ｆ硾閻楀棝宕濆顑芥斀妞ゆ柨鎼悘顔剧磼鏉堛劍灏伴柟宄版嚇閹兘寮跺▎鐐秾濠碉紕鍋戦崐鎴﹀礉瀹€鍕櫇妞ゅ繐鐗忓畵渚€鏌涢幇鐢靛帥婵炵鍔戦弻宥堫檨闁告挾鍠栭悰顕€宕橀妸銏＄€婚梺鍦亾濞兼瑥鈻撻妶鍜佹富闁靛牆妫楃粭鎺楁煕鐎ｎ亝顥㈢€规洦鍓熷畷婊勬媴閾忕櫢绱抽梻浣侯焾閺堫剟鎮烽妸鈺佺閻忕偠袙閺€浠嬫煟閹般劍娅呭ù婊呭亾娣囧﹪鎮欓鍕ㄥ亾閹达箑纾块柡灞诲劚缁犱即鏌ゆ慨鎰偓妤呮儗婢跺备鍋撻獮鍨姎闁瑰嘲顑呴…鍥箥椤旂懓浜鹃柛蹇擃槸娴滈箖姊洪柅鐐茶嫰婢ф挳鏌熼鍏煎仴闁糕斁鍋撳銈嗗笒鐎氼參鎮″▎鎾寸厾闁革富鍘奸。鑲╂喐閹跺﹤鎳愮壕鐣屸偓骞垮劙缁€浣圭閹€鏀?000px闂傚倸鍊搁崐鎼佸磹閹间礁纾瑰瀣捣閻棗銆掑锝呬壕濡ょ姷鍋為悧鐘汇€侀弴銏℃櫇闁逞屽墴閹潡顢氶埀顒勫蓟閻旂厧绠氶柣妤€鐗滃Λ鍕⒑閸濆嫬顏ラ柛搴ｆ暬瀵鍨鹃幇浣告倯闁硅偐琛ラ埀顒€纾鎰版⒒娴ｅ憡鎯堟い鎴濆濞嗐垹顫濈捄楦挎憰濠电偞鍨剁划搴ㄦ偪閳ь剙鈹戦鏂や緵闁稿繑绋戞晥婵°倕鎳忛埛?闂?*/
@media (max-width: 1000px) {
  .image-grid,
  .skeleton-cards {
    grid-template-columns: repeat(2, 300px);
  }
}

/* 闂傚倸鍊搁崐鎼佸磹閹间礁纾瑰瀣捣閻棗銆掑锝呬壕濡ょ姷鍋涢ˇ鐢稿极瀹ュ绀嬫い鎺嗗亾閹兼潙锕铏圭矙閹稿孩鎷辩紓渚囧枛闁帮綁骞嗗畝鍕缂備焦锚閳ь剛鏁婚弻娑⑩€﹂幋婵呯敖闂佺妫勯崯顐﹀煘閹达富鏁婇柦妯侯槴閺嬫瑩姊洪崫鍕伇闁哥姵鎸惧Σ鎰板箳閹冲磭鍠愬顏堝级閸喚浜栭梻鍌氬€烽悞锕傚箖閸洖纾归柡宥庣亹濞差亝鍋勯柛蹇曞帶娴滄顪冮妶鍡楀Ё缂佺姵鍨块幃娆愮節閸ャ劎鍘繝銏ｆ硾閻楀棝宕濆顑芥斀妞ゆ柨鎼悘顔剧磼鏉堛劍灏伴柟宄版嚇閹兘寮跺▎鐐秾濠碉紕鍋戦崐鎴﹀礉瀹€鍕櫇妞ゅ繐鐗忓畵渚€鏌涢幇鐢靛帥婵炵鍔戦弻宥堫檨闁告挾鍠栭悰顕€宕橀妸銏＄€婚梺鍦亾濞兼瑥鈻撻妶鍜佹富闁靛牆妫楃粭鎺楁煕鐎ｎ亝顥㈢€规洦鍓熷畷婊勬媴閾忕櫢绱抽梻浣侯焾閺堫剟鎮烽妸鈺佺閻忕偠袙閺€浠嬫煟閹般劍娅呭ù婊呭亾娣囧﹪鎮欓鍕ㄥ亾閹达箑纾块柡灞诲劚缁犱即鏌ゆ慨鎰偓妤呮儗婢跺备鍋撻獮鍨姎闁瑰嘲顑呴…鍥箥椤旂懓浜鹃柛蹇擃槸娴滈箖姊洪柅鐐茶嫰婢ф挳鏌熼鍏煎仴闁糕斁鍋撳銈嗗笒鐎氼參鎮″▎鎾寸厾闁革富鍘奸。鑲╂喐閹跺﹤鎳愮壕鐣屸偓骞垮劙缁€浣圭閹€鏀?00px闂傚倸鍊搁崐鎼佸磹閹间礁纾瑰瀣捣閻棗銆掑锝呬壕濡ょ姷鍋為悧鐘汇€侀弴銏℃櫇闁逞屽墴閹潡顢氶埀顒勫蓟閻旂厧绠氶柣妤€鐗滃Λ鍕⒑閸濆嫬顏ラ柛搴ｆ暬瀵鍨鹃幇浣告倯闁硅偐琛ラ埀顒€纾鎰版⒒娴ｅ憡鎯堟い鎴濆濞嗐垹顫濈捄楦挎憰濠电偞鍨剁划搴ㄦ偪閳ь剙鈹戦鏂や緵闁稿繑绋戞晥婵°倕鎳忛埛?闂?*/
@media (max-width: 700px) {
  .image-grid,
  .skeleton-cards {
    grid-template-columns: repeat(1, 300px);
  }
}

/* 婵犵數濮烽弫鍛婃叏閻戣棄鏋侀柟闂寸绾惧鏌ｉ幇顒佹儓闁搞劌鍊块弻娑㈩敃閿濆棛顦ョ紓浣哄С閸楁娊寮婚悢鍏尖拻閻庣數顭堟俊浠嬫⒑閸濆嫭鍣虹紒璇茬墦瀵濡搁妷銏℃杸闂佺硶鍓濋敋妞わ腹鏅涢—鍐Χ鎼粹€茬凹濠电偠灏欓崰鏍嵁閸愵亝鍠嗛柛鏇ㄥ墮椤繝姊虹憴鍕靛晱闁哥姵鑹惧畷妤呮⒒閸屾瑨鍏岀紒顕呭灠椤繑绻濆顒€鍋嶉悷婊勬楠炲啴鎮欑憗浣规そ椤㈡棃宕ㄩ姘疄闂傚倷娴囬～澶婎熆濡粯娅犻幖娣妼缁€鍡涙煛婢跺绱╅柣鐔煎亰閻撱儵鏌涢弴銊ヤ簻濠殿喓鍨藉濠氬炊瑜滃Ο鈧梺鍝勮閸斿矂鍩為幋锕€骞㈡繛鍡楃箚閹凤繝姊绘担瑙勫仩闁稿﹥娲熷畷顖炲箻椤旇壈鎽曢梺璺ㄥ枔婵挳鎮?*/
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
