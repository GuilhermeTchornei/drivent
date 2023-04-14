import { notFoundError } from '@/errors';
import { findFirstTicketByUser, findManyTicketsTypes } from '@/repositories/tickets-repository';

export async function getAllTicketsTypes() {
  return await findManyTicketsTypes();
}

export async function getTicketByUser(userId: number) {
  const ticket = await findFirstTicketByUser(userId);
  if (!ticket) throw notFoundError();
  return ticket;
}

export default {
  getAllTicketsTypes,
  getTicketByUser,
};
