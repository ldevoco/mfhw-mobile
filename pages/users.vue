<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Component Playground</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <Nav></Nav>
      This is an authenticated page

      <ion-button @click="request">Refresh users</ion-button>

      <div v-if="htmlContent" v-html="htmlContent"></div>
      <div v-else-if="items && items.length">
        <ion-list>
          <ion-item v-for="item in items" :key="item.id">
            <ion-label>
              <p>{{ item }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <div v-else-if="items && items.length === 0">
        <p>No news items found.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const items = ref([]);
const htmlContent = ref('');

async function request() {
  const response = await $fetch('/api/anything-proxy', {
    method: 'POST',
    body: {
      url: apiBase + '/ht/users'
    }
  });

  const responseObject = JSON.parse(response);
  console.log('testing: ', response);
  items.value = responseObject;
  htmlContent.value = `${responseObject.wrapperStart}${responseObject.content}${responseObject.wrapperEnd}`;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}
</script>
