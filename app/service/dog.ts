import { Context, Service } from 'egg';

interface DogResp {
  message: string;
  status: string;
}

export default class DogService extends Service {
  constructor(ctx: Context) {
    super(ctx);
  }

  public async show(): Promise<DogResp> {
    const resp = await this.ctx.curl<DogResp>('https://dog.ceo/api/breeds/image/random', {
      dataType: 'json',
    });
    return resp.data;
  }
}
