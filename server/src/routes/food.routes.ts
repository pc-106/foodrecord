import { Router } from 'express'
import { foodController } from '../controllers/food.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', (req, res, next) => foodController.getByDate(req, res, next))
router.get('/month', (req, res, next) => foodController.getByMonth(req, res, next))
router.post('/', (req, res, next) => foodController.create(req, res, next))
router.put('/:id', (req, res, next) => foodController.update(req, res, next))
router.delete('/:id', (req, res, next) => foodController.delete(req, res, next))
router.get('/search', (req, res, next) => foodController.searchFoods(req, res, next))
router.get('/popular', (req, res, next) => foodController.getPopular(req, res, next))

export default router
