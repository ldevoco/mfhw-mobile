// composables/useApi.ts
import { Capacitor } from '@capacitor/core'
import { CapacitorHttp } from '@capacitor/core'

export function useApi() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  async function request<T>(
    path: string,
    options: {},
  ): Promise<T> {
    const url = `${path}`
    console.log('requesting');

    try {
      if (Capacitor.isNativePlatform()) {
        console.log('native');
        const nativeOptions = {
          ...options,
          url,
        }
        // Ensure Content-Type if sending JSON
        if (options.data && !nativeOptions.headers?.['Content-Type']) {
          nativeOptions.headers = {
            ...nativeOptions.headers,
            'Content-Type': 'application/json',
          }
        }

        const res = await CapacitorHttp.request(nativeOptions)
        alert('res came back as ' + JSON.stringify(res.data));
        if (res.status >= 400) {
          throw new Error(`HTTP ${res.status}: ${JSON.stringify(res.data)}`)
        }
        return JSON.stringify(res.data)
      } else {
        console.log('web');
        // Web: use Nuxt's $fetch (built on ofetch)

        const response = await $fetch('/api/anything-proxy', {
          method: 'POST',
          body: {
            url,
            body: options.data
          }
        });

        return response;
      }
    } catch (err) {
      console.error('API error:', err)
      alert('error: ' + JSON.stringify(err));
      throw err  // let caller handle (e.g. show toast)
    }
  }

  // Convenience methods
  function post<T>(path: string, body: any, opts = {}) {
    console.log('posting');
    return request<T>(path, { method: 'POST', data: body, ...opts })
  }

  function get<T>(path: string, opts = {}) {
    return request<T>(path, { method: 'GET', ...opts })
  }

  // Add put, delete, etc. as needed

  return { request, post, get }
}
