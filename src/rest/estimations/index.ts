import express from 'express'
import fees from './fees'
import message from './message'

const router = express.Router()

router.post('/fees', fees)
router.post('/message', message)

export default router
