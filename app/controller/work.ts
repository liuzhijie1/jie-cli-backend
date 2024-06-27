import { Controller } from 'egg'
import validateInput from '../decorator/inputValidate'
import checkPermission from '../decorator/checkPermission'
import { nanoid } from 'nanoid'

const workCreateRules = {
  title: 'string',
}

const channelCreateRules = {
  name: 'string',
  workId: 'number',
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

  @validateInput(channelCreateRules, 'channelValidateFail')
  @checkPermission(
    { casl: 'Channel', mongoose: 'Work' },
    'workNoPermissionFail',
    {
      value: {
        type: 'body',
        valueKey: 'workId',
      },
    }
  )
  async createChannel() {
    const { ctx } = this
    const { name, workId } = ctx.request.body
    const newChannel = {
      name,
      id: nanoid(6),
    }
    const res = await ctx.model.Work.findOneAndUpdate(
      { id: workId },
      {
        $push: {
          channels: newChannel,
        },
      }
    )
    if (res) {
      ctx.helper.success({ ctx, res: newChannel })
    } else {
      ctx.helper.error({ ctx, errorType: 'channelOperateFail' })
    }
  }

  @checkPermission(
    { casl: 'Channel', mongoose: 'Work' },
    'workNoPermissionFail'
  )
  async getWorkChannel() {
    const { ctx } = this
    const { id } = ctx.params
    const certianWork = await ctx.model.Work.findOne({ id })
    if (certianWork) {
      const { channels } = certianWork
      ctx.helper.success({
        ctx,
        res: {
          count: (channels && channels.length) || 0,
          list: channels || [],
        },
      })
    } else {
      ctx.helper.error({ ctx, errorType: 'channelOperateFail' })
    }
  }

  @checkPermission(
    { casl: 'Channel', mongoose: 'Work' },
    'workNoPermissionFail',
    { key: 'channels.id' }
  )
  async updateChannelName() {
    const { ctx } = this
    const { id } = ctx.params
    const { name } = ctx.request.body
    const res = await ctx.model.Work.findOneAndUpdate(
      { 'channels.id': id },
      {
        $set: {
          'channels.$.name': name,
        },
      }
    )
    if (res) {
      ctx.helper.success({ ctx, res: { name } })
    } else {
      ctx.helper.error({ ctx, errorType: 'channelOperateFail' })
    }
  }

  @checkPermission(
    { casl: 'Channel', mongoose: 'Work' },
    'workNoPermissionFail',
    { key: 'channels.id' }
  )
  async deleteChannel() {
    const { ctx } = this
    const { id } = ctx.params
    const work = await ctx.model.Work.findOneAndUpdate(
      { 'channels.id': id },
      {
        $pull: {
          channels: { id },
        },
      },
      { new: true }
    )
    if (work) {
      ctx.helper.success({ ctx, res: work })
    } else {
      ctx.helper.error({ ctx, errorType: 'channelOperateFail' })
    }
  }

  @validateInput(workCreateRules, 'workValidateFail')
  @checkPermission('Work', 'workNoPermissionFail')
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
  // async checkPermission(id: number) {
  //   const { ctx } = this
  //   const userId = ctx.state.user._id
  //   const certianWork = await ctx.model.Work.findOne({ id })
  //   if (!certianWork) {
  //     return false
  //   }
  //   return certianWork.user.toString() === userId.toString()
  // }
  @checkPermission('Work', 'workNoPermissionFail')
  async update() {
    const { ctx } = this
    const { id } = ctx.params
    const payload = ctx.request.body
    const workData = await ctx.model.Work.findOneAndUpdate({ id }, payload, {
      new: true,
    }).lean()
    ctx.helper.success({ ctx, res: workData })
  }
  @checkPermission('Work', 'workNoPermissionFail')
  async delete() {
    const { ctx } = this
    const { id } = ctx.params
    const res = await ctx.model.Work.findOneAndDelete({ id })
      .select('_id id title')
      .lean()
    ctx.helper.success({ ctx, res })
  }
  @checkPermission('Work', 'workNoPermissionFail', { action: 'publish' })
  async publish(isTemplate: boolean) {
    const { ctx, service } = this
    const { id } = ctx.params
    const url = await service.work.publish(Number(id), isTemplate)
    ctx.helper.success({ ctx, res: { url } })
  }
  async publishWork() {
    await this.publish(false)
  }
  async publishTemplate() {
    await this.publish(true)
  }
  async copyWork() {
    const { ctx, service } = this
    const { id } = ctx.params
    try {
      const res = await service.work.copyWork(Number(id))
      ctx.helper.success({ ctx, res })
    } catch (error) {
      return ctx.helper.error({ ctx, errorType: 'workNoPublicFail' })
    }
  }
  async template() {
    const { ctx } = this
    const { id } = ctx.params
    const work = await ctx.model.Work.findOne({ id }).lean()
    if (!work || !work.isPublic || !work.isTemplate) {
      return ctx.helper.error({ ctx, errorType: 'workNoPublicFail' })
    }
    ctx.helper.success({ ctx, res: work })
  }
  @checkPermission('Work', 'workNoPermissionFail')
  async myWork() {
    const { ctx } = this
    const { id } = ctx.params
    const work = await ctx.model.Work.findOne({ id }).lean()
    ctx.helper.success({ ctx, res: work })
  }
}
