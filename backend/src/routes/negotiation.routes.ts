import { Router } from 'express';
import { NegotiationController } from '../controllers/negotiation.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', NegotiationController.getAll);
router.post('/', NegotiationController.start);
router.get('/:id', NegotiationController.getById);
router.get('/quotation/:id', NegotiationController.getByQuotation);
router.post('/:id/messages', NegotiationController.sendMessage);
router.post('/:id/counter', NegotiationController.counter);
router.post('/:id/accept', NegotiationController.accept);

export default router;
