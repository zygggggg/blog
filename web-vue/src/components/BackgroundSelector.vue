<template>
  <div v-if="backgroundStore.selectorVisible" class="image-selector" @click.self="backgroundStore.toggleSelector">
    <div class="selector-content">
      <h2 class="selector-title">选择你喜欢的背景</h2>
      <div class="image-grid">
        <div
          v-for="(img, index) in backgroundStore.images"
          :key="index"
          :class="['image-item', { selected: img === backgroundStore.selectedBackground }]"
          @click="selectImage(img)"
        >
          <img :src="backgroundStore.getImageUrl(img)" :alt="`背景${index + 1}`" loading="lazy">
        </div>
      </div>
      <button class="close-btn" @click="backgroundStore.toggleSelector">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { useBackgroundStore } from '../stores/background'

const backgroundStore = useBackgroundStore()

function selectImage(imageName) {
  console.log('Selecting background:', imageName)
  backgroundStore.selectBackground(imageName)
}
</script>

<style scoped>
/* 覆盖原有CSS，确保选择器显示 */
.image-selector {
  display: flex !important;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10000;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.selector-content {
  position: relative;
  z-index: 10001;
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 15px;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
}

.image-item {
  cursor: pointer;
  pointer-events: auto;
}

.close-btn {
  cursor: pointer;
  pointer-events: auto;
}
</style>
