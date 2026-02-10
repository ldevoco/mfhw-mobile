import { getHeader, getHeaders, setResponseStatus, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('the body: ', body);
  const { body: proxyBody, headers, method = 'post' } = body;

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const url = apiBase + '/api/users/query';

  const incomingCookies = getHeader(event, 'cookie') || ''

  const options = {
    method: method,
    body: JSON.stringify(body),
    headers: {
      ...headers,
      'Cookie': incomingCookies
    }
  }
  console.log('options: ', options);
  const res = await (await fetch(url, options)).text();

  if (!res || res == '401')
    return '400';

  return res
})
