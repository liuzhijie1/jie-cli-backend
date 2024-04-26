import { Controller } from 'egg'

export default class TestController extends Controller {
  public async index() {
    const { ctx } = this
    const { id } = ctx.params
    const { query, body } = ctx.request
    const { baseUrl } = ctx.app.config

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
