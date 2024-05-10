import { Service } from 'egg'
import { createSSRApp } from 'vue'
import LogoComponents from 'lego-components'
import { renderToString, renderToNodeStream } from '@vue/server-renderer'

export default class UtilsService extends Service {
  async renderToPageData(query: { id: number; uuid: string }) {
    const work = await this.ctx.model.Work.findOne(query).lean()
    if (!work) {
      throw new Error('work not found')
    }
    const { title, desc, content } = work
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
    return {
      html,
      title,
      desc,
    }
  }
}
