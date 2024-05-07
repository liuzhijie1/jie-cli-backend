import { Controller } from 'egg'
import validateInput from '../decorator/inputValidate'

const workCreateRules = {
  title: 'string',
}

interface IndexCondition {
  pageIndex?: number
  pageSize?: number
  select?: string | string[]
  populate?: { path?: string; select?: string }
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
}
