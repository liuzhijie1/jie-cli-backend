import { Controller } from 'egg'
import sharp from 'sharp'
import { parse, join, extname } from 'path'
import { createWriteStream, createReadStream } from 'fs'
import { nanoid } from 'nanoid'
import { pipeline } from 'stream/promises'
import Busboy from 'busboy'
import { FileStream } from '../../typings/app'
import { createSSRApp } from 'vue'
import { renderToString, renderToNodeStream } from '@vue/server-renderer'

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
    // const savePromise = new Promise((resolve, reject) => {
    //   stream.pipe(target).on('finish', resolve).on('error', reject)
    // })
    const savePromise = pipeline(stream, target)
    const transformer = sharp().resize({ width: 300 })
    // const thumbnailPromise = new Promise((resolve, reject) => {
    //   stream
    //     .pipe(transformer)
    //     .pipe(target2)
    //     .on('finish', resolve)
    //     .on('error', reject)
    // })
    // await Promise.all([savePromise, thumbnailPromise])
    const thumbnailPromise = pipeline(stream, transformer, target2)
    try {
      await Promise.all([savePromise, thumbnailPromise])
    } catch (error) {
      return ctx.helper.error({ ctx, error, errorType: 'imageUploadFail' })
    }
    // 生成缩略图
    ctx.helper.success({
      ctx,
      res: {
        url: this.pathToURL(savedFilePath),
        thumbnailUrl: this.pathToURL(savedThumbnailPath),
      },
    })
  }
  async testBusBoy() {
    const { ctx, app } = this
    const results = await this.uploadFileUseBusBoy()
    ctx.helper.success({ ctx, res: results })
  }
  uploadFileUseBusBoy() {
    const { ctx, app } = this
    return new Promise<string[]>((resolve, reject) => {
      const busboy = new Busboy({ headers: ctx.req.headers as any })
      const results: string[] = []
      const filePromises: Promise<void>[] = []
      busboy.on('file', (fieldname, file, filename) => {
        app.logger.info('file', fieldname, filename)
        const ext = extname(filename)
        const name = nanoid(6)
        const savePath = join(app.config.baseDir, 'uploads', `${name}${ext}`)
        const saveThumbnailPath = join(
          app.config.baseDir,
          'uploads',
          `${name}_thumbnail${ext}`
        )
        const target = createWriteStream(savePath)
        const target2 = createWriteStream(saveThumbnailPath)
        const transformer = sharp().resize({ width: 300 })
        const savePromise = pipeline(file, target)
        const thumbnailPromise = pipeline(file, transformer, target2)
        const combinedPromise = Promise.all([savePromise, thumbnailPromise])
          .then(() => {
            results.push(this.pathToURL(savePath))
            results.push(this.pathToURL(saveThumbnailPath))
          })
          .catch((error) => {
            reject(error)
          })
        filePromises.push(combinedPromise)
      })
      busboy.on('field', (fieldname, val) => {
        app.logger.info('field', fieldname, val)
      })
      busboy.on('finish', () => {
        Promise.all(filePromises)
          .then(() => {
            resolve(results)
          })
          .catch(reject)
      })
      busboy.on('error', (error) => {
        reject(error)
      })
      ctx.req.pipe(busboy)
    })
  }
  async uploadMultipleFiles() {
    const { ctx, app } = this
    const { fileSize } = app.config.multipart
    const parts = ctx.multipart({ limits: { fileSize: fileSize as number } })
    const urls: string[] = []
    let part: FileStream | string[]
    while ((part = await parts())) {
      if (typeof part === 'string') {
        continue
      }
      if (Array.isArray(part)) {
        app.logger.info('part', part)
        continue
      }
      const ext = extname(part.filename)
      const name = nanoid(6)
      const savePath = join(app.config.baseDir, 'uploads', `${name}${ext}`)
      const saveThumbnailPath = join(
        app.config.baseDir,
        'uploads',
        `${name}_thumbnail${ext}`
      )
      const target = createWriteStream(savePath)
      const target2 = createWriteStream(saveThumbnailPath)
      const transformer = sharp().resize({ width: 300 })
      const savePromise = pipeline(part, target)
      const thumbnailPromise = pipeline(part, transformer, target2)
      try {
        await Promise.all([savePromise, thumbnailPromise])
      } catch (error) {
        return ctx.helper.error({ ctx, error, errorType: 'imageUploadFail' })
      }
      urls.push(this.pathToURL(savePath))
      urls.push(this.pathToURL(saveThumbnailPath))
      if (part.truncated) {
        return ctx.helper.error({
          ctx,
          errorType: 'imageUploadFileSizeError',
          error: `Reach fileSize limit ${fileSize} bytes`,
        })
      }
    }
    ctx.helper.success({ ctx, res: { urls } })
  }
  async renderH5Page() {
    const { ctx, app } = this
    const vueApp = createSSRApp({
      data() {
        return {
          msg: 'hello world',
          title: 'Vue SSR',
          content: 'Hello Vue SSR',
        }
      },
      template: `<h1>{{msg}}</h1>`,
    })
    // const appContent = await renderToString(vueApp)
    // ctx.response.type = 'text/html'
    // ctx.body = appContent
    const stream = renderToNodeStream(vueApp)
    ctx.status = 200
    await pipeline(stream, ctx.res)
  }
  splitIdAndUuid(str = '') {
    const result: { id: string | number; uuid: string } = { id: '', uuid: '' }
    if (!str) return result
    const firstDashIndex = str.indexOf('-')
    if (firstDashIndex < 0) return result
    result.id = str.slice(0, firstDashIndex)
    result.uuid = str.slice(firstDashIndex + 1)
    return result
  }
  async renderH5PageWithData() {
    const { ctx, app } = this
    const { idAndUuid } = ctx.params
    const query = this.splitIdAndUuid(idAndUuid)
    query.id = Number(query.id)
    try {
      const pageData = await this.service.utils.renderToPageData(
        query as { id: number; uuid: string }
      )
      await ctx.render('page.tpl', pageData)
    } catch (error) {
      ctx.helper.error({ ctx, error, errorType: 'h5WorkNotExistError' })
    }
  }
}
