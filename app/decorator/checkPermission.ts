import { Controller } from 'egg'
import { GlobalErrorTypes } from '../error'
import defineRoles from '../roles/roles'
import { subject } from '@casl/ability'
import { permittedFieldsOf } from '@casl/ability/extra'
import { difference } from 'lodash'

const caslMethodMapping: Record<string, string> = {
  GET: 'read',
  POST: 'create',
  PATCH: 'update',
  DELETE: 'delete',
}

interface ModelMapping {
  mongoose: string
  casl: string
}

interface IOptions {
  action?: string
  key?: string
  value?: { type: 'param' | 'body'; valueKey: string }
}

const fieldsOptions = { fieldsFrom: (rule) => rule.fields || [] }

export default function checkPermission(
  modelName: string,
  errorType: GlobalErrorTypes,
  options?: IOptions
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
      const action =
        options && options.action ? options.action : caslMethodMapping[method]
      console.log(action)
      if (!ctx.state && !ctx.state.user) {
        return ctx.helper.error({ ctx, errorType })
      }
      let permission = false
      let keyPermission = true
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
      if (rule && rule.fields) {
        const permittedFields = permittedFieldsOf(
          ability,
          action,
          modelName,
          fieldsOptions
        )
        if (permittedFields.length) {
          const payloadKeys = Object.keys(ctx.request.body)
          const diffKeys = difference(payloadKeys, permittedFields)
          keyPermission = diffKeys.length === 0
        }
      }
      if (!permission || !keyPermission) {
        return ctx.helper.error({ ctx, errorType })
      }
      await originalMethod.apply(this, args)
    }
  }
}
