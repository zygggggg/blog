<template>
  <div class="home-container">
    <!-- 漂浮粒子 -->
    <div id="particles"></div>

    <!-- 音符装饰 -->
    <div id="notes"></div>

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
import { ref, onMounted } from 'vue'
import { useBackgroundStore } from '../stores/background'
import { useMusicStore } from '../stores/music'

const backgroundStore = useBackgroundStore()
const musicStore = useMusicStore()
const isWallpaperMode = ref(false)
const wasMusicPlayerOpen = ref(false)

onMounted(() => {
  createParticles()
  createNotes()
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

function createNotes() {
  const container = document.getElementById('notes')
  if (!container) return

  const notes = ['♪', '♫', '♬']
  for (let i = 0; i < 10; i++) {
    const note = document.createElement('div')
    note.className = 'note'
    note.textContent = notes[Math.floor(Math.random() * notes.length)]
    note.style.left = Math.random() * 100 + '%'
    note.style.animationDelay = Math.random() * 5 + 's'
    container.appendChild(note)
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
    // 进入壁纸模式：隐藏所有内容
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
    // 记录播放器状态并关闭
    wasMusicPlayerOpen.value = musicStore.playerVisible
    if (wasMusicPlayerOpen.value) {
      musicStore.togglePlayer()
    }
  } else {
    // 退出壁纸模式：恢复所有内容
    if (heroContent) heroContent.classList.remove('wallpaper-mode')
    if (nav) {
      nav.style.transform = 'translateY(0)'
      nav.style.opacity = '1'
    }
    if (cardsSection) {
      cardsSection.style.transform = 'translateY(0)'
      cardsSection.style.opacity = '1'
    }
    // 恢复播放器状态
    if (wasMusicPlayerOpen.value) {
      musicStore.togglePlayer()
    }
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
</style>
