import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import { prisma } from '@/config';

export async function createTicketType(isRemote = false, includesHotel = false) {
  return prisma.ticketType.create({
    data: {
      name: faker.name.findName(),
      price: faker.datatype.number(),
      isRemote,
      includesHotel,
    },
  });
}

export async function createTicket(enrollmentId: number, ticketTypeId: number, status: TicketStatus) {
  return prisma.ticket.create({
    data: {
      enrollmentId,
      ticketTypeId,
      status,
    },
  });
}
