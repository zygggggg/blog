<template>
  <div id="app" :style="appStyle">
    <!-- 音符装饰 - 全局显示（仅播放时） -->
    <div id="notes" v-show="musicStore.isPlaying"></div>

    <Navbar />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <BackgroundSelector />
    <MusicPlayer />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useBackgroundStore } from './stores/background'
import { useMusicStore } from './stores/music'
import Navbar from './components/Navbar.vue'
import BackgroundSelector from './components/BackgroundSelector.vue'
import MusicPlayer from './components/MusicPlayer.vue'

const backgroundStore = useBackgroundStore()
const musicStore = useMusicStore()

const appStyle = computed(() => ({
  backgroundImage: `url('${backgroundStore.currentBackgroundUrl}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
  minHeight: '100vh',
  width: '100%'
}))

onMounted(() => {
  createNotes()
})

// 监听播放状态，决定是否显示音符
watch(() => musicStore.isPlaying, (isPlaying) => {
  const notesContainer = document.getElementById('notes')
  if (notesContainer) {
    if (isPlaying) {
      // 播放时显示音符
      notesContainer.style.display = 'block'
    } else {
      // 暂停时隐藏音符
      notesContainer.style.display = 'none'
    }
  }
})

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
</script>

<style>
/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>
