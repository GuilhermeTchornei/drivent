import { notFoundError, unauthorizedError } from '@/errors';
import { CardData } from '@/protocols';
import paymentRepository from '@/repositories/payment-repository';
import ticketRepository from '@/repositories/ticket-repository';

async function findPaymentByTicketId(ticketId: number, userId: number) {
  const ticket = await ticketRepository.findUniqueTicketById(ticketId);
  if (!ticket) throw notFoundError();
  if (ticket.Enrollment.userId !== userId) throw unauthorizedError();

  const payment = await paymentRepository.findFirstPaymentByTicketId(ticketId);
  if (!payment) throw unauthorizedError();

  return payment;
}

async function createPayment(ticketId: number, cardData: CardData, userId: number) {
  const ticket = await ticketRepository.findUniqueTicketById(ticketId);
  if (!ticket) throw notFoundError();
  if (ticket.Enrollment.userId !== userId) throw unauthorizedError();

  //const hotelPrice: number = ticket.TicketType.includesHotel ? 350 : 0;
  //const value: number = ticket.TicketType.price + hotelPrice;
  const lastDigits: string = cardData.number.toString().slice(-4);

  const payment = await paymentRepository.createPayment(ticketId, ticket.TicketType.price, cardData.issuer, lastDigits);
  return payment;
}

const paymentService = {
  findPaymentByTicketId,
  createPayment,
};
export default paymentService;
