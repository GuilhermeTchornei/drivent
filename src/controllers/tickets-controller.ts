import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { getAllTicketsTypes, getTicketByUser, insertTicket } from '@/services/tickets-service';

export async function getTicketsTypes(req: Request, res: Response) {
  try {
    const types = await getAllTicketsTypes();
    res.status(httpStatus.OK).send(types);
  } catch (error) {
    res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function getTickets(req: Request, res: Response) {
  const { userId } = res.locals;
  try {
    const ticket = await getTicketByUser(userId);
    res.send(ticket);
  } catch (error) {
    res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postTickets(req: Request, res: Response) {
  const { ticketTypeId } = req.body;

  const userId = res.locals.userId as number;

  if (!ticketTypeId) res.sendStatus(httpStatus.BAD_REQUEST);

  try {
    const ticket = await insertTicket(ticketTypeId, userId);
    res.status(httpStatus.CREATED).send(ticket);
  } catch (error) {
    res.sendStatus(httpStatus.NOT_FOUND);
  }
}
