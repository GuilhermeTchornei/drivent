import { connect } from 'http2';
import { Enrollment, TicketType } from '@prisma/client';
import dayjs from 'dayjs';
import { prisma } from '@/config';

export async function findManyTicketsTypes(): Promise<TicketType[]> {
  return await prisma.ticketType.findMany();
}

export async function findFirstTicketByUser(userId: number) {
  return await prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId,
      },
    },
    include: {
      TicketType: true,
    },
  });
}

export async function findEnrollment(userId: number) {
  return await prisma.enrollment.findFirst({ where: { userId } });
}

export async function createTicket(ticketTypeId: number, userId: number, enrollmentId: number) {
  const ticket = await prisma.ticket.create({
    data: {
      status: 'RESERVED',
      enrollmentId,
      ticketTypeId,
    },
    include: {
      TicketType: true,
    },
  });

  return ticket;
}

export default {
  findManyTicketsTypes,
  findFirstTicketByUser,
  createTicket,
  findEnrollment,
};
