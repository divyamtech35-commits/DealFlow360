import { Router } from 'express';
import { QuotationController } from '../controllers/quotation.controller';
import { RecommendationController } from '../controllers/recommendation.controller';
import { DealHealthController } from '../controllers/deal_health.controller';
import { ApprovalController } from '../controllers/approval.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleGuard } from '../middleware/role.guard';

const router = Router();

router.use(authMiddleware);

router.post('/calculate', QuotationController.calculate);
router.get('/', QuotationController.getAll);
router.get('/:id', QuotationController.getById);
router.post('/', roleGuard(['ADMIN', 'SALES_REP']), QuotationController.create);

router.post('/:id/calculate', QuotationController.calculate);
router.post('/:id/submit', roleGuard(['ADMIN', 'SALES_REP']), QuotationController.submit);
router.post('/:id/confirm', QuotationController.confirm);
router.post('/:id/cancel', QuotationController.cancel);

router.get('/:id/recommendations', RecommendationController.getForQuotation);
router.get('/:id/deal-health', DealHealthController.getForQuotation);
router.get('/:id/approvals', ApprovalController.getHistory);

export default router;
