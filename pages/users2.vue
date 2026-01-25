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

      <ion-button @click="request">Refresh HTML</ion-button>

      <!-- Dynamic HTML container with shadow DOM for isolation -->
      <div ref="htmlContainer" class="dynamic-html-container"></div>

      <div v-if="items && items.length">
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

const items = ref([])
const htmlContainer = ref<HTMLElement | null>(null)

interface HtmlParts {
  wrapperStart: string
  content: string
  wrapperEnd: string
}

async function request() {
  // Fetch via proxy; upstream returns { wrapperStart, content, wrapperEnd }
  const parts: HtmlParts = await $fetch('/api/anything-proxy', {
    method: 'POST',
    body: {
      url: apiBase + '/ht/users',  // Your endpoint returning the three parts
      body: {}  // POST data if needed
    }
  })

  const fullHtml = `${parts.wrapperStart}${parts.content}${parts.wrapperEnd}`

  // Process and render with styles/scripts
  renderDynamicHtml(fullHtml)
}

function renderDynamicHtml(html: string) {
  const container = htmlContainer.value
  if (!container) return

  // Clear previous
  container.innerHTML = ''
  container.textContent = ''  // Ensure clean

  // Create shadow DOM for isolation (styles/scripts scoped)
  const shadow = container.attachShadow({ mode: 'open' })

  // Parse HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const body = doc.body  // Main content

  // Move <head> styles to shadow (scoped)
  const headStyles = doc.querySelectorAll('head style')
  headStyles.forEach(style => {
    if (style.textContent) {
      const newStyle = document.createElement('style')
      newStyle.textContent = style.textContent
      shadow.appendChild(newStyle)
    }
  })

  // Extract and execute inline <script> tags
  const scripts = Array.from(doc.querySelectorAll('script'))
  scripts.forEach(script => {
    const newScript = document.createElement('script')
    // Copy attributes (e.g., type)
    Array.from(script.attributes).forEach(attr => {
      newScript.setAttribute(attr.name, attr.value)
    })
    // Inline content executes on append
    if (script.textContent) {
      newScript.textContent = script.textContent
    }
    // Src scripts: Load dynamically (async)
    if (script.src) {
      newScript.src = script.src
      newScript.onload = () => console.log('Script loaded:', script.src)
    }
    shadow.appendChild(newScript)
  })

  // Body styles (scoped to shadow)
  const bodyStyles = Array.from(doc.querySelectorAll('style')).filter(s => !headStyles.includes(s as any))
  bodyStyles.forEach(style => {
    if (style.textContent) {
      const newStyle = document.createElement('style')
      newStyle.textContent = style.textContent
      shadow.appendChild(newStyle)
    }
  })

  // Append cleaned body content (scripts/styles removed)
  ;[...body.children].forEach(el => {
    // Remove script/style from content tree
    if (el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
      shadow.appendChild(el.cloneNode(true))
    }
  })

  // Fallback to list mode if no container update
  items.value = []
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.dynamic-html-container {
  width: 100%;
  height: 400px;  /* Adjust as needed */
  border: 1px solid #ccc;
  overflow: auto;
  contain: layout style;  /* Optimize shadow performance */
}
</style>
