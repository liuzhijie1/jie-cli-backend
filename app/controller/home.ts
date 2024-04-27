import { Controller } from 'egg'

export default class HomeController extends Controller {
  public index() {
    const data: string = this.service.home.index()

    this.ctx.body = {
      text: data,
    }
    this.ctx.status = 200
  }
}
