import { Controller } from 'egg'
import sharp from 'sharp'
import { parse, join } from 'path'

export default class UtilsController extends Controller {
  async fileLocalUpload() {
    const { ctx, app } = this
    // const file = ctx.request.files[0]
    // console.log('fileLocalUpload', app.config.baseDir, app.config.baseUrl)
    // const url = file.filepath.replace(app.config.baseDir, app.config.baseUrl)
    // ctx.helper.success({ ctx, res: { url } })
    const { filepath } = ctx.request.files[0]
    // 生成 sharp 实例
    const imageSource = sharp(filepath)
    const metaData = await imageSource.metadata()
    app.logger.debug('metaData', metaData)
    let thumbnailUrl = ''
    // 检查图片宽度是否大于300
    if (metaData.width && metaData.width > 300) {
      // 生成缩略图
      const { name, ext, dir } = parse(filepath)
      app.logger.debug('parse', { name, ext, dir })
      const thumbnailPath = join(dir, `${name}-thumbnail${ext}`)
      await imageSource.resize({ width: 300 }).toFile(thumbnailPath)
      thumbnailUrl = thumbnailPath.replace(
        app.config.baseDir,
        app.config.baseUrl
      )
    }
    const url = filepath.replace(app.config.baseDir, app.config.baseUrl)
    ctx.helper.success({
      ctx,
      res: { url, thumbnailUrl: thumbnailUrl ? thumbnailUrl : url },
    })
  }
}
