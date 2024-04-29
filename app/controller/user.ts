import { Controller } from 'egg'

const userCreateRule = {
  username: 'email',
  password: {
    type: 'password',
    min: 8,
  },
}

export default class UserController extends Controller {
  async createByEmail() {
    const { ctx, service, app } = this
    const errors = app.validator.validate(userCreateRule, ctx.request.body)
    ctx.logger.warn(errors)
    if (errors) {
      ctx.helper.error({ ctx, errno: 10001, msg: 'Validation Failed' })
      return
    }
    const userData = await service.user.createByEmail(ctx.request.body)
    ctx.helper.success({ ctx, res: userData })
  }

  async show() {
    const { ctx, service } = this
    const { id } = ctx.params
    const userData = await service.user.findById(id)
    ctx.helper.success({ ctx, res: userData })
  }
}
