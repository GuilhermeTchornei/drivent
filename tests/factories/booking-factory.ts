import { prisma } from '@/config';

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
