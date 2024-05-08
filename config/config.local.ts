import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg'

export default (appInfo: EggAppInfo) => {
  const config: PowerPartial<EggAppConfig> = {}
  config.baseUrl = 'http://localhost:7001'
  return config
}
