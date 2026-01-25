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

      <ion-button @click="test">Test HTTP request</ion-button>

      <div v-if="newsItems && newsItems.length">
        <ion-list>
          <ion-item v-for="item in newsItems" :key="item.id">
            <ion-label>
              <h2>{{ item.title }}</h2>
              <p>{{ formatDate(item.pubdate) }}</p>
              <p>{{ item.description }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <div v-else-if="newsItems && newsItems.length === 0">
        <p>No news items found.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
const newsItems = ref([]);

async function test() {
  const response = await $fetch('/api/news-proxy', {
    method: 'POST',
    body: {}
  });

  console.log('testing: ', response);
  newsItems.value = response.rssItems; // Assuming your API returns the array directly
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}
</script>
