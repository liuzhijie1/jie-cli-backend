import { Service } from 'egg'
import { nanoid } from 'nanoid'
import { Types } from 'mongoose'
import { WorkProps } from '../model/work'
import { IndexCondition } from '../controller/work'
import { create } from 'domain'

const defaultIndexCondition: Required<IndexCondition> = {
  pageIndex: 0,
  pageSize: 10,
  select: '',
  populate: '',
  customSort: { createdAt: -1 },
  find: {},
}

export default class WorkService extends Service {
  async createEmptyWork(payload) {
    const { ctx } = this
    const { username, _id } = ctx.state.user
    const uuid = nanoid(6)
    const newEmptyWork: Partial<WorkProps> = {
      ...payload,
      uuid,
      user: Types.ObjectId(_id),
      author: username,
    }
    return ctx.model.Work.create(newEmptyWork)
  }
  async getList(condition: IndexCondition) {
    const fcondition = { ...defaultIndexCondition, ...condition }
    const { pageIndex, pageSize, select, populate, customSort, find } =
      fcondition
    const skip = pageIndex * pageSize
    const { ctx } = this
    const res = await ctx.model.Work.find(find)
      .select(select)
      .populate(populate)
      .skip(skip)
      .limit(pageSize)
      .sort(customSort)
      .lean()
    const count = await ctx.model.Work.find(find).count()
    return { count, list: res, pageSize, pageIndex }
  }
  async publish(id: number, isTemplate = false) {
    const { ctx, app } = this
    const { H5BaseURL } = app.config
    const payload: Partial<WorkProps> = {
      status: 2,
      latestPublishAt: new Date(),
      ...(isTemplate && { isTemplate: true }),
    }
    const work = await ctx.model.Work.findOneAndUpdate({ id }, payload, {
      new: true,
    })
    const { uuid } = work
    return `${H5BaseURL}/p/${id}-${uuid}`
  }
  async copyWork(wid: number) {
    const { ctx } = this
    const copiedWork = await ctx.model.Work.findOne({ id: wid }).lean()
    if (!copiedWork || !copiedWork.isPublic) {
      throw new Error('can not be copied')
    }
    const uuid = nanoid(6)
    const { content, title, desc, coverImg, id, copiedCount } = copiedWork
    const { username, _id } = ctx.state.user
    const newWork: WorkProps = {
      user: _id,
      author: username,
      uuid,
      coverImg,
      copiedCount: 0,
      status: 1,
      title: `${title}-复制`,
      desc,
      content,
      isTemplate: false,
    }
    const res = await ctx.model.Work.create(newWork)
    await ctx.model.Work.findOneAndUpdate({ id }, { $inc: { copiedCount: 1 } })
    return res
  }
}
