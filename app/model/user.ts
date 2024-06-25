// generate User Model
import { Application } from 'egg'
import { Schema } from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

export interface UserProps {
  username: string
  password: string
  email?: string
  nickName?: string
  picture?: string
  phoneNumber?: string
  createdAt: Date
  updatedAt: Date
  type: 'email' | 'cellphone'
  provider?: 'gitee'
  oauthID?: string
  role?: 'admin' | 'normal'
}

function initUserModel(app: Application) {
  const UserSchema = new Schema<UserProps>(
    {
      username: { type: String, unique: true, required: true },
      password: { type: String },
      nickName: { type: String },
      picture: { type: String },
      email: { type: String },
      phoneNumber: { type: String },
      type: { type: String, default: 'email' },
      provider: { type: String },
      oauthID: { type: String },
      role: { type: String, default: 'normal' },
    },
    {
      timestamps: true,
      toJSON: {
        transform(_doc, ret) {
          delete ret.password
          delete ret.__v
        },
      },
    }
  )
  UserSchema.plugin(AutoIncrementFactory(app.mongoose), {
    id: 'user_id_counter',
    inc_field: 'id',
  })
  return app.mongoose.model<UserProps>('User', UserSchema)
}

export default initUserModel
