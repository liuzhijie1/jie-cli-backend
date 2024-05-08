import { Controller } from 'egg'
import { sign, verify } from 'jsonwebtoken'
import validateInput from '../decorator/inputValidate'

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

export default class UserController extends Controller {
  @validateInput(userCreateRule, 'loginValidateFail')
  async createByEmail() {
    const { ctx, service } = this
    const { username } = ctx.request.body
    const user = await service.user.findByUsername(username)
    if (user) {
      ctx.helper.error({ ctx, errorType: 'createUserAlreadyExists' })
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

  @validateInput(userCreateRule, 'userValidateFail')
  async loginByEmail() {
    const { ctx, service, app } = this
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
      { username: user.username, _id: user._id },
      app.config.jwt.secret,
      {
        expiresIn: 60 * 60,
      }
    )
    ctx.helper.success({ ctx, res: { token }, msg: '登录成功' })
  }
  @validateInput(sendCodeRules, 'userValidateFail')
  async sendVeriCode() {
    const { ctx, app } = this
    const { phoneNumber } = ctx.request.body
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`)
    if (preVeriCode) {
      ctx.helper.error({ ctx, errorType: 'sendVeriCodeFrequentlyFailInfo' })
      return
    }
    const veriCode = Math.floor(Math.random() * 9000 + 1000).toString()
    await app.redis.set(`phoneVeriCode-${phoneNumber}`, veriCode, 'ex', 60)
    ctx.helper.success({ ctx, res: { veriCode }, msg: '验证码发送成功' })
  }

  @validateInput(userPhoneCreateRule, 'userValidateFail')
  async loginByCellphone() {
    const { ctx, app } = this
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
