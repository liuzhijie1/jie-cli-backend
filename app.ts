import { Application, IBoot } from 'egg'

export default class AppBootHook implements IBoot {
  private readonly app: Application

  constructor(app: Application) {
    this.app = app
  }

  configWillLoad() {
    // Ready to call configDidLoad,
    // Config, plugin files are referred,
    // this is the last chance to modify the config.
    console.log('config', this.app.config.baseUrl)
    console.log('enable middleware', this.app.config.coreMiddleware)
    this.app.config.coreMiddleware.unshift('myLogger')
  }

  async willReady(): Promise<void> {
    console.log('enable willready', this.app.config.coreMiddleware)
  }

  async didReady() {
    const ctx = await this.app.createAnonymousContext()
    const res = await ctx.service.test.sayHi('jie')
    console.log('didReady', this.app.echo)
    console.log('did ready res', res)
    console.log('final middlewares', this.app.middleware)
  }
}
