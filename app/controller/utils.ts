import { Controller } from 'egg'
import sharp from 'sharp'
import { parse, join, extname } from 'path'
import { createWriteStream } from 'fs'
import { nanoid } from 'nanoid'

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
  pathToURL(path: string) {
    return path.replace(this.app.config.baseDir, this.app.config.baseUrl)
  }
  async fileUploadByStream() {
    const { ctx, app } = this
    const stream = await ctx.getFileStream()
    // uploads/***.ext
    // uploads/xxx_thumbnail.ext
    const ext = extname(stream.filename)
    const name = nanoid(6)
    const filename = `${name}${ext}`
    const savedFilePath = join(app.config.baseDir, 'uploads', filename)
    const savedThumbnailPath = join(
      app.config.baseDir,
      'uploads',
      `${name}_thumbnail${ext}`
    )
    const target = createWriteStream(savedFilePath)
    const target2 = createWriteStream(savedThumbnailPath)

    // 这里需要注意对流需要同时进行两次处理，所以需要两个 Promise， 不然的话会报错
    const savePromise = new Promise((resolve, reject) => {
      stream.pipe(target).on('finish', resolve).on('error', reject)
    })
    const transformer = sharp().resize({ width: 300 })
    const thumbnailPromise = new Promise((resolve, reject) => {
      stream
        .pipe(transformer)
        .pipe(target2)
        .on('finish', resolve)
        .on('error', reject)
    })
    await Promise.all([savePromise, thumbnailPromise])
    // 生成缩略图
    ctx.helper.success({
      ctx,
      res: {
        url: this.pathToURL(savedFilePath),
        thumbnailUrl: this.pathToURL(savedThumbnailPath),
      },
    })
  }
}
