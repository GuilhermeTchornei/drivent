import { Room, Ticket, TicketStatus, TicketType } from '@prisma/client';
import { fakeRoom, fakeTicket, fakeTicketType } from '../factories';
import { fakeBooking } from '../factories/booking-factory';
import bookingRepository from '@/repositories/booking-repository';
import bookingService from '@/services/booking-service';
import { forbiddenError, notFoundError } from '@/errors';
import ticketRepository from '@/repositories/tickets-repository';

describe('Booking service test suite', () => {
  describe('getBooking test', () => {
    it('should return booking', async () => {
      const room = fakeRoom();
      const booking = {
        id: 1,
        room,
      };

      jest.spyOn(bookingRepository, 'findFirstBooking').mockImplementationOnce((): any => {
        return booking;
      });
      const response = await bookingService.getBooking(1);

      expect(response).toEqual(booking);
      expect(bookingRepository.findFirstBooking).toBeCalled();
    });

    it('should return notFound error if dont have any booking', () => {
      jest.spyOn(bookingRepository, 'findFirstBooking').mockImplementationOnce((): any => {
        return undefined;
      });
      const promise = bookingService.getBooking(1);

      expect(promise).rejects.toEqual(notFoundError());
      expect(bookingRepository.findFirstBooking).toBeCalled();
    });
  });

  describe('postBooking test', () => {
    it('should return forbidden error if ticket status isnt paid', () => {
      const ticket = fakeTicket(TicketStatus.RESERVED);
      const TicketType = fakeTicketType(false, true);
      jest.spyOn(ticketRepository, 'findFirstTicketByUser').mockImplementationOnce((): any => {
        return {
          ...ticket,
          TicketType,
        } as Ticket & { TicketType: TicketType };
      });

      const promise = bookingService.postBooking(1, 1);
      expect(promise).rejects.toEqual(forbiddenError());
      expect(ticketRepository.findFirstTicketByUser).toBeCalled();
    });

    it('should return forbidden error if ticket is remote', () => {
      const ticket = fakeTicket(TicketStatus.PAID);
      const TicketType = fakeTicketType(true, true);
      jest.spyOn(ticketRepository, 'findFirstTicketByUser').mockImplementationOnce((): any => {
        return {
          ...ticket,
          TicketType,
        } as Ticket & { TicketType: TicketType };
      });

      const promise = bookingService.postBooking(1, 1);
      expect(promise).rejects.toEqual(forbiddenError());
      expect(ticketRepository.findFirstTicketByUser).toBeCalled();
    });

    it('should return forbidden error if ticket doesnt includes hotel', () => {
      const ticket = fakeTicket(TicketStatus.PAID);
      const TicketType = fakeTicketType(false, false);
      jest.spyOn(ticketRepository, 'findFirstTicketByUser').mockImplementationOnce((): any => {
        return {
          ...ticket,
          TicketType,
        } as Ticket & { TicketType: TicketType };
      });

      const promise = bookingService.postBooking(1, 1);
      expect(promise).rejects.toEqual(forbiddenError());
      expect(ticketRepository.findFirstTicketByUser).toBeCalled();
    });

    it('should return notFound error if room doesnt exists', () => {
      const ticket = fakeTicket(TicketStatus.PAID);
      const TicketType = fakeTicketType(false, true);
      jest.spyOn(ticketRepository, 'findFirstTicketByUser').mockImplementationOnce((): any => {
        return {
          ...ticket,
          TicketType,
        } as Ticket & { TicketType: TicketType };
      });

      jest.spyOn(bookingRepository, 'checkRoom').mockImplementationOnce((): any => {
        return null;
      });

      const promise = bookingService.postBooking(1, 1);

      expect(promise).rejects.toEqual(notFoundError());
      expect(ticketRepository.findFirstTicketByUser).toBeCalled();
    });

    it('should return forbidden error if room is full', () => {
      const ticket = fakeTicket(TicketStatus.PAID);
      const TicketType = fakeTicketType(false, true);
      jest.spyOn(ticketRepository, 'findFirstTicketByUser').mockImplementationOnce((): any => {
        return {
          ...ticket,
          TicketType,
        } as Ticket & { TicketType: TicketType };
      });

      const room = fakeRoom();
      jest.spyOn(bookingRepository, 'checkRoom').mockImplementationOnce((): any => {
        return {
          ...room,
          _count: {
            Booking: room.capacity,
          },
        } as Room & { _count: { Booking: number } };
      });

      const promise = bookingService.postBooking(1, 1);

      expect(promise).rejects.toEqual(forbiddenError());
      expect(ticketRepository.findFirstTicketByUser).toBeCalled();
    });

    it('should create booking', async () => {
      const ticket = fakeTicket(TicketStatus.PAID);
      const TicketType = fakeTicketType(false, true);
      jest.spyOn(ticketRepository, 'findFirstTicketByUser').mockImplementationOnce((): any => {
        return {
          ...ticket,
          TicketType,
        } as Ticket & { TicketType: TicketType };
      });

      const room = fakeRoom();
      jest.spyOn(bookingRepository, 'checkRoom').mockImplementationOnce((): any => {
        return {
          ...room,
          _count: {
            Booking: 0,
          },
        } as Room & { _count: { Booking: number } };
      });

      jest.spyOn(bookingRepository, 'createBooking').mockImplementation((): any => {
        return undefined;
      });

      await bookingService.postBooking(1, 1);

      expect(ticketRepository.findFirstTicketByUser).toBeCalled();
      expect(bookingRepository.checkRoom).toBeCalled();
      expect(bookingRepository.createBooking).toBeCalled();
    });
  });

  describe('updateBooking test', () => {
    it('should return forbidden error if booking doesnt exists', () => {
      jest.spyOn(bookingRepository, 'checkBooking').mockImplementation((): any => {
        return undefined;
      });

      const promise = bookingService.updateBooking(1, 1, 1);
      expect(promise).rejects.toEqual(forbiddenError());
      expect(bookingRepository.checkBooking).toBeCalled();
    });

    it('should return forbidden error if booking isnt from that user', () => {
      const booking = fakeBooking();
      jest.spyOn(bookingRepository, 'checkBooking').mockImplementation((): any => {
        return booking;
      });

      const promise = bookingService.updateBooking(1, 1, 1);
      expect(promise).rejects.toEqual(forbiddenError());
      expect(bookingRepository.checkBooking).toBeCalled();
    });

    it('should return notFound error if room doesnt exists', () => {
      const booking = fakeBooking();
      jest.spyOn(bookingRepository, 'checkBooking').mockImplementation((): any => {
        return booking;
      });

      jest.spyOn(bookingRepository, 'checkRoom').mockImplementation((): any => {
        return undefined;
      });

      const promise = bookingService.updateBooking(1, 1, booking.userId);
      expect(promise).rejects.toEqual(notFoundError());
      expect(bookingRepository.checkBooking).toBeCalled();
    });

    it('should return forbidden error if room is full', () => {
      const booking = fakeBooking();
      jest.spyOn(bookingRepository, 'checkBooking').mockImplementation((): any => {
        return booking;
      });

      const room = fakeRoom();
      jest.spyOn(bookingRepository, 'checkRoom').mockImplementation((): any => {
        return {
          ...room,
          _count: {
            Booking: room.capacity,
          },
        } as Room & { _count: { Booking: number } };
      });

      const promise = bookingService.updateBooking(1, 1, booking.userId);
      expect(promise).rejects.toEqual(forbiddenError());
      expect(bookingRepository.checkBooking).toBeCalled();
    });

    it('should update booking', async () => {
      const booking = fakeBooking();
      jest.spyOn(bookingRepository, 'checkBooking').mockImplementation((): any => {
        return booking;
      });

      const room = fakeRoom();
      jest.spyOn(bookingRepository, 'checkRoom').mockImplementation((): any => {
        return {
          ...room,
          _count: {
            Booking: 0,
          },
        } as Room & { _count: { Booking: number } };
      });

      jest.spyOn(bookingRepository, 'updateBookig').mockImplementation((): any => {
        return undefined;
      });

      const response = await bookingService.updateBooking(booking.id, 1, booking.userId);
      expect(response).toEqual({ bookingId: booking.id });
      expect(bookingRepository.checkBooking).toBeCalled();
      expect(bookingRepository.checkRoom).toBeCalled();
    });
  });
});
