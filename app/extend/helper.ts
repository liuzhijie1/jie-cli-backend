import { Context } from 'egg'

interface RespType {
  ctx: Context
  res?: any
  msg?: string
}

interface ErrorRespType {
  ctx: Context
  errno: number
  msg?: string
}

export default {
  success({ ctx, res, msg }: RespType) {
    ctx.body = {
      errno: 0,
      data: res ? res : null,
      message: msg ? msg : 'success',
    }
    ctx.status = 200
  },
  error({ ctx, errno, msg }: ErrorRespType) {
    ctx.body = {
      errno,
      message: msg ? msg : 'error',
    }
    ctx.status = 200
  }
}
