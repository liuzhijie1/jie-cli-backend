// generate egg log middleware
import { Application, Context, EggAppConfig } from 'egg'
import { appendFileSync } from 'fs'
export default (options: EggAppConfig['myLogger'], app: Application) => {
  return async (ctx: Context, next: () => Promise<any>) => {
    console.log('options', options)
    console.log('default options', app.config.logger)
    const start = Date.now()
    const requestTime = new Date()
    await next()
    const used = Date.now() - start
    if (options && options.allowedMethods.includes(ctx.method)) {
      appendFileSync(
        './myLog.txt',
        `request as ${requestTime} ${ctx.method} ${ctx.url} ${used}ms\n`
      )
    }
  }
}
