import { Router, Request, Response } from 'express'

const router = Router({ mergeParams: true })
export default router

router.get('/', (req: Request, res: Response) => {
  res.status(200).send('Health check OK.')
})
