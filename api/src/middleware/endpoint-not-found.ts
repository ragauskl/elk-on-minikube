import { NextFunction, Response, Request } from 'express'
import HttpError from '../util/http-error'
import { HTTP_CODE } from '../util/http-code'

export function endpointNotFound (req: Request, res: Response, next: NextFunction) {
  const err = new HttpError('Not Found', HTTP_CODE.NOT_FOUND)
  res.status(err.status).send(err.message)
}
