import express from 'express'
import read from './read'
import readTransactions from './transactions'

const router = express.Router()

router.get('/:address', read)

router.get('/:address/transactions', readTransactions)

export default router
