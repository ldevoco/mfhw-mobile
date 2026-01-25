<template>
  <IonApp>
    <IonRouterOutlet />
  </IonApp>
</template>

<script setup>
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { authService } from '~/services/auth.service';

onMounted(async () => {
  await authService.initialize();
});
</script>
