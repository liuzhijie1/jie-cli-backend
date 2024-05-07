import { Controller } from 'egg'
import validateInput from '../decorator/inputValidate'

const workCreateRules = {
  title: 'string',
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
