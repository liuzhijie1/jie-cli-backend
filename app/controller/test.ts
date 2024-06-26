import { Controller } from 'egg'

export default class TestController extends Controller {
  public async index() {
    const { ctx } = this
    const { id } = ctx.params
    const { query, body } = ctx.request
    const { baseUrl } = ctx.app.config

    console.log('ctx.application', this.app.echo('12'))
    console.log('ctx.application axios', (await this.app.axiosInstance.get('/api/breeds/image/random')).data)
    // console.log(ctx.application.echo('123123'))
    // const res = await ctx.application.axiosInstance.get(
    //   '/api/breeds/image/random'
    // )
    // console.log('axios', res.data)
    // console.log('eco', ctx.application.echo('123123'))

    // ctx.logger.debug('debug info')
    // ctx.logger.info('info info')
    // ctx.logger.warn('warn info')
    // ctx.logger.error(new Error('whiops'))

    const persons = await ctx.service.dog.showPlayers()
    console.log('persons', persons)

    const resp = {
      query,
      body,
      id,
      baseUrl,
      persons,
      // mongooseId: ctx.app.mongoose.id,
    }

    ctx.helper.success({ ctx, res: resp })
  }

  // getDog function to call the dog service get resp and return it
  public async getDog() {
    const { ctx, service } = this
    const resp = await service.dog.show()
    await ctx.render('test.tpl', { url: resp.message })
  }
}
