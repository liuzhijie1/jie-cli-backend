import { Controller } from 'egg'
import { GlobalErrorTypes } from '../error'
import defineRoles from '../roles/roles'
import { subject } from '@casl/ability'

const caslMethodMapping: Record<string, string> = {
  GET: 'read',
  POST: 'create',
  PATCH: 'update',
  DELETE: 'delete',
}

export default function checkPermission(
  modelName: string,
  errorType: GlobalErrorTypes,
  userKey = 'user'
) {
  return function (prototype, key: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    descriptor.value = async function (...args: any[]) {
      const that = this as Controller
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { ctx } = that
      const { id } = ctx.params
      // const userId = ctx.state.user._id
      // const certianRecord = await ctx.model[modelName].findOne({ id })
      const { method } = ctx.request
      const action = caslMethodMapping[method]
      if (!ctx.state && !ctx.state.user) {
        return ctx.helper.error({ ctx, errorType })
      }
      let permission = false
      const ability = defineRoles(ctx.state.user)
      const rule = ability.relevantRuleFor(action, modelName)
      if (rule && rule.conditions) {
        const certianRecord = await ctx.model[modelName]
          .findOne({
            id,
          })
          .lean()
        permission = ability.can(action, subject(modelName, certianRecord))
      } else {
        permission = ability.can(action, modelName)
      }
      if (!permission) {
        return ctx.helper.error({ ctx, errorType })
      }
      await originalMethod.apply(this, args)
    }
  }
}
