import { Controller } from 'egg'

const userCreateRule = {
  username: 'email',
  password: {
    type: 'password',
    min: 8,
  },
}

export const userErrorMessage = {
  userValidateFail: {
    errno: 101001,
    message: '输入信息验证失败',
  },
  createUserAlreadyExist: {
    errno: 101002,
    message: '该邮箱已经被注册，请直接登录',
  },
  loginCheckFailInfo: {
    errno: 101003,
    message: '用户名不存在或密码错误',
  },
}

export default class UserController extends Controller {
  async createByEmail() {
    const { ctx, service, app } = this
    const errors = app.validator.validate(userCreateRule, ctx.request.body)
    ctx.logger.warn(errors)
    if (errors) {
      ctx.helper.error({
        ctx,
        error: errors,
        errorType: 'userValidateFail',
      })
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

  validateUserInput() {
    const { ctx, app } = this
    const errors = app.validator.validate(userCreateRule, ctx.request.body)
    ctx.logger.warn(errors)
    return errors
  }

  async loginByEmail() {
    const { ctx, service, app } = this
    const error = this.validateUserInput()
    if (error) {
      ctx.helper.error({
        ctx,
        error,
        errorType: 'userValidateFail',
      })
    }
    const { username, password } = ctx.request.body
    const user = await service.user.findByUsername(username)
    if (!user) {
      ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' })
      return
    }
    const isMatch = await ctx.compare(password, user.password)
    if (!isMatch) {
      ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' })
      return
    }
    ctx.helper.success({ ctx, res: user, msg: '登录成功' })
  }
}
