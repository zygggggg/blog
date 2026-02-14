<template>
  <div class="video-container">
    <video controls autoplay loop>
      <source src="/video/抖音202625-202634.mp4" type="video/mp4">
      您的浏览器不支持视频播放。
    </video>
  </div>
</template>

<script setup>
</script>

<style scoped>
.video-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  padding-top: 90px;
  padding-bottom: 20px;
  padding-left: 20px;
  padding-right: 20px;
  box-sizing: border-box;
}

video {
  max-width: 90%;
  max-height: 80vh;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}
</style>
