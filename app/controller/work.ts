import { Controller } from 'egg'

const workCreateRules = {
  title: 'string',
}

export const workErrorMessage = {
  workValidateFail: {
    errno: 102001,
    message: '输入信息验证失败',
  },
}

export default class WorkController extends Controller {
  private validateUserInput(rules: any) {
    const { ctx, app } = this
    const errors = app.validator.validate(rules, ctx.request.body)
    ctx.logger.warn(errors)
    return errors
  }

  async createWork() {
    const { ctx, service } = this
    const errors = this.validateUserInput(workCreateRules)
    if (errors) {
      ctx.helper.error({
        ctx,
        error: errors,
        errorType: 'workValidateFail',
      })
      return
    }
    const workData = await service.work.createEmptyWork(ctx.request.body)
    ctx.helper.success({ ctx, res: workData })
  }
}
