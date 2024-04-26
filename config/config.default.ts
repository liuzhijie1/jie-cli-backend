import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg'

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {}

  config.keys = appInfo.name + '_1547377172976_3476'

  config.middleware = []

  config.security = {
    csrf: {
      enable: false,
    },
  }

  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.tpl': 'nunjucks',
    },
  }

  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    myLogger: {
      allowMethods: ['POST'],
    },
    baseUrl: 'default.url',
  }

  config.mongo = {
    client: {
      host: 'localhost',
      port: '27017',
      name: 'test',
      user: 'user',
      password: 'password',
    },
  }

  return { ...(config as {}), ...bizConfig }
}
