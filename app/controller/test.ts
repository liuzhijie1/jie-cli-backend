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
}
