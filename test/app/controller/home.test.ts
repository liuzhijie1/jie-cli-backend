import * as assert from 'assert'
import { app } from 'egg-mock/bootstrap'

describe('test/app/controller/home.test.ts', () => {
  it('should GET /', async () => {
    const result = await app.httpRequest().get('/').expect(200)
    console.log(result)
    assert(result.body.text === 'I love Egg.js and TypeScript.')
  })
})
