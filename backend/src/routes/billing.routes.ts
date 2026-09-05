import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleGuard } from '../middleware/role.guard';

const router = Router();

router.use(authMiddleware);

// Invoices
router.get('/invoices', BillingController.getAllInvoices);
router.get('/invoices/:id', BillingController.getInvoiceById);
router.post('/invoices/:id/pay', BillingController.payInvoice);

// Subscriptions
router.get('/subscriptions', BillingController.getAllSubscriptions);
router.post('/subscriptions/:id/:action', roleGuard(['ADMIN', 'FINANCE']), BillingController.updateSubscription);

export default router;
