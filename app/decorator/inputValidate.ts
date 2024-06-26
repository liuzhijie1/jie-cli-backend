import { GlobalErrorTypes } from '../error'
import { Controller } from 'egg'

export default function validateInput(rules: any, errorType: GlobalErrorTypes) {
  return function (prototype, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const that = this as Controller
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { ctx, app } = that
      const errors = app.validator.validate(rules, ctx.request.body)
      if (errors) {
        ctx.helper.error({
          ctx,
          error: errors,
          errorType,
        })
        return
      }
      await originalMethod.apply(this, args)
    }
  }
}
