import { Hotel, Room, TicketStatus } from '@prisma/client';
import { notFoundError, paymentRequiredError } from '@/errors';
import hotelsRepository from '@/repositories/hotels-repository';

async function getAllHotels(userId: number): Promise<Hotel[]> {
  await checkUserHosting(userId);

  const hotels: Hotel[] = await hotelsRepository.findManyHotels();

  if (hotels.length === 0) throw notFoundError();

  return hotels;
}

async function getHotelRooms(userId: number, hotelId: number): Promise<Hotel & { Rooms: Room[] }> {
  await checkUserHosting(userId);

  const hotelRooms = await hotelsRepository.findUniqueHotelRooms(hotelId);
  if (!hotelRooms || hotelRooms.Rooms.length === 0) throw notFoundError();

  return hotelRooms;
}

async function checkUserHosting(userId: number) {
  const ticket = await hotelsRepository.checkIfUserHasHosting(userId);
  if (!ticket) throw notFoundError();
  if (ticket.status !== TicketStatus.PAID || !ticket.TicketType.includesHotel || ticket.TicketType.isRemote)
    throw paymentRequiredError();
}

const hotelsService = {
  getAllHotels,
  getHotelRooms,
};
export default hotelsService;
