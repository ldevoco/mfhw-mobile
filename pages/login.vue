<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <Nav></Nav>
      <form @submit.prevent="handleLogin">
        <ion-item>
          <ion-label position="stacked">Username</ion-label>
          <ion-input v-model="username" type="text"></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Password</ion-label>
          <ion-input v-model="password" type="password"></ion-input>
        </ion-item>

        <ion-button type="submit" expand="block" :disabled="loading">
          <ion-spinner v-if="loading"></ion-spinner>
          Login
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// ✅ MUST import the service
import { authService } from '~/services/auth.service';
const config = useRuntimeConfig();

const username = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  try {
    loading.value = true;
    await authService.login2(username.value, password.value);
    // For debug, will surely someday inevitably commit:
    // await authService.login2(config.public.user, config.public.password);
    await navigateTo('/');
  } catch (error) {
    alert('Login failed: ' + error);
    console.error('Login failed:', error);
  } finally {
    loading.value = false;
  }
};
</script>

