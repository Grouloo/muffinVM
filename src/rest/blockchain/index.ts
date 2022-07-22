import express from 'express'
import blockchain from './blockchain'
import meta from './meta'

const router = express.Router()

router.get('/', blockchain)
router.get('/meta', meta)

export default router
