// generate egg log middleware
import { Context } from 'egg';
import { appendFileSync } from 'fs';
export default () => {
  return async (ctx: Context, next: () => Promise<any>) => {
    const start = Date.now();
    const requestTime = new Date();
    await next();
    const used = Date.now() - start;
    appendFileSync('./log.txt', `request as ${requestTime} ${ctx.method} ${ctx.url} ${used}ms\n`);
  };
}