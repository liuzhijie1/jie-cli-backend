import { Context, Application, EggAppConfig } from 'egg'
import { verify } from 'jsonwebtoken'

function getTokenValue(ctx: Context) {
  const { authorization } = ctx.header
  if (!ctx.header || !authorization) {
    return false
  }
  if (typeof authorization !== 'string') {
    return false
  }
  const parts = authorization.trim().split(' ')
  if (parts.length !== 2) {
    return false
  }
  const scheme = parts[0]
  const credentials = parts[1]
  if (!/^Bearer$/i.test(scheme)) {
    return false
  }
  return credentials
}

export default (options: EggAppConfig['jwt']) => {
  return async (ctx: Context, next: () => Promise<any>) => {
    console.log('middleware jwt options', options)
    const token = getTokenValue(ctx)
    if (!token) {
      ctx.helper.error({ ctx, errorType: 'loginValidateFail' })
      return
    }
    const { secret } = options
    if (!secret) {
      throw new Error('jwt secret is required')
    }
    try {
      const decoded = verify(token, secret)
      console.log('decoded', decoded)
      ctx.state.user = decoded
      await next()
    } catch (error) {
      return ctx.helper.error({ ctx, error, errorType: 'loginValidateFail' })
    }
  }
}
