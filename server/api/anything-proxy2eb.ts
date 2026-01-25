// server/api/proxy.post.ts (or .any.ts for all methods)
import { getHeader, getHeaders, setResponseStatus, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const {
    url,
    body: proxyBody,
    headers: clientHeaders = {},
    method = 'POST',
    query = {}
  } = body

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  // Build target URL (full or prepend apiBase if relative)
  let targetUrl = url
  if (!url.startsWith('http')) {
    targetUrl = `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`
  }

  // Append query params if provided
  if (Object.keys(query).length > 0) {
    const u = new URL(targetUrl, targetUrl.startsWith('http') ? undefined : apiBase)
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => u.searchParams.append(key, v))
      } else {
        u.searchParams.set(key, String(value))
      }
    })
    targetUrl = u.toString()
  }

  // Forward incoming cookies and select headers from original request
  const incomingCookies = getHeader(event, 'cookie') || ''
  const incomingUA = getHeader(event, 'user-agent') || ''
  const fetchHeaders: Record<string, string> = {
    ...clientHeaders,
    'Cookie': incomingCookies,
    'User-Agent': incomingUA,
    'Accept': getHeader(event, 'accept') || '*/*',
    'Accept-Language': getHeader(event, 'accept-language') || '',
    'Referer': getHeader(event, 'referer') || ''
  }

  // Prepare body only for mutating methods, respect Content-Type if set
  const fetchOptions: RequestInit = {
    method: method.toUpperCase() as any,
    headers: fetchHeaders
  }

  const contentType = clientHeaders['content-type'] || 'application/json'
  if (proxyBody && !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    if (contentType.includes('json')) {
      fetchOptions.body = typeof proxyBody === 'string' ? proxyBody : JSON.stringify(proxyBody)
    } else if (contentType.includes('form')) {
      fetchOptions.body = proxyBody as any // Assume FormData handled client-side as string
    } else {
      fetchOptions.body = proxyBody as any
    }
  }

  // Proxy fetch
  const response = await fetch(targetUrl, fetchOptions)
  const status = response.status
  const responseHeaders = Object.fromEntries(response.headers.entries())

  // Read body based on content-type
  let data: any
  const respContentType = response.headers.get('content-type') || ''
  if (respContentType.includes('application/json')) {
    data = await response.json().catch(() => response.text())
  } else if (respContentType.includes('text/')) {
    data = await response.text()
  } else {
    data = await response.blob().then(b => b.text()) // Fallback
  }

  // Forward status (don't override 401s, etc.)
  setResponseStatus(event, status)

  // Forward key response headers (e.g., for CORS/Set-Cookie)
  const forwardHeaders = ['content-type', 'set-cookie', 'cache-control']
  forwardHeaders.forEach(key => {
    const values = responseHeaders[key.toLowerCase()]
    if (values) {
      setHeader(event, key, Array.isArray(values) ? values[0] : values)
    }
  })

  return data
})