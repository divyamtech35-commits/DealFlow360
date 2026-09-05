import { Router } from 'express';
import { ApprovalController } from '../controllers/approval.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleGuard } from '../middleware/role.guard';

const router = Router();

router.use(authMiddleware);

router.get('/', roleGuard(['ADMIN', 'SALES_MANAGER', 'FINANCE', 'SALES_REP']), ApprovalController.getAll);
router.get('/:id', roleGuard(['ADMIN', 'SALES_MANAGER', 'FINANCE']), ApprovalController.getById);
router.post('/:id/approve', roleGuard(['ADMIN', 'SALES_MANAGER', 'FINANCE']), ApprovalController.approve);
router.post('/:id/reject', roleGuard(['ADMIN', 'SALES_MANAGER', 'FINANCE']), ApprovalController.reject);

export default router;
