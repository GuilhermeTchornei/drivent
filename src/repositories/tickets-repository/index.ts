import { TicketType } from '@prisma/client';
import { prisma } from '@/config';

async function findManyTicketsTypes(): Promise<TicketType[]> {
  return await prisma.ticketType.findMany();
}

async function findUniqueTicketById(id: number) {
  return await prisma.ticket.findUnique({
    where: { id },
    include: {
      TicketType: true,
      Enrollment: {
        select: {
          userId: true,
        },
      },
    },
  });
}

async function findFirstTicketByUser(userId: number) {
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

async function findEnrollment(userId: number) {
  return await prisma.enrollment.findFirst({ where: { userId } });
}

async function createTicket(ticketTypeId: number, userId: number, enrollmentId: number) {
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

const ticketRepository = {
  findManyTicketsTypes,
  findFirstTicketByUser,
  createTicket,
  findEnrollment,
  findUniqueTicketById,
};
export default ticketRepository;
