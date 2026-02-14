<template>
  <div :class="['music-player', { show: musicStore.playerVisible }]">
    <div class="music-header">
      <h3>🎵 音乐播放器</h3>
      <button class="close-music-btn" @click="musicStore.togglePlayer">×</button>
    </div>

    <div class="music-info">
      <div class="music-cover">
        <img :src="musicStore.currentTrack.cover" alt="封面">
      </div>
      <div class="music-details">
        <div class="music-title">{{ musicStore.currentTrack.title }}</div>
        <div class="music-artist">{{ musicStore.currentTrack.artist }}</div>
      </div>
    </div>

    <div class="music-progress">
      <span class="time-current">{{ formatTime(musicStore.currentTime) }}</span>
      <input
        type="range"
        class="progress-bar"
        min="0"
        max="100"
        :value="musicStore.progress"
        @input="handleSeek"
      >
      <span class="time-total">{{ formatTime(musicStore.duration) }}</span>
    </div>

    <div class="music-controls">
      <button
        class="control-btn"
        :class="{ active: musicStore.isShuffling }"
        @click="musicStore.toggleShuffle"
        title="随机播放"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 3 21 3 21 8"></polyline>
          <line x1="4" y1="20" x2="21" y2="3"></line>
          <polyline points="21 16 21 21 16 21"></polyline>
          <line x1="15" y1="15" x2="21" y2="21"></line>
          <line x1="4" y1="4" x2="9" y2="9"></line>
        </svg>
      </button>

      <button class="control-btn" @click="musicStore.previousTrack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h2v12H6zM10 6l8.5 6l-8.5 6z"/>
        </svg>
      </button>

      <button class="control-btn play-btn" @click="musicStore.togglePlay">
        <svg v-if="!musicStore.isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
        </svg>
      </button>

      <button class="control-btn" @click="musicStore.nextTrack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.5 6l8.5 6l-8.5 6V6zM16 6h2v12h-2z"/>
        </svg>
      </button>

      <button
        class="control-btn"
        :class="{ active: musicStore.isLooping }"
        @click="musicStore.toggleLoop"
        title="单曲循环"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 1l4 4-4 4"></path>
          <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
          <path d="M7 23l-4-4 4-4"></path>
          <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          <text x="12" y="16" font-size="10" fill="currentColor" text-anchor="middle" font-weight="bold">1</text>
        </svg>
      </button>
    </div>

    <div class="music-playlist">
      <h4>播放列表</h4>
      <div class="playlist-items">
        <div
          v-for="(track, index) in musicStore.playlist"
          :key="index"
          :class="['playlist-item', { active: index === musicStore.currentTrackIndex }]"
          @click="musicStore.loadTrack(index)"
        >
          <span>{{ index + 1 }}. {{ track.title }} - {{ track.artist }}</span>
        </div>
      </div>
    </div>

    <audio
      ref="audioElement"
      preload="metadata"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @ended="musicStore.onEnded"
    ></audio>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMusicStore } from '../stores/music'

const musicStore = useMusicStore()
const audioElement = ref(null)

onMounted(() => {
  musicStore.setAudioElement(audioElement.value)
})

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function handleSeek(event) {
  const seekTime = (musicStore.duration / 100) * event.target.value
  musicStore.seek(seekTime)
}

function handleTimeUpdate(event) {
  musicStore.updateTime(event.target.currentTime)
}

function handleLoadedMetadata(event) {
  musicStore.updateDuration(event.target.duration)
}
</script>

<style scoped>
.control-btn.active {
  color: #FF6B9D;
  transform: scale(1.1);
}
</style>
