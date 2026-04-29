
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Background Audio Test</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <audio ref="ring" controls src="sounds/phone-ringtone2.wav"></audio>

      <ion-button expand="block" color="success" @click="toggleService" :disabled="isLoading">
        {{ isEnabled ? 'Stop Foreground Service' : 'Start Foreground Service' }}
      </ion-button>

      <ion-button expand="block" color="primary" @click="preloadSound" class="ion-margin-bottom">
        1. Preload Ringtone
      </ion-button>

      <ion-button expand="block" color="primary" @click="playRingtone" class="ion-margin-top">
        Play Ringtone (Native)
      </ion-button>

      <ion-button expand="block" color="danger" @click="stopRingtone" class="ion-margin-top">
        Stop Ringtone
      </ion-button>

      <ion-button expand="block" color="success" @click='() => {playing = true;}' class="ion-margin-top">
        Repeat Ringtone (HTML)
      </ion-button>

      <ion-item lines="none">
        <ion-label>Service: <strong :style="{color: isEnabled ? '#2dd36f' : '#eb445a'}">{{ isEnabled ? 'RUNNING' : 'STOPPED' }}</strong></ion-label>
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel } from '@ionic/vue';

import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';
import { NativeAudio } from '@capacitor-community/native-audio';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const status = ref('Ready - Click Preload first');

const ring = ref(null);
const playing = ref(false);
let intervalId = null;
onMounted(() => {
  intervalId = setInterval(() => {
    if (ring.value && playing.value == true) {
      ring.value.play();
    }
  }, 5000);
});
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

const preloadSound = async (testPath) => {
  testPath = 'public/sounds/phone-ringtone2.wav';
  status.value = `Testing: ${testPath}`;
  console.log(`[NativeAudio Test] Preloading → "${testPath}"`);

  try {
    await NativeAudio.preload({
      assetId: 'ringtone',
      assetPath: testPath,
      audioChannelNum: 1,
      isUrl: false
    });

    status.value = `✅ Preload reported success: ${testPath}`;
    console.log(`[SUCCESS] Preload accepted path: "${testPath}"`);
  } catch (err) {
    console.error(`[ERROR] Preload failed for "${testPath}":`, err);
    status.value = `❌ Error: ${err.message || err}`;
  }
};

const isEnabled = ref(false);
const isLoading = ref(false);
const SERVICE_KEY = 'foreground_enabled';


const startService = async () => {
  if (Capacitor.getPlatform() !== 'android') return;
  isLoading.value = true;

  try {
    // Create channel first (important to avoid crash!)
    await ForegroundService.createNotificationChannel({
      id: 'foreground_channel',
      name: 'Background Service',
      description: 'Keeps the app running for sounds and network requests',
      importance: 3,        // Default importance
    });

    await ForegroundService.startForegroundService({
      id: 1,
      title: 'My App Background Service',
      body: 'Running in background – sounds & requests active',
      smallIcon: 'ic_stat_icon',        // Try 'ic_launcher' if this still fails
      notificationChannelId: 'foreground_channel',
      silent: false
    });

    isEnabled.value = true;
    await Preferences.set({ key: SERVICE_KEY, value: 'true' });

    await preloadSound();   // Preload ringtone
  } catch (e) {
    console.error(e);
    alert('Error: ' + e.message);
  } finally {
    isLoading.value = false;
  }
};



const playRingtone = async () => {
  try {
    await NativeAudio.play({
      assetId: 'ringtone',
      loop: true
    });
    status.value = 'Playing... (looping)';
    console.log('Play command sent');
  } catch (err) {
    console.error('Play failed:', err);
    status.value = 'Play failed: ' + err.message;
  }
};

const stopRingtone = async () => {
  try {
    await NativeAudio.stop({ assetId: 'ringtone' });
    status.value = 'Stopped';
    console.log('Stop command sent');
  } catch (err) {
    console.error('Stop failed:', err);
    status.value = 'Stop failed';
  }
};


const stopService = async () => {
  if (Capacitor.getPlatform() !== 'android') return;

  isLoading.value = true;

  try {
    await ForegroundService.stopForegroundService();
    isEnabled.value = false;
    await Preferences.set({ key: SERVICE_KEY, value: 'false' });
    console.log('🛑 Foreground Service stopped');
  } catch (error) {
    console.error('Failed to stop service:', error);
    alert('Error stopping service:\n' + (error.message || error));
  } finally {
    isLoading.value = false;
  }
};

const toggleService = async () => {
  if (isEnabled.value) {
    await stopService();
  } else {
    await startService();
  }
};
</script>






<!--
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Audio Path Test</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2>Native Audio Test</h2>

      <ion-button expand="block" color="primary" @click="preloadSound" class="ion-margin-bottom">
        1. Preload Ringtone
      </ion-button>

      <ion-button expand="block" color="primary" @click="testAllPaths" class="ion-margin-bottom">
        runPathTests
      </ion-button>

      <ion-button expand="block" color="success" @click="playRingtone" class="ion-margin-bottom">
        2. Play Ringtone (Loop)
      </ion-button>

      <ion-button expand="block" color="danger" @click="stopRingtone">
        3. Stop Ringtone
      </ion-button>

      <ion-item lines="none" class="ion-margin-top">
        <ion-label>Status: <strong>{{ status }}</strong></ion-label>
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonLabel } from '@ionic/vue';
import { NativeAudio } from '@capacitor-community/native-audio';

const status = ref('Ready - Click Preload first');

const preloadSound = async (testPath) => {
  testPath = 'public/sounds/phone-ringtone2.wav';
  status.value = `Testing: ${testPath}`;
  console.log(`[NativeAudio Test] Preloading → "${testPath}"`);

  try {
    await NativeAudio.preload({
      assetId: 'ringtone',
      assetPath: testPath,
      audioChannelNum: 1,
      isUrl: false
    });

    status.value = `✅ Preload reported success: ${testPath}`;
    console.log(`[SUCCESS] Preload accepted path: "${testPath}"`);
  } catch (err) {
    console.error(`[ERROR] Preload failed for "${testPath}":`, err);
    status.value = `❌ Error: ${err.message || err}`;
  }
};

// Button to run all common tests
const testAllPaths = async () => {
  const testPaths = [
    'sounds/0.mp3',
    'public/sounds/0.mp3',
    'assets/sounds/0.mp3',
    'public/assets/sounds/0.mp3'
  ];

  for (const path of testPaths) {
    await preloadSound(path);
    await new Promise(resolve => setTimeout(resolve, 1000)); // pause between tests
  }
};

// Test multiple paths easily
const runPathTests = async () => {
  const paths = [
    'sounds/phone-ringtone2.mp3',
    'public/sounds/phone-ringtone2.mp3',
    'assets/sounds/phone-ringtone2.mp3',
    'public/assets/sounds/phone-ringtone2.mp3',
    'phone-ringtone2.mp3'
  ];

  for (const p of paths) {
    await preloadSound(p);
    // Small delay so you can see results in order
    await new Promise(r => setTimeout(r, 800));
  }
};

const playRingtone = async () => {
  try {
    await NativeAudio.play({
      assetId: 'ringtone',
      loop: true
    });
    status.value = 'Playing... (looping)';
    console.log('Play command sent');
  } catch (err) {
    console.error('Play failed:', err);
    status.value = 'Play failed: ' + err.message;
  }
};

const stopRingtone = async () => {
  try {
    await NativeAudio.stop({ assetId: 'ringtone' });
    status.value = 'Stopped';
    console.log('Stop command sent');
  } catch (err) {
    console.error('Stop failed:', err);
    status.value = 'Stop failed';
  }
};
</script> -->
