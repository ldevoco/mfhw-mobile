export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { something } = body;

  // Read the auth token from the cookie
  const token = getCookie(event, 'auth_token')

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const options = {
    headers: {
      loginToken: token
    }
  };

  const a = await (await fetch(apiBase + '/api/dream/news', options)).text();

  return {
    rssItems: JSON.parse(a)
  }
})
