import { Service } from 'egg'
import { createSSRApp } from 'vue'
import LogoComponents from 'lego-components'
import { renderToString, renderToNodeStream } from '@vue/server-renderer'
import testContentData from '../../testWork.json'
// TODO 调试 为什么自己的不行
import JieCliComponent from 'jie-cli-components'

export default class UtilsService extends Service {
  async renderToPageData(query: { id: number; uuid: string }) {
    const work = await this.ctx.model.Work.findOne(query).lean()
    if (!work) {
      throw new Error('work not found')
    }
    const { title, desc, content } = work
    // let content = testContentData
    const vueApp = createSSRApp({
      data() {
        return {
          components: (content && content.components) || [],
        }
      },
      template: '<final-page :components="components" />',
    })
    vueApp.use(LogoComponents)
    const html = await renderToString(vueApp)
    const bodyStyle = this.propsToStyle(content && content.props)
    return {
      html,
      title,
      desc,
      bodyStyle,
    }
  }
  propsToStyle(props = {}) {
    const keys = Object.keys(props)
    const styleArr = keys.map((key) => {
      const formatKey = key.replace(
        /[A-Z]/g,
        (match) => `-${match.toLowerCase()}`
      )
      const value = props[key]
      return `${formatKey}:${value}`
    })
    return styleArr.join(';')
  }
}
