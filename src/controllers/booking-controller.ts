import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.getBooking(userId);
    return res.send(booking);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId = +req.body.roomId;

  if (isNaN(roomId) || roomId < 1) return res.sendStatus(httpStatus.FORBIDDEN);

  try {
    const booking = await bookingService.postBooking(roomId, userId);
    return res.status(httpStatus.OK).send({ bookingId: booking.id });
  } catch (error) {
    if (error.name === 'NotFoundError') return res.sendStatus(httpStatus.NOT_FOUND);
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const roomId = +req.body.roomId;
  const bookingId = +req.params.bookingId;

  if (isNaN(roomId) || roomId < 1) return res.sendStatus(httpStatus.FORBIDDEN);
  if (isNaN(bookingId) || bookingId < 1) return res.sendStatus(httpStatus.FORBIDDEN);

  try {
    const booking = await bookingService.updateBooking(bookingId, roomId, userId);
    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.name === 'NotFoundError') return res.sendStatus(httpStatus.NOT_FOUND);
    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

const bookingController = {
  getBooking,
  postBooking,
  updateBooking,
};
export default bookingController;
