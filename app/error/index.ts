import { userErrorMessage } from "../controller/user";
import { workErrorMessage } from "../controller/work";

export type GlobalErrorTypes = keyof (typeof userErrorMessage & typeof workErrorMessage)

export const globalErrorMessage = {
  ...userErrorMessage,
  ...workErrorMessage,
}