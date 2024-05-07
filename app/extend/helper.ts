import { Context } from 'egg'
import { userErrorMessage } from '../controller/user'
import { workErrorMessage } from '../controller/work'

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
  errorType: keyof (typeof userErrorMessage & typeof workErrorMessage)
}

const globalErrorMessage = {
  ...userErrorMessage,
  ...workErrorMessage,
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
    const { message, errno } = globalErrorMessage[errorType]
    ctx.body = {
      errno,
      message,
      ...(error ? { error } : {}),
    }
    ctx.status = 200
  },
}
