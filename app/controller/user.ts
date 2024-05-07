import { Controller } from 'egg'
import { sign, verify } from 'jsonwebtoken'

const userCreateRule = {
  username: 'email',
  password: {
    type: 'password',
    min: 8,
  },
}

const sendCodeRules = {
  phoneNumber: {
    type: 'string',
    format: /^1[3-9]\d{9}$/,
    message: '手机号码格式错误',
    required: true,
  },
}

const userPhoneCreateRule = {
  phoneNumber: {
    type: 'string',
    format: /^1[3-9]\d{9}$/,
    message: '手机号码格式错误',
    required: true,
  },
  veriCode: {
    type: 'string',
    format: /^\d{4}$/,
    message: '验证码格式错误',
    required: true,
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
  loginValidateFail: {
    errno: 101004,
    message: '登录信息验证失败',
  },
  sendCodeFrequentFailInfo: {
    errno: 101005,
    message: '请勿频繁获取短信验证码',
  },
  loginVeriCodeIncorrectFailInfo: {
    errno: 101006,
    message: '验证码错误',
  },
  sendVeriCodeError: {
    errno: 101007,
    message: '验证码发送失败',
  },
  giteeOauthError: {
    errno: 101008,
    message: 'Gitee授权失败',
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
    const { ctx, service, app } = this
    const { id } = ctx.params
    // const username = ctx.cookies.get('username', { encrypt: true })
    // const userData = await service.user.findById(id)
    // const { username } = ctx.session
    // if (!username) {
    //   ctx.helper.error({ ctx, errorType: 'loginValidateFail' })
    //   return
    // }
    // ctx.helper.success({ ctx, res: username })
    // const token = this.getTokenValue()
    // if (!token) {
    //   ctx.helper.error({ ctx, errorType: 'loginValidateFail' })
    //   return
    // }
    // try {
    //   const decoded = verify(token, app.config.jwt.secret)
    //   ctx.helper.success({ ctx, res: decoded })
    // } catch (error) {
    //   return ctx.helper.error({ ctx, error, errorType: 'loginValidateFail' })
    // }
    const userData = await service.user.findByUsername(ctx.state.user.username)
    ctx.helper.success({ ctx, res: userData.toJSON() })
  }

  validateUserInput(rules: any) {
    const { ctx, app } = this
    const errors = app.validator.validate(rules, ctx.request.body)
    ctx.logger.warn(errors)
    return errors
  }

  async loginByEmail() {
    const { ctx, service, app } = this
    const error = this.validateUserInput(userCreateRule)
    if (error) {
      ctx.helper.error({
        ctx,
        error,
        errorType: 'userValidateFail',
      })
      return
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
    // ctx.cookies.set('username', user.username, { encrypt: true })
    // ctx.session.username = user.username
    // ctx.helper.success({ ctx, res: user.toJSON(), msg: '登录成功' })
    // const token = sign({ username: user.username }, app.config.jwt.secret, {
    //   expiresIn: 60 * 60,
    // })
    const token = app.jwt.sign(
      { username: user.username },
      app.config.jwt.secret,
      {
        expiresIn: 60 * 60,
      }
    )
    ctx.helper.success({ ctx, res: { token }, msg: '登录成功' })
  }
  async sendVeriCode() {
    const { ctx, app } = this
    const error = this.validateUserInput(sendCodeRules)
    if (error) {
      ctx.helper.error({
        ctx,
        error,
        errorType: 'userValidateFail',
      })
      return
    }
    const { phoneNumber } = ctx.request.body
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`)
    if (preVeriCode) {
      ctx.helper.error({ ctx, errorType: 'sendCodeFrequentFailInfo' })
      return
    }
    const veriCode = Math.floor(Math.random() * 9000 + 1000).toString()
    await app.redis.set(`phoneVeriCode-${phoneNumber}`, veriCode, 'ex', 60)
    ctx.helper.success({ ctx, res: { veriCode }, msg: '验证码发送成功' })
  }
  async loginByCellphone() {
    const { ctx, app } = this
    const error = this.validateUserInput(userPhoneCreateRule)
    if (error) {
      ctx.helper.error({
        ctx,
        error,
        errorType: 'userValidateFail',
      })
      return
    }
    const { phoneNumber, veriCode } = ctx.request.body
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`)
    if (preVeriCode !== veriCode) {
      ctx.helper.error({ ctx, errorType: 'loginVeriCodeIncorrectFailInfo' })
      return
    }
    const token = await ctx.service.user.loginByCellphone(phoneNumber)
    ctx.helper.success({ ctx, res: { token }, msg: '登录成功' })
  }
}
