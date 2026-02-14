import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBackgroundStore = defineStore('background', () => {
  const images = [
    'IMG_E5416.JPG',
    'IMG_E5417.jpeg',
    'IMG_E5419.jpeg',
    'IMG_E5421-upscaled.png',
    'IMG_E5423-upscaled.png',
    'IMG_E5424-upscaled.png',
    'IMG_E5426-upscaled.png',
    'IMG_E5427-upscaled.png',
    'IMG_E5429-upscaled.png',
    'IMG_E5430-upscaled.png',
    'IMG_E5431-upscaled.png',
    'IMG_E5432-upscaled.png',
    'IMG_E5433-upscaled.png',
    'IMG_E5434-upscaled.png'
  ]

  const selectedBackground = ref(
    localStorage.getItem('selectedBackground') || 'IMG_E5419.jpeg'
  )
  const selectorVisible = ref(false)

  function selectBackground(imageName) {
    selectedBackground.value = imageName
    localStorage.setItem('selectedBackground', imageName)
  }

  function toggleSelector() {
    console.log('toggleSelector called, current state:', selectorVisible.value)
    selectorVisible.value = !selectorVisible.value
    console.log('toggleSelector new state:', selectorVisible.value)
  }

  function getImageUrl(imageName) {
    if (imageName.startsWith('http')) {
      return imageName
    }
    return `/images/fll/system_image/${imageName}`
  }

  // 改为 computed 属性，这样会响应式更新
  const currentBackgroundUrl = computed(() => getImageUrl(selectedBackground.value))

  return {
    images,
    selectedBackground,
    selectorVisible,
    selectBackground,
    toggleSelector,
    getImageUrl,
    currentBackgroundUrl
  }
})
