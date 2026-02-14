import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMusicStore = defineStore('music', () => {
  // 音乐列表
  const playlist = [
    { title: '酣梦于彼岸深红', artist: 'fll', src: '/music/fll_酣梦于彼岸深红.ogg', cover: '/images/homepic1.png' },
    { title: '那颗星梦见的春日', artist: 'imiss', src: '/music/imiss_那颗星梦见的春日.ogg', cover: '/images/homepic1.png' },
    { title: '远航星的告别', artist: 'imiss', src: '/music/imiss_远航星的告别.ogg', cover: '/images/homepic1.png' }
  ]

  // 状态
  const currentTrackIndex = ref(0)
  const isPlaying = ref(false)
  const isLooping = ref(false)
  const isShuffling = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const playerVisible = ref(false)

  // Audio 元素引用（在组件中设置）
  const audioElement = ref(null)

  // 计算属性
  const currentTrack = computed(() => playlist[currentTrackIndex.value])
  const progress = computed(() => {
    if (!duration.value) return 0
    return (currentTime.value / duration.value) * 100
  })

  // 方法
  function setAudioElement(element) {
    audioElement.value = element
  }

  function play() {
    if (audioElement.value) {
      audioElement.value.play()
      isPlaying.value = true
    }
  }

  function pause() {
    if (audioElement.value) {
      audioElement.value.pause()
      isPlaying.value = false
    }
  }

  function togglePlay() {
    if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  function loadTrack(index) {
    if (index < 0 || index >= playlist.length) return
    currentTrackIndex.value = index
    if (audioElement.value) {
      audioElement.value.src = playlist[index].src
      play()
    }
  }

  function nextTrack() {
    if (isShuffling.value) {
      let nextIndex
      do {
        nextIndex = Math.floor(Math.random() * playlist.length)
      } while (nextIndex === currentTrackIndex.value && playlist.length > 1)
      loadTrack(nextIndex)
    } else {
      loadTrack((currentTrackIndex.value + 1) % playlist.length)
    }
  }

  function previousTrack() {
    loadTrack((currentTrackIndex.value - 1 + playlist.length) % playlist.length)
  }

  function toggleLoop() {
    isLooping.value = !isLooping.value
    if (isLooping.value) {
      isShuffling.value = false
    }
  }

  function toggleShuffle() {
    isShuffling.value = !isShuffling.value
    if (isShuffling.value) {
      isLooping.value = false
    }
  }

  function togglePlayer() {
    playerVisible.value = !playerVisible.value
  }

  function seek(time) {
    if (audioElement.value) {
      audioElement.value.currentTime = time
    }
  }

  function updateTime(time) {
    currentTime.value = time
  }

  function updateDuration(dur) {
    duration.value = dur
  }

  function onEnded() {
    if (isLooping.value) {
      if (audioElement.value) {
        audioElement.value.currentTime = 0
        play()
      }
    } else {
      nextTrack()
    }
  }

  return {
    // 状态
    playlist,
    currentTrackIndex,
    isPlaying,
    isLooping,
    isShuffling,
    currentTime,
    duration,
    playerVisible,
    audioElement,

    // 计算属性
    currentTrack,
    progress,

    // 方法
    setAudioElement,
    play,
    pause,
    togglePlay,
    loadTrack,
    nextTrack,
    previousTrack,
    toggleLoop,
    toggleShuffle,
    togglePlayer,
    seek,
    updateTime,
    updateDuration,
    onEnded
  }
})
