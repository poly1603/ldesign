import type { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { error } from '../utils/response'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('请求错误', {
    url: req.url,
    method: req.method,
    error: err.message,
    stack: err.stack,
  })

  return error(res, err.message || '服务器内部错误', 'INTERNAL_ERROR', 500)
}
