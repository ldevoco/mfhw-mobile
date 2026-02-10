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

      <div>
        <h1>Your Nuxt Page</h1>
        <div v-if="htmlContent" v-html="htmlContent"></div>
        <!-- Static container: Vue ignores its inner content post-mount -->
        <div id="external-container"></div>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const htmlContent = ref('');

// const { $fetch } = useNuxtApp(); // Or use native fetch

onMounted(async () => {
  console.log('onMounted happening');
  try {
    // Fetch JS file as text (adjust URL)
    const ht = await $fetch('/api/anything-proxy', {
      method: 'POST',
      body: {
        url: apiBase + '/public/ht.js'
      }
    });
    const globals = await $fetch('/api/anything-proxy', {
      method: 'POST',
      body: {
        url: apiBase + '/public/globals.css'
      }
    });

    const container = document.getElementById('external-container');

    // Option 1: If it's raw JS code, create and append script tag (executes immediately)
    const script = document.createElement('script');
    script.textContent = ht;
    container.appendChild(script);

    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(globals));
    document.head.appendChild(style);

    // Option 2: If it's HTML with embedded <script> tags (e.g., external app snippet)
    // const html = await $fetch('/path/to/external.html');
    // const parser = new DOMParser();
    // const doc = parser.parseFromString(html, 'text/html');
    // container.innerHTML = doc.body.innerHTML; // Insert HTML
    // // Re-attach scripts manually (they don't run via innerHTML)
    // Array.from(doc.querySelectorAll('script')).forEach(oldScript => {
    //   const newScript = document.createElement('script');
    //   if (oldScript.src) newScript.src = oldScript.src;
    //   else newScript.textContent = oldScript.textContent;
    //   container.appendChild(newScript);
    // });

    // TODO: Delete

    // const response = await $fetch('/api/anything-proxy', {
    //   method: 'POST',
    //   body: {
    //     url: apiBase + '/ht/users'
    //   }
    // });

    // const responseObject = JSON.parse(response);
    // htmlContent.value = `${responseObject.wrapperStart}${responseObject.content}${responseObject.wrapperEnd}`;

    await loadHtContent(document.querySelector('#external-container'), '/users', false);
  } catch (error) {
    console.error('Fetch/append failed:', error);
  }
});

async function loadHtContent(target, path, pushState = true) {
  console.log('debug: pushState is: ', pushState);

  async function fetchHtClone (path) {
    if (window.ht.cache[path]) {
      return window.ht.cache[path];
    }

    const res = await $fetch('/api/anything-proxy', {
      method: 'POST',
      body: {
        url: apiBase + '/ht/users'
      }
    });
    console.log('what is res: ', res);

    const data = JSON.parse(res);
    window.ht.cache[path] = data;
    return data;
  }

  const data = await fetchHtClone(path);

  // Remove existing assets associated with target
  removeAssets(target);

  // Run unload callbacks from JS:
  while (window.ht.unloadCallbacks.length) {
    const callback = window.ht.unloadCallbacks.shift();
    try {
      callback();
    } catch (err) {
      console.error("Unload callback failed:", err);
    }
  }

  // Create a temporary container for the new wrapper
  const container = document.createElement("div");
  container.innerHTML = `${data.wrapperStart}${data.content}${data.wrapperEnd}`;

  // Insert into DOM
  replaceContent(target, container.innerHTML);

  htRefresh();

  window.ht.usersApiInterceptor = apiBase;

  // Grab the new wrapper element
  const wrapperEl = target.querySelector("[data-template]");
  if (wrapperEl)
    injectAssets(wrapperEl);

  // Optionally push to history
  if (pushState)
    history.pushState({ hta: path }, "", path);

  // Observe any new htvp elements in this container
  observeHtvpInContainer(wrapperEl);
}
</script>
