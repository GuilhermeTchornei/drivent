import faker from '@faker-js/faker';
import { Ticket, TicketStatus, TicketType } from '@prisma/client';
import { prisma } from '@/config';

export function fakeTicket(status: TicketStatus) {
  return {
    id: faker.datatype.number(),
    enrollmentId: faker.datatype.number(),
    status,
    ticketTypeId: faker.datatype.number(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
  } as Ticket;
}

export function fakeTicketType(isRemote = false, includesHotel = false) {
  return {
    id: faker.datatype.number(),
    name: faker.name.findName(),
    price: faker.datatype.number(),
    isRemote,
    includesHotel,
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
  } as TicketType;
}

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
