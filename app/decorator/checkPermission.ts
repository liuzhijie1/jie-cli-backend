import { Controller } from 'egg'
import { GlobalErrorTypes } from '../error'
import defineRoles from '../roles/roles'
import { subject } from '@casl/ability'
import { permittedFieldsOf } from '@casl/ability/extra'
import { difference, assign } from 'lodash/fp'

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
  value?: { type: 'params' | 'body'; valueKey: string }
}

const defaultSearchOptions = {
  key: 'id',
  value: { type: 'params', valueKey: 'id' },
}

const fieldsOptions = { fieldsFrom: (rule) => rule.fields || [] }

export default function checkPermission(
  modelName: string | ModelMapping,
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
      const searchOptions = assign(defaultSearchOptions, options || {})
      const { key, value } = searchOptions
      const { type, valueKey } = value

      // 构建一个 query
      const source = type === 'params' ? ctx.params : ctx.request.body
      const query = { [key]: source[valueKey] }

      // 构建 modelname
      const mongooseModelName = typeof modelName === 'string' ? modelName : modelName.mongoose
      const caslModelName = typeof modelName === 'string' ? modelName : modelName.casl

      const action =
        options && options.action ? options.action : caslMethodMapping[method]
      console.log(action)
      if (!ctx.state && !ctx.state.user) {
        return ctx.helper.error({ ctx, errorType })
      }
      let permission = false
      let keyPermission = true
      const ability = defineRoles(ctx.state.user)
      const rule = ability.relevantRuleFor(action, caslModelName)
      if (rule && rule.conditions) {
        const certianRecord = await ctx.model[mongooseModelName]
          .findOne(query)
          .lean()
        permission = ability.can(action, subject(caslModelName, certianRecord))
      } else {
        permission = ability.can(action, caslModelName)
      }
      if (rule && rule.fields) {
        const permittedFields = permittedFieldsOf(
          ability,
          action,
          caslModelName,
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
