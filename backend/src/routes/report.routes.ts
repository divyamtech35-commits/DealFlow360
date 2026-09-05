import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleGuard } from '../middleware/role.guard';

const router = Router();

router.use(authMiddleware);

router.get('/sales', ReportController.getSales);
router.get('/revenue', ReportController.getRevenue);
router.get('/fulfillment', ReportController.getFulfillment);
router.get('/billing', ReportController.getBilling);
router.get('/audit', roleGuard(['ADMIN', 'SALES_MANAGER']), ReportController.getAuditLogs);

export default router;
