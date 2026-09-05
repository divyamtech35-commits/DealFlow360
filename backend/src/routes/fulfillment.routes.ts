import { Router } from 'express';
import { FulfillmentController } from '../controllers/fulfillment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleGuard } from '../middleware/role.guard';

const router = Router();

router.use(authMiddleware);

router.get('/warehouses', FulfillmentController.getWarehouses);
router.get('/stock', FulfillmentController.getStock);
router.get('/', FulfillmentController.getAll);
router.get('/:id', FulfillmentController.getById);
router.post('/:id/allocate', roleGuard(['ADMIN', 'FINANCE', 'SALES_MANAGER']), FulfillmentController.updateStatus);
router.post('/:id/ship', roleGuard(['ADMIN', 'FINANCE']), FulfillmentController.ship);
router.post('/:id/complete', roleGuard(['ADMIN', 'FINANCE']), FulfillmentController.complete);

export default router;
