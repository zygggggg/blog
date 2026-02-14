<template>
  <div id="app" :style="appStyle">
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
import { computed } from 'vue'
import { useBackgroundStore } from './stores/background'
import Navbar from './components/Navbar.vue'
import BackgroundSelector from './components/BackgroundSelector.vue'
import MusicPlayer from './components/MusicPlayer.vue'

const backgroundStore = useBackgroundStore()

const appStyle = computed(() => ({
  backgroundImage: `url('${backgroundStore.currentBackgroundUrl}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  backgroundRepeat: 'no-repeat',
  minHeight: '100vh',
  width: '100%'
}))
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
