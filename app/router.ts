import { Application } from 'egg'

export default (app: Application) => {
  const { router, controller } = app

  const logger = app.middleware.logger({ allowedMethods: ['GET'] }, app)

  router.get('/', controller.home.index)
  router.get('/test/:id', controller.test.index)
  router.post('/test/:id', controller.test.index)
  router.get('/dog', logger, controller.test.getDog)
}
