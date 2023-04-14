import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getTicketsTypes, getTickets } from '@/controllers/tickets-controller';

const ticketsRouter = Router();

ticketsRouter.all('/*', authenticateToken).get('/types', getTicketsTypes).get('/', getTickets);

export { ticketsRouter };
