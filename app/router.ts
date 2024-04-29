import { Application } from 'egg'

export default (app: Application) => {
  const { router, controller } = app

  // const logger = app.middleware.myLogger({ allowedMethods: ['GET'] }, app)
  // const myLogger = app.middleware.myLogger({ allowedMethods: [ 'GET' ] }, app)

  router.get('/', controller.home.index)
  // router.get('/test/:id', controller.test.index)
  // router.post('/test/:id', controller.test.index)
  // router.get('/dog', myLogger, controller.test.getDog)

  router.post('/api/users/create', controller.user.createByEmail)
  router.get('/api/users/:id', controller.user.show)
  router.get('/api/users/current', controller.user.show)
  router.post('/api/users/login', controller.user.loginByEmail)
}
