import { Hotel, Room } from '@prisma/client';
import { prisma } from '@/config';

async function findManyHotels(): Promise<Hotel[]> {
  return prisma.hotel.findMany();
}

async function checkIfUserHasHosting(userId: number) {
  return await prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId,
      },
    },
    select: {
      status: true,
      TicketType: {
        select: {
          isRemote: true,
          includesHotel: true,
        },
      },
    },
  });
}

async function findUniqueHotelRooms(hotelId: number): Promise<Hotel & { Rooms: Room[] }> {
  return await prisma.hotel.findUnique({
    where: { id: hotelId },
    include: { Rooms: true },
  });
}

const hotelsRepository = {
  findManyHotels,
  findUniqueHotelRooms,
  checkIfUserHasHosting,
};
export default hotelsRepository;
