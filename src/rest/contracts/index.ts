import express from 'express'
import read from './read'
import readStorageField from './storage/readField'

const router = express.Router()

router.get('/:address/:method', read)
router.get('/:address/storage/:field', readStorageField)

export default router
