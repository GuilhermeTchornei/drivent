import { Payment } from '@prisma/client';
import { prisma } from '@/config';

async function findFirstPaymentByTicketId(ticketId: number): Promise<Payment> {
  const payment = await prisma.payment.findFirst({ where: { ticketId } });
  return payment;
}

async function createPayment(ticketId: number, value: number, cardIssuer: string, cardLastDigits: string) {
  const payment = await prisma.payment.create({
    data: {
      ticketId,
      value,
      cardIssuer,
      cardLastDigits,
    },
  });

  await prisma.ticket.update({
    data: {
      status: 'PAID',
    },
    where: {
      id: payment.ticketId,
    },
  });
  return payment;
}

const paymentRepository = {
  findFirstPaymentByTicketId,
  createPayment,
};
export default paymentRepository;
