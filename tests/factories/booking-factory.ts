import faker from '@faker-js/faker';
import { Booking } from '@prisma/client';
import { prisma } from '@/config';

export function fakeBooking() {
  return {
    id: faker.datatype.number(),
    roomId: faker.datatype.number(),
    userId: faker.datatype.number(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
  } as Booking;
}

export async function createBooking(userId: number, roomId = 1) {
  return await prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}

export async function findBookingById(id: number) {
  return await prisma.booking.findUnique({ where: { id } });
}
