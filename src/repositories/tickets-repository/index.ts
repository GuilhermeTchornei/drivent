import { TicketType } from '@prisma/client';
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

export default {
  findManyTicketsTypes,
  findFirstTicketByUser,
};
