import { Room } from '@prisma/client';
import { prisma } from '@/config';

async function findFirstBooking(userId: number): Promise<{ id: number; Room: Room }> {
  return await prisma.booking.findFirst({
    where: { userId },
    select: {
      id: true,
      Room: true,
    },
  });
}

async function createBooking(roomId: number, userId: number): Promise<{ id: number }> {
  return await prisma.booking.create({
    data: {
      roomId,
      userId,
    },
    select: {
      id: true,
    },
  });
}

async function checkRoom(roomId: number): Promise<Room & { _count: { Booking: number } }> {
  return await prisma.room.findFirst({
    where: {
      id: roomId,
    },
    include: {
      _count: {
        select: {
          Booking: true,
        },
      },
    },
  });
}

async function updateBookig(bookingId: number, roomId: number) {
  return await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      roomId,
    },
  });
}

async function checkBooking(bookingId: number) {
  return await prisma.booking.findUnique({ where: { id: bookingId } });
}

const bookingRepository = {
  findFirstBooking,
  createBooking,
  checkRoom,
  updateBookig,
  checkBooking,
};
export default bookingRepository;
