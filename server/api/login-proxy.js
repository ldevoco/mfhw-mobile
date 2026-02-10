export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  const options = {
    method: 'post',
    body: JSON.stringify({
      username: email || process.env.USER,
      password: password || process.env.PASSWORD
    })
  }
  const res = await (await fetch(apiBase + '/api/login', options)).text();
  console.log('res: ', res);

  if (!res || res == '401')
    return res;

  setCookie(event, 'auth_token', res, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 // 1 day
  })

  return {
    token: res,
    user: email || process.env.USER,
    refreshToken: 'none'
  }
})
