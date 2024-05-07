import { Application } from 'egg'

export default (app: Application) => {
  const { router, controller } = app

  // const logger = app.middleware.myLogger({ allowedMethods: ['GET'] }, app)
  // const myLogger = app.middleware.myLogger({ allowedMethods: ['GET'] }, app)

  // const jwt = app.middleware.jwt(app.config.jwt)

  // console.log('app.config.jwt', jwt)

  const jwtMiddleware = app.jwt as any

  router.get('/', controller.home.index)
  // router.get('/test/:id', controller.test.index)
  // router.post('/test/:id', controller.test.index)
  // router.get('/dog', myLogger, controller.test.getDog)

  router.post('/api/users/create', controller.user.createByEmail)

  router.get('/api/users/current', controller.user.show)
  router.post('/api/users/login', controller.user.loginByEmail)
  router.get('/api/users/getUserInfo', jwtMiddleware, controller.user.show)
  router.post('/api/users/loginByEmail', controller.user.loginByEmail)
  router.post('/api/users/genVeriCode', controller.user.sendVeriCode)
  router.post('/api/users/loginByPhoneNumber', controller.user.loginByCellphone)

  router.post('/api/works', jwtMiddleware, controller.work.createWork)
  // router.get('/api/users/:id', controller.user.show)
}
