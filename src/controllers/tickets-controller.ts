import { Request, Response } from 'express';
import httpStatus from 'http-status';
import ticketService from '@/services/tickets-service';
import { AuthenticatedRequest } from '@/middlewares';

export async function getTicketsTypes(req: Request, res: Response) {
  try {
    const types = await ticketService.getAllTicketsTypes();
    res.status(httpStatus.OK).send(types);
  } catch (error) {
    res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function getTickets(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const ticket = await ticketService.getTicketByUser(userId);
    res.send(ticket);
  } catch (error) {
    res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postTickets(req: AuthenticatedRequest, res: Response) {
  const { ticketTypeId } = req.body;

  const { userId } = req;

  if (!ticketTypeId) res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const ticket = await ticketService.insertTicket(ticketTypeId, userId);
    res.status(httpStatus.CREATED).send(ticket);
  } catch (error) {
    res.sendStatus(httpStatus.NOT_FOUND);
  }
}
