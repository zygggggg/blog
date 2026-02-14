<template>
  <nav :class="navClass">
    <div class="navtitle"><strong>PHROLOVA</strong></div>

    <button class="bg-selector-btn" @click="handleBgClick" title="选择背景">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    </button>

    <button class="music-btn" @click="handleMusicClick" title="音乐播放器">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18V5l12-2v13"></path>
        <circle cx="6" cy="18" r="3"></circle>
        <circle cx="18" cy="16" r="3"></circle>
      </svg>
    </button>

    <router-link to="/home">HOME</router-link>
    <router-link to="/information">VIDEO</router-link>
    <router-link to="/chat">CHAT</router-link>
    <router-link to="/album">ALBUM</router-link>
    <router-link to="/board">BOARD</router-link>

    <div :class="['navanim', currentRoute]"></div>
    <div class="none"></div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMusicStore } from '../stores/music'
import { useBackgroundStore } from '../stores/background'

const route = useRoute()
const musicStore = useMusicStore()
const backgroundStore = useBackgroundStore()

const currentRoute = computed(() => route.name || 'home')
const navClass = computed(() => {
  if (route.name === 'home') return 'homenav'
  return ''
})

function handleBgClick(event) {
  event.preventDefault()
  event.stopPropagation()
  console.log('Background button clicked')
  backgroundStore.toggleSelector()
}

function handleMusicClick(event) {
  event.preventDefault()
  event.stopPropagation()
  console.log('Music button clicked')
  musicStore.togglePlayer()
}
</script>

<style scoped>
/* 确保导航栏按钮可以点击 */
.bg-selector-btn,
.music-btn {
  position: relative;
  z-index: 100;
  pointer-events: auto;
  cursor: pointer;
}
</style>
