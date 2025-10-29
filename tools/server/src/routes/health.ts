import { Router } from 'express'
import { success } from '../utils/response'

export const healthRouter = Router()

healthRouter.get('/', (req, res) => {
  return success(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
  })
})
