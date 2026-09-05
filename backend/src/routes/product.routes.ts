import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/categories', ProductController.getCategories);
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

export default router;
