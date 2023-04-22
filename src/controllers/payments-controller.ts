import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { CardData } from '@/protocols';
import paymentsService from '@/services/payments-service';

export async function getPaymentByTicketId(req: AuthenticatedRequest, res: Response) {
  const ticketId = +req.query.ticketId;
  const { userId } = req;

  if (!ticketId) return res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const payment = await paymentsService.findPaymentByTicketId(ticketId, userId);
    return res.send(payment);
  } catch (error) {
    if (error.name === 'UnauthorizedError') return res.sendStatus(httpStatus.UNAUTHORIZED);
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postPayment(req: AuthenticatedRequest, res: Response) {
  const { ticketId, cardData } = req.body as { ticketId: number; cardData: CardData };
  const { userId } = req;
  if (!ticketId || !cardData) return res.sendStatus(httpStatus.BAD_REQUEST);
  if (!userId) return res.sendStatus(httpStatus.UNAUTHORIZED);

  try {
    const payment = await paymentsService.createPayment(ticketId, cardData, userId);
    return res.send(payment);
  } catch (error) {
    if (error.name === 'UnauthorizedError') return res.sendStatus(httpStatus.UNAUTHORIZED);
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
