<template>
  <div class="global-progress-container" :class="{ 'is-active': loadingStore.isLoading }">
    <div class="progress-bar-track">
      <div class="progress-bar-fill"></div>
      <div class="progress-bar-glow"></div>
    </div>
  </div>
</template>

<script setup>
import { useLoadingStore } from '@/stores/loading';

const loadingStore = useLoadingStore();
</script>

<style scoped>
.global-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  z-index: 9999999;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0.25s ease;
}

.global-progress-container.is-active {
  opacity: 1;
  visibility: visible;
}

.progress-bar-track {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
}

.progress-bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  background: linear-gradient(90deg, #4f46e5, #06b6d4, #10b981, #6366f1, #4f46e5);
  background-size: 250% 100%;
  animation: shimmerMove 1.4s ease-in-out infinite;
  box-shadow: 0 0 12px rgba(79, 70, 229, 0.8), 0 0 4px rgba(6, 182, 212, 0.6);
  border-radius: 0 2px 2px 0;
}

.progress-bar-glow {
  position: absolute;
  top: -2px;
  right: 0;
  width: 80px;
  height: 7px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(79, 70, 229, 0) 80%);
  opacity: 0.8;
  animation: pulseGlow 1.4s ease-in-out infinite;
}

@keyframes shimmerMove {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes pulseGlow {
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}
</style>
