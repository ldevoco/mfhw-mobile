<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Number Reader</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-button @click="readNumber(102)">Read 102</ion-button>
      <ion-button @click="readNumber(45)">Read 45</ion-button>
      <ion-button @click="readNumber(378)">Read 378</ion-button>

      <audio ref="player"></audio>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';

const player = ref(null);

function decomposeNumber(num) {
  const parts = [];

  if (num >= 100) {
    parts.push(Math.floor(num / 100));
    parts.push('hundred');
    num = num % 100;
  }

  if (num >= 20) {
    parts.push(Math.floor(num / 10) * 10);
    num = num % 10;
  }

  if (num > 0) {
    parts.push(num);
  }

  return parts;
}

function readNumber(num) {
  const parts = decomposeNumber(num);
  const files = parts.map(p => `sounds/${p}.mp3`);
  playSequence(files);
}

function playSequence(files) {
  if (!files.length || !player.value) {
    return;
  }

  const audio = player.value;
  let index = 0;

  function playNext() {
    if (index >= files.length) {
      audio.removeEventListener('ended', playNext);
      return;
    }

    audio.src = files[index];
    index++;
    audio.play();
  }

  audio.addEventListener('ended', playNext);
  playNext();
}
</script>
