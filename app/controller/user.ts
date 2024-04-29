import { Controller } from 'egg'

const userCreateRule = {
  username: 'email',
  password: {
    type: 'password',
    min: 8,
  },
}

export const userErrorMessage = {
  createUserValidateFail: {
    errno: 101001,
    message: '创建用户失败',
  },
  createUserAlreadyExist: {
    errno: 101002,
    message: '用户已存在',
  },
}

export default class UserController extends Controller {
  async createByEmail() {
    const { ctx, service, app } = this
    const errors = app.validator.validate(userCreateRule, ctx.request.body)
    ctx.logger.warn(errors)
    if (errors) {
      ctx.helper.error({ ctx, error: errors, errorType: 'createUserValidateFail' })
      return
    }
    const { username } = ctx.request.body
    const user = await service.user.findByUsername(username)
    if (user) {
      ctx.helper.error({ ctx, errorType: 'createUserAlreadyExist' })
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
