import { TicketStatus } from '@prisma/client';
import { forbiddenError, notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';
import ticketRepository from '@/repositories/tickets-repository';

async function getBooking(userId: number) {
  const booking = await bookingRepository.findFirstBooking(userId);
  if (!booking) throw notFoundError();

  return booking;
}

async function postBooking(roomId: number, userId: number) {
  const ticket = await ticketRepository.findFirstTicketByUser(userId);
  if (ticket.status !== TicketStatus.PAID || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel)
    throw forbiddenError();

  const room = await bookingRepository.checkRoom(roomId);
  if (!room) throw notFoundError();
  if (room.capacity === room._count.Booking) throw forbiddenError();

  const booking = await bookingRepository.createBooking(roomId, userId);
  return booking;
}

async function updateBooking(bookingId: number, roomId: number, userId: number) {
  const booking = await bookingRepository.checkBooking(bookingId);
  if (!booking) throw forbiddenError();
  if (booking.userId !== userId) throw forbiddenError();

  const room = await bookingRepository.checkRoom(roomId);
  if (!room) throw notFoundError();
  if (room.capacity === room._count.Booking) throw forbiddenError();

  await bookingRepository.updateBookig(bookingId, roomId);

  return { bookingId };
}

const bookingService = {
  getBooking,
  postBooking,
  updateBooking,
};
export default bookingService;
