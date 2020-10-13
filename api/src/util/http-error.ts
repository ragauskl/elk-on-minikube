import * as util from 'util'

export default class HttpError {
  name: string
  message: string
  status: number
  context: any
  redirect?: boolean
  constructor (message: string, code: number = 500, redirect: boolean = false) {
    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.message = message
    this.status = code
    this.redirect = redirect
  }

  setContext = (data: any) => {
    this.context = data
  }
}

util.inherits(HttpError, Error)
