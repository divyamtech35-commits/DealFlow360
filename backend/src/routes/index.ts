import { Router } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import productRoutes from './product.routes';
import quotationRoutes from './quotation.routes';
import approvalRoutes from './approval.routes';
import fulfillmentRoutes from './fulfillment.routes';
import billingRoutes from './billing.routes';
import negotiationRoutes from './negotiation.routes';
import dealHealthRoutes from './deal_health.routes';
import reportRoutes from './report.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/quotations', quotationRoutes);
router.use('/approvals', approvalRoutes);
router.use('/fulfillment', fulfillmentRoutes);
router.use('/', billingRoutes); // mounts /invoices and /subscriptions
router.use('/negotiations', negotiationRoutes);
router.use('/deal-health', dealHealthRoutes);
router.use('/reports', reportRoutes);

export default router;
