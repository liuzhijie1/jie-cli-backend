import { Controller } from 'egg'

export default class TestController extends Controller {
  public async index() {
    const { ctx } = this
    const { id } = ctx.params
    const { query, body } = ctx.request
    const { baseUrl } = ctx.app.config

    console.log('ctx.application', this.app)
    // console.log(ctx.application.echo('123123'))
    // const res = await ctx.application.axiosInstance.get(
    //   '/api/breeds/image/random'
    // )
    // console.log('axios', res.data)
    // console.log('eco', ctx.application.echo('123123'))

    const resp = {
      query,
      body,
      id,
      baseUrl,
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
