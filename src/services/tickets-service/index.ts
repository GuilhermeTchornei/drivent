import { notFoundError } from '@/errors';
import {
  createTicket,
  findEnrollment,
  findFirstTicketByUser,
  findManyTicketsTypes,
} from '@/repositories/tickets-repository';

export async function getAllTicketsTypes() {
  return await findManyTicketsTypes();
}

export async function getTicketByUser(userId: number) {
  const ticket = await findFirstTicketByUser(userId);
  if (!ticket) throw notFoundError();
  return ticket;
}

export async function insertTicket(ticketTypeId: number, userId: number) {
  const enrollment = await findEnrollment(userId);
  if (!enrollment) throw notFoundError();
  return await createTicket(ticketTypeId, userId, enrollment.id);
}

export default {
  getAllTicketsTypes,
  getTicketByUser,
  insertTicket,
};
