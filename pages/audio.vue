<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Main Menu</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <Nav></Nav>

      <audio ref="ring" controls src="sounds/phone-ringtone2.wav"></audio>

    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const ring = ref(null);
let intervalId = null;

onMounted(() => {
  intervalId = setInterval(() => {
    if (ring.value) {
      ring.value.play();
    }
  }, 5000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>
