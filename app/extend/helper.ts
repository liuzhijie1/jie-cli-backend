import { Context } from 'egg'
import { userErrorMessage } from '../controller/user'

interface RespType {
  ctx: Context
  res?: any
  msg?: string
}

interface ErrorRespType {
  ctx: Context
  errno?: number
  msg?: string
  error?: any
  errorType: keyof typeof userErrorMessage
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
  error({ ctx, error, errorType }: ErrorRespType) {
    const { message, errno } = userErrorMessage[errorType]
    ctx.body = {
      errno,
      message,
      ...(error ? { error } : {}),
    }
    ctx.status = 200
  },
}
