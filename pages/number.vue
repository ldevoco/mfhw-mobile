<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Number Reader</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-button @click="readNumber(171.28)">Read 171.28</ion-button>
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

  const str = String(num);
  const [intStr, decStr] = str.split('.');

  // Handle integer part
  let intNum = Number(intStr);

  if (intNum >= 100) {
    parts.push(Math.floor(intNum / 100));
    parts.push('hundred');
    intNum = intNum % 100;
  }

  if (intNum >= 20) {
    parts.push(Math.floor(intNum / 10) * 10);
    intNum = intNum % 10;
  }
  else if (intNum >= 11) {
    parts.push(intNum);
    intNum = 0;
  }

  if (intNum > 0) {
    parts.push(intNum);
  }

  // Handle decimal part
  if (decStr) {
    parts.push('point');

    for (const digit of decStr) {
      parts.push(Number(digit));
    }
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
