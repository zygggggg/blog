<template>
  <div class="home-container">
    <!-- 漂浮粒子 -->
    <div id="particles"></div>

    <!-- 漂浮头像（娱乐用） -->
    <div id="floating-avatars" v-show="showFloatingAvatars">
      <img
        v-for="(avatar, index) in floatingAvatars"
        :key="index"
        :src="avatar.src"
        :style="{
          left: avatar.x + 'px',
          top: avatar.y + 'px',
          width: '80px',
          height: '80px'
        }"
        class="floating-avatar"
        @mouseenter="moveAwayFromMouse(index, $event)"
      />
    </div>

    <main class="main">
      <section class="sec home-hero">
        <div class="hero-content">
          <h1 class="hero-title">弗洛洛</h1>
          <p class="hero-subtitle">PHROLOVA · 挽歌 永不落幕</p>
          <button class="divider-btn" id="dividerBtn" @click="toggleWallpaperView">
            <span>•</span>
            <span>+</span>
            <span>+</span>
            <span>•</span>
          </button>
          <p class="hero-quote">我曾梦见，与你亲密无间<br>醒来发现，你我形同陌路</p>
          <button class="hero-btn" @click="backgroundStore.toggleSelector">选择背景图片 ◇</button>
        </div>
      </section>

      <section class="sec" id="cards-section">
        <router-link to="/information">
          <div class="part1 pt">
            <div class="imghid"><div class="img"></div></div>
            <div class="txt">
              <h1>VIDEO</h1>
              <p>&emsp;&emsp;挽歌永不落幕，记忆在光影中流转</p>
              <p>&emsp;&emsp;A visual journey through memories and emotions. Watch the story unfold in moving pictures</p>
            </div>
          </div>
        </router-link>

        <router-link to="/chat">
          <div class="part2 pt">
            <div class="txt">
              <h1>CHAT</h1>
              <p>&emsp;与AI对话，探索无限可能</p>
              <p>&emsp;Engage in conversations with AI. Share thoughts, ask questions, and discover new perspectives</p>
            </div>
            <div class="imghid"><div class="img"></div></div>
          </div>
        </router-link>

        <router-link to="/album">
          <div class="part3 pt">
            <div class="imghid"><div class="img"></div></div>
            <div class="txt">
              <h1>ALBUM</h1>
              <p>&emsp;&emsp;珍藏时光的碎片，定格美好瞬间</p>
              <p>&emsp;&emsp;A collection of precious moments frozen in time. Every picture tells a story worth remembering</p>
            </div>
          </div>
        </router-link>

        <router-link to="/board">
          <div class="part4 pt">
            <div class="txt">
              <h1>BOARD</h1>
              <p>&emsp;&emsp;留下你的足迹，分享你的故事</p>
              <p>&emsp;&emsp;Leave your mark and share your thoughts. A space for connection and meaningful exchanges</p>
            </div>
            <div class="imghid"><div class="img"></div></div>
          </div>
        </router-link>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useBackgroundStore } from '../stores/background'
import { useMusicStore } from '../stores/music'

const backgroundStore = useBackgroundStore()
const musicStore = useMusicStore()
const isWallpaperMode = ref(false)
const wasMusicPlayerOpen = ref(false)
const showFloatingAvatars = ref(false)
const floatingAvatars = ref([
  { src: '/images/homepic1.png', x: 200, y: 200, vx: 2, vy: 1.5 },
  { src: '/images/homepic2.png', x: 600, y: 400, vx: -1.5, vy: 2 },
  { src: '/images/homepic3.png', x: 400, y: 100, vx: 1, vy: -2 }
])

let animationId = null

onMounted(() => {
  createParticles()
  initFloatingAvatars()
})

onBeforeUnmount(() => {
  stopFloatingAnimation()
})

function createParticles() {
  const container = document.getElementById('particles')
  if (!container) return

  const count = 15
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div')
    particle.className = 'particle'
    particle.style.left = Math.random() * 100 + '%'
    particle.style.animationDelay = Math.random() * 10 + 's'
    particle.style.animationDuration = (8 + Math.random() * 4) + 's'
    container.appendChild(particle)
  }
}

function toggleWallpaperView() {
  isWallpaperMode.value = !isWallpaperMode.value
  console.log('Wallpaper mode toggled:', isWallpaperMode.value)

  const heroContent = document.querySelector('.hero-content')
  const nav = document.querySelector('nav')
  const cardsSection = document.getElementById('cards-section')
  const musicPlayer = document.getElementById('musicPlayer')

  if (isWallpaperMode.value) {
    // 进入壁纸模式：隐藏所有内容 + 播放音乐 + 显示漂浮头像
    if (heroContent) heroContent.classList.add('wallpaper-mode')
    if (nav) {
      nav.style.transform = 'translateY(-100%)'
      nav.style.opacity = '0'
      nav.style.transition = 'all 0.5s ease'
    }
    if (cardsSection) {
      cardsSection.style.transform = 'translateY(100vh)'
      cardsSection.style.opacity = '0'
      cardsSection.style.transition = 'all 0.5s ease'
    }

    // 播放音乐（从第一首开始）
    if (!musicStore.isPlaying) {
      musicStore.loadTrack(0) // 加载并播放第一首
    }

    // 显示漂浮头像
    showFloatingAvatars.value = true
    startFloatingAnimation()

    // 记录播放器状态并关闭
    wasMusicPlayerOpen.value = musicStore.playerVisible
    if (wasMusicPlayerOpen.value) {
      musicStore.togglePlayer()
    }
  } else {
    // 退出壁纸模式：恢复所有内容 + 停止漂浮头像
    if (heroContent) heroContent.classList.remove('wallpaper-mode')
    if (nav) {
      nav.style.transform = 'translateY(0)'
      nav.style.opacity = '1'
    }
    if (cardsSection) {
      cardsSection.style.transform = 'translateY(0)'
      cardsSection.style.opacity = '1'
    }

    // 隐藏漂浮头像
    showFloatingAvatars.value = false
    stopFloatingAnimation()

    // 恢复播放器状态
    if (wasMusicPlayerOpen.value) {
      musicStore.togglePlayer()
    }
  }
}

// 漂浮头像相关函数
function initFloatingAvatars() {
  // 随机初始位置
  floatingAvatars.value.forEach(avatar => {
    avatar.x = Math.random() * (window.innerWidth - 100)
    avatar.y = Math.random() * (window.innerHeight - 100)
    avatar.vx = (Math.random() - 0.5) * 3
    avatar.vy = (Math.random() - 0.5) * 3
  })
}

function startFloatingAnimation() {
  const animate = () => {
    floatingAvatars.value.forEach(avatar => {
      // 更新位置
      avatar.x += avatar.vx
      avatar.y += avatar.vy

      // 边界检测和反弹
      if (avatar.x <= 0 || avatar.x >= window.innerWidth - 80) {
        avatar.vx = -avatar.vx
        avatar.x = Math.max(0, Math.min(avatar.x, window.innerWidth - 80))
      }
      if (avatar.y <= 0 || avatar.y >= window.innerHeight - 80) {
        avatar.vy = -avatar.vy
        avatar.y = Math.max(0, Math.min(avatar.y, window.innerHeight - 80))
      }
    })

    if (showFloatingAvatars.value) {
      animationId = requestAnimationFrame(animate)
    }
  }

  animate()
}

function stopFloatingAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
}

function moveAwayFromMouse(index, event) {
  const avatar = floatingAvatars.value[index]
  const rect = event.target.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const mouseX = event.clientX
  const mouseY = event.clientY

  // 计算远离鼠标的方向
  const dx = centerX - mouseX
  const dy = centerY - mouseY
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance < 100) { // 如果鼠标靠近
    // 加速远离
    const force = 10
    avatar.vx = (dx / distance) * force
    avatar.vy = (dy / distance) * force

    // 随机一个新的目标位置
    setTimeout(() => {
      avatar.vx = (Math.random() - 0.5) * 4
      avatar.vy = (Math.random() - 0.5) * 4
    }, 500)
  }
}
</script>

<style scoped>
/* 确保容器不影响布局 */
.home-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

/* 确保按钮可以点击 */
.divider-btn,
.hero-btn {
  position: relative;
  z-index: 10;
  pointer-events: auto;
  cursor: pointer;
}

/* 漂浮头像容器 */
#floating-avatars {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

/* 漂浮头像 */
.floating-avatar {
  position: absolute;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 20px rgba(255, 105, 180, 0.6),
              0 0 40px rgba(139, 0, 255, 0.4);
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: avatarGlow 2s ease-in-out infinite;
}

.floating-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(255, 105, 180, 0.8),
              0 0 60px rgba(139, 0, 255, 0.6);
}

@keyframes avatarGlow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 105, 180, 0.6),
                0 0 40px rgba(139, 0, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 105, 180, 0.8),
                0 0 60px rgba(139, 0, 255, 0.6);
  }
}
</style>
