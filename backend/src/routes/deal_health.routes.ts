import { Router } from 'express';
import { DealHealthController } from '../controllers/deal_health.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', DealHealthController.getAll);
router.get('/quotations/:id', DealHealthController.getForQuotation);
router.post('/:id/resolve', DealHealthController.resolve);

export default router;
