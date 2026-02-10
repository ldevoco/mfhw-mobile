<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>External Content</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <Nav></Nav>
      <iframe
        ref="contentFrame"
        sandbox="allow-scripts allow-same-origin allow-forms"
        style="width: 100%; height: 100%; border: none;"
        @load="onFrameLoad"
      />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const { post } = useApi();
const config = useRuntimeConfig();
console.log(' the config: ', config);

const contentFrame = ref(null);

const usersJson = await post(config.public.apiBase + '/api/users/query');
const users = JSON.parse(usersJson);
console.log('what is res: ', users);
window.ht = window.ht || {};
window.ht.usersOverrideSignups = users;

const usersPageJson = await post(config.public.apiBase + '/ht/users');
const res = JSON.parse(usersPageJson);

const externalHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <!-- External library -->
      <link rel="stylesheet" href="https://mfhw.octobeta.com/public/globals.css">
      <script src="https://mfhw.octobeta.com/public/ht.js"><\/script>
      <style>
        body { margin: 0; font-family: sans-serif; }
      </style>
    </head>
    <body>
      <div id="app">${res.wrapperStart}${res.content}${res.wrapperEnd}</div>
      <script>
        // Your initialization code
        document.addEventListener('DOMContentLoaded', function() {
          console.log('External script executed');
          window.ht.usersOverrideSignups = ${JSON.stringify(window.ht.usersOverrideSignups)};
          window.ht.usersOverrideApprove = (e) => {
            console.log('e2: ', e.target.dataset.userid);
            window.parent.postMessage({
              type: 'REQUEST_APPROVE',
              userid: e.target.dataset.userid
            }, '*');
          }
        });
      <\/script>
    </body>
  </html>
`

onMounted(() => {
  if (!contentFrame.value) {
    return
  }

  const doc = contentFrame.value.contentDocument || contentFrame.value.contentWindow.document
  doc.open()
  doc.write(externalHtml)
  doc.close()

  contentFrame.value.contentWindow.postMessage({ type: 'SIGNUPS_DATA', payload: window.ht.usersOverrideSignups }, '*');

})

const onFrameLoad = () => {
  // Optional: communicate with parent via postMessage
  const win = contentFrame.value?.contentWindow

  if (win) {
    win.postMessage({ type: 'init', data: {} }, '*')
  }
}

// In your Vue component (parent)
window.addEventListener('message', async (e) => {
  if (e.data.type === 'REQUEST_APPROVE') {
    console.log('ez: ', e.data.userid);
    const usersJson = await post(config.public.apiBase + '/api/users/approve', {
      id: e.data.userid
    });
  }
});

</script>
