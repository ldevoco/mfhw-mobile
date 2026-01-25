<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>TTS Demo</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <Nav></Nav>

      <ion-item>
        <ion-input v-model="apiKey" placeholder="Hume API Key" type="password"></ion-input>
        <ion-button @click="setApiKey">Save Key</ion-button>
      </ion-item>

      <ion-item>
        <ion-textarea
          v-model="text"
          placeholder="Enter text to speak"
          rows="4"
        ></ion-textarea>
      </ion-item>

      <ion-button @click="speakHume" expand="block" color="primary">
        Speak with Hume
      </ion-button>

      <ion-button @click="speakNative" expand="block" color="secondary">
        Speak with Native TTS
      </ion-button>

      <audio ref="audioPlayer" controls style="width: 100%; margin-top: 20px;"></audio>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ttsService } from '@/services/tts.service';
import { notificationService } from '@/services/notifications.service';

const config = useRuntimeConfig()
const humeKey = config.public.humeKey

const apiKey = ref('');
const text = ref('Hello! This is text-to-speech working in your Ionic app.');
const audioPlayer = ref<HTMLAudioElement>();

onMounted(async () => {
  await ttsService.initialize();
});

const setApiKey = async () => {
  await ttsService.setApiKey(humeKey);
};

const speakHume = async () => {
  try {
    await notificationService.showBasicNotification('TTS Notification', 'Just generated the first audio');
    const audioData = await ttsService.speakText(text.value);
    if (audioPlayer.value) {
      audioPlayer.value.src = audioData;
      await audioPlayer.value.play();
    }
  }
  catch (error) {
    console.error('Hume TTS failed:', error);
  }
};

const speakNative = async () => {
  console.log('trying speakNative NOW');
  try {
    ttsService.speakNative(text.value);
  }
  catch (error) {
    console.log('error: ', error);
    await notificationService.showBasicNotification('TTS Error', 'Failed to generate speech: ' + error);
  }
};
</script>
