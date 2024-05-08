import { Controller } from 'egg'
import validateInput from '../decorator/inputValidate'

const workCreateRules = {
  title: 'string',
}

export interface IndexCondition {
  pageIndex?: number
  pageSize?: number
  select?: string | string[]
  populate?: { path?: string; select?: string } | string
  customSort?: Record<string, any>
  find?: Record<string, any>
}

export default class WorkController extends Controller {
  private validateUserInput(rules: any) {
    const { ctx, app } = this
    const errors = app.validator.validate(rules, ctx.request.body)
    ctx.logger.warn(errors)
    return errors
  }

  @validateInput(workCreateRules, 'workValidateFail')
  async createWork() {
    const { ctx, service } = this
    const workData = await service.work.createEmptyWork(ctx.request.body)
    ctx.helper.success({ ctx, res: workData })
  }
  async myList() {
    const { ctx, service } = this
    const userId = ctx.state.user._id
    const { pageIndex, pageSize, isTemplate, title } = ctx.query
    const findCondition = {
      user: userId,
      ...(isTemplate ? { isTemplate: !!parseInt(isTemplate) } : {}),
      ...(title ? { title: { $regex: title, $options: 'i' } } : {}),
    }
    const condition: IndexCondition = {
      pageIndex: Number(pageIndex) || 0,
      pageSize: Number(pageSize) || 10,
      select: 'id author copiedCount coverImg desc title user isHot createdAt',
      populate: { path: 'user', select: 'username nickName picture' },
      find: findCondition,
    }
    const workList = await service.work.getList(condition)
    ctx.helper.success({ ctx, res: workList })
  }
  async templateList() {
    const { ctx, service } = this
    const { pageIndex, pageSize } = ctx.query
    const condition: IndexCondition = {
      pageIndex: Number(pageIndex) || 0,
      pageSize: Number(pageSize) || 10,
      select: 'id author copiedCount coverImg desc title user isHot createdAt',
      populate: { path: 'user', select: 'username nickName picture' },
      find: { isPublic: true, isTemplate: true },
    }
    const workList = await service.work.getList(condition)
    ctx.helper.success({ ctx, res: workList })
  }
  async checkPermission(id: number) {
    const { ctx } = this
    const userId = ctx.state.user._id
    const certianWork = await ctx.model.Work.findOne({ id })
    if (!certianWork) {
      return false
    }
    return certianWork.user.toString() === userId.toString()
  }
  async update() {
    const { ctx } = this
    const { id } = ctx.params
    const hasPermission = await this.checkPermission(Number(id))
    if (!hasPermission) {
      ctx.helper.error({ ctx, errorType: 'workNoPermissionFail' })
      return
    }
    const payload = ctx.request.body
    const workData = await ctx.model.Work.findOneAndUpdate({ id }, payload, {
      new: true,
    }).lean()
    ctx.helper.success({ ctx, res: workData })
  }
  async delete() {
    const { ctx } = this
    const { id } = ctx.params
    const hasPermission = await this.checkPermission(Number(id))
    if (!hasPermission) {
      ctx.helper.error({ ctx, errorType: 'workNoPermissionFail' })
      return
    }
    const res = await ctx.model.Work.findOneAndDelete({ id }).select('_id id title').lean()
    ctx.helper.success({ ctx, res })
  }
}
