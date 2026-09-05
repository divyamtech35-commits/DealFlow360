import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleGuard } from '../middleware/role.guard';

const router = Router();

router.use(authMiddleware);

router.get('/tiers', CustomerController.getTiers);
router.get('/', CustomerController.getAll);
router.get('/:id', CustomerController.getById);
router.post('/', roleGuard(['ADMIN', 'SALES_REP']), CustomerController.create);
router.patch('/:id', roleGuard(['ADMIN', 'SALES_REP']), CustomerController.update);

export default router;
