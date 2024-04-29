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

  config.logger = {
    level: 'DEBUG',
    consoleLevel: 'DEBUG',
  }

  config.mongoose = {
    url: 'mongodb+srv://liu831666:liujie5720@liujiecloudmongoone.rszcpwv.mongodb.net/imooc-test?retryWrites=true&w=majority',
  }

  config.bcrypt = {
    saltRounds: 10,
  }

  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    myLogger: {
      allowedMethods: ['POST'],
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
