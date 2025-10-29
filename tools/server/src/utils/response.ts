import type { Response } from 'express'
import type { ApiResponse } from '../types'

export function success<T>(res: Response, data?: T, message?: string): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: Date.now(),
  }
  return res.json(response)
}

export function error(
  res: Response,
  message: string,
  code = 'INTERNAL_ERROR',
  statusCode = 500,
  details?: any
): Response {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: Date.now(),
  }
  return res.status(statusCode).json(response)
}
