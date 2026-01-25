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
          <ion-label position="stacked">Email</ion-label>
          <ion-input v-model="email" type="email"></ion-input>
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

const email = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  try {
    loading.value = true;
    await authService.login(email.value, password.value);
    await navigateTo('/');
  } catch (error) {
    console.error('Login failed:', error);
  } finally {
    loading.value = false;
  }
};
</script>

