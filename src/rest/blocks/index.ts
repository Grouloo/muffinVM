import express from 'express'
import list from './list'
import read from './read'

import pending from './pending'
import refused from './refused'
import accepted from './accepted'

const router = express.Router()

router.get('/', list)
router.get('/pending', pending)
router.get('/refused', refused)
router.get('/accepted', accepted)

router.get('/:hash', read)

export default router
