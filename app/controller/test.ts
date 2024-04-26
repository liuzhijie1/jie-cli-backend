import { Controller } from 'egg';

export default class TestController extends Controller {
  public async index() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { query, body } = ctx.request;

    const resp = {
      query,
      body,
      id,
    }


    ctx.body = resp;
    ctx.status = 200;
  }

  // getDog function to call the dog service get resp and return it
  public async getDog() {
    const { ctx, service } = this;
    const resp = await service.dog.show();
    ctx.body = resp.message;
    ctx.status = 200;
  }
}
