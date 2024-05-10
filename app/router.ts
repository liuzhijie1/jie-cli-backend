import { Application } from 'egg'

export default (app: Application) => {
  const { router, controller } = app

  // const logger = app.middleware.myLogger({ allowedMethods: ['GET'] }, app)
  // const myLogger = app.middleware.myLogger({ allowedMethods: ['GET'] }, app)

  // const jwt = app.middleware.jwt(app.config.jwt)

  // console.log('app.config.jwt', jwt)

  // const jwtMiddleware = app.jwt as any

  router.get('/', controller.home.index)
  // router.get('/test/:id', controller.test.index)
  // router.post('/test/:id', controller.test.index)
  // router.get('/dog', myLogger, controller.test.getDog)

  router.prefix('/api')
  // router.post('/api/users/create', controller.user.createByEmail)
  // router.get('/api/users/current', controller.user.show)
  // router.post('/api/users/login', controller.user.loginByEmail)
  // router.get('/api/users/getUserInfo', jwtMiddleware, controller.user.show)
  // router.post('/api/users/loginByEmail', controller.user.loginByEmail)
  // router.post('/api/users/genVeriCode', controller.user.sendVeriCode)
  // router.post('/api/users/loginByPhoneNumber', controller.user.loginByCellphone)
  router.post('/users/create', controller.user.createByEmail)
  router.get('/users/current', controller.user.show)
  router.post('/users/login', controller.user.loginByEmail)
  router.get('/users/getUserInfo', controller.user.show)
  router.post('/users/loginByEmail', controller.user.loginByEmail)
  router.post('/users/genVeriCode', controller.user.sendVeriCode)
  router.post('/users/loginByPhoneNumber', controller.user.loginByCellphone)
  // router.get('/api/users/:id', controller.user.show)

  // router.post('/api/works', jwtMiddleware, controller.work.createWork)
  // router.get('/api/works', jwtMiddleware, controller.work.myList)
  // router.get('/api/templates', controller.work.templateList)
  // router.patch('/api/works/:id', jwtMiddleware, controller.work.update)
  // router.delete('/api/works/:id', jwtMiddleware, controller.work.delete)
  // router.post(
  //   '/api/works/publish/:id',
  //   jwtMiddleware,
  //   controller.work.publishWork
  // )
  // router.post(
  //   '/api/works/publish-template/:id',
  //   jwtMiddleware,
  //   controller.work.publishTemplate
  // )
  // router.post('/api/works/copy/:id', jwtMiddleware, controller.work.copyWork)
  // router.get('/api/works/:id', jwtMiddleware, controller.work.myWork)
  // router.get('/api/templates/:id', controller.work.template)
  // router.post('/api/utils/upload', controller.utils.fileLocalUpload)
  // router.post('/api/utils/upload-stream', controller.utils.fileUploadByStream)
  router.post('/works', controller.work.createWork)
  router.get('/works', controller.work.myList)
  router.get('/templates', controller.work.templateList)
  router.patch('/works/:id', controller.work.update)
  router.delete('/works/:id', controller.work.delete)
  router.post(
    '/works/publish/:id',
    controller.work.publishWork
  )
  router.post(
    '/works/publish-template/:id',
    controller.work.publishTemplate
  )
  router.post('/works/copy/:id', controller.work.copyWork)
  router.get('/works/:id', controller.work.myWork)
  router.get('/templates/:id', controller.work.template)
  router.post('/utils/upload', controller.utils.fileLocalUpload)
  router.post('/utils/upload-stream', controller.utils.fileUploadByStream)
  // TODO oss upload
  // router.post('/api/utils/upload-oss', controller.utils.fileOssUpload)
  // router.post('/api/utils/upload-busboy', controller.utils.testBusBoy)
  // router.post('/api/utils/upload-img', controller.utils.uploadMultipleFiles)
  router.post('/utils/upload-busboy', controller.utils.testBusBoy)
  router.post('/utils/upload-img', controller.utils.uploadMultipleFiles)
}
