import { Router } from 'express';
import { getPaymentByTicketId, postPayment } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const paymentRouter = Router();

paymentRouter.all('/*', authenticateToken).get('/', getPaymentByTicketId).post('/process', postPayment);

export { paymentRouter };
