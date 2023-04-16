import { notFoundError } from '@/errors';
import ticketrepository from '@/repositories/ticket-repository';

async function getAllTicketsTypes() {
  return await ticketrepository.findManyTicketsTypes();
}

async function getTicketByUser(userId: number) {
  const ticket = await ticketrepository.findFirstTicketByUser(userId);
  if (!ticket) throw notFoundError();
  return ticket;
}

async function insertTicket(ticketTypeId: number, userId: number) {
  const enrollment = await ticketrepository.findEnrollment(userId);
  if (!enrollment) throw notFoundError();
  return await ticketrepository.createTicket(ticketTypeId, userId, enrollment.id);
}

const ticketService = {
  getAllTicketsTypes,
  getTicketByUser,
  insertTicket,
};
export default ticketService;
