import { Service } from 'egg'
import { UserProps } from '../model/user'

export default class UserService extends Service {
  public async createByEmail(payload: UserProps) {
    const { ctx } = this
    const { username, password } = payload
    const hash = await ctx.genHash(password)
    const userCreatedData: Partial<UserProps> = {
      username,
      password: hash,
      email: username,
    }
    console.log(userCreatedData)
    return ctx.model.User.create(userCreatedData)
  }

  async findById(id: string) {
    return this.ctx.model.User.findById(id)
  }

  async findByUsername(username: string) {
    return this.ctx.model.User.findOne({ username })
  }

  async loginByCellphone(cellphone: string) {
    const { ctx, app } = this
    const user = await this.findByUsername(cellphone)
    if (user) {
      const token = app.jwt.sign(
        { username: user.username, _id: user._id },
        app.config.jwt.secret
      )
      return token
    }
    const userCreatedData: Partial<UserProps> = {
      username: cellphone,
      phoneNumber: cellphone,
      nickName: `乐高${cellphone.slice(-4)}`,
      type: 'cellphone',
    }
    console.log(userCreatedData)
    const newUser = await ctx.model.User.create(userCreatedData)
    const token = app.jwt.sign(
      { username: newUser.username, _id: newUser._id},
      app.config.jwt.secret
    )
    return token
  }
}
