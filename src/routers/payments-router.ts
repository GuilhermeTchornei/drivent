import { Router } from 'express';
import { getPaymentByTicketId, postPayment } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const paymentsRouter = Router();

paymentsRouter.all('/*', authenticateToken).get('/', getPaymentByTicketId).post('/process', postPayment);

export { paymentsRouter };
