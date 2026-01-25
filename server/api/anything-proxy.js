import { getHeader, getHeaders, setResponseStatus, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { url, body: proxyBody, headers, method = 'post' } = body

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const incomingCookies = getHeader(event, 'cookie') || ''

  const options = {
    method: method,
    body: JSON.stringify(proxyBody),
    headers: {
      ...headers,
      'Cookie': incomingCookies
    }
  }
  const res = await (await fetch(url, options)).text();

  if (!res || res == '401')
    return '400';

  return res
})
