import { Router } from 'express';
import bookingController from '@/controllers/booking-controller';
import { authenticateToken } from '@/middlewares';

const bookingRouter = Router();

bookingRouter.get('/', authenticateToken, bookingController.getBooking);
bookingRouter.post('/', authenticateToken, bookingController.postBooking);
bookingRouter.put('/:bookingId', authenticateToken, bookingController.updateBooking);

export { bookingRouter };
