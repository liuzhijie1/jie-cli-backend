import { Context } from 'egg'

export default () => {
  return async (ctx: Context, next: () => Promise<any>) => {
    try {
      await next()
    } catch (err) {
      const error = err as any
      ctx.logger.error(err)
      if (error && error.status === 401) {
        ctx.helper.error({ ctx, errorType: 'loginValidateFail' })
        return
      } else if (ctx.path === '/api/utils/upload-img') {
        if (error && error.status === 400) {
          ctx.helper.error({
            ctx,
            errorType: 'imageUploadFileFormatError',
            error: error.message,
          })
          return
        }
        throw error
      }
      throw error
    }
  }
}
