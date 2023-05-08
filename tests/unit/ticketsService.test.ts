import { Enrollment, Ticket, TicketStatus, TicketType } from '@prisma/client';
import { enrollmentFake, fakeTicket, fakeTicketType } from '../factories';
import { notFoundError } from '@/errors';
import ticketRepository from '@/repositories/tickets-repository';
import ticketService from '@/services/tickets-service';

describe('Ticket service test suite', () => {
  describe('getAllTicketsTypes test', () => {
    it('should return tickets types', async () => {
      jest.spyOn(ticketRepository, 'findManyTicketsTypes').mockImplementationOnce((): any => {
        return null;
      });

      await ticketService.getAllTicketsTypes();

      expect(ticketRepository.findManyTicketsTypes).toBeCalled();
    });
  });

  describe('getTicketByUser test', () => {
    it('should return notFound error if ticket doesnt exists', () => {
      jest.spyOn(ticketRepository, 'findFirstTicketByUser').mockImplementation((): any => {
        return null;
      });

      const promise = ticketService.getTicketByUser(1);

      expect(promise).rejects.toEqual(notFoundError());
      expect(ticketRepository.findFirstTicketByUser).toBeCalled();
    });

    it('should return ticket', async () => {
      const ticket = fakeTicket(TicketStatus.PAID);
      const TicketType = fakeTicketType();

      jest.spyOn(ticketRepository, 'findFirstTicketByUser').mockImplementationOnce((): any => {
        return {
          ...ticket,
          TicketType,
        } as Ticket & { TicketType: TicketType };
      });

      const response = await ticketService.getTicketByUser(1);

      expect(response).toEqual({
        ...ticket,
        TicketType,
      } as Ticket & { TicketType: TicketType });
      expect(ticketRepository.findFirstTicketByUser).toBeCalled();
    });
  });

  describe('insertTicket test', () => {
    it('should return notFound error if enrollment doesnt exists', () => {
      jest.spyOn(ticketRepository, 'findEnrollment').mockImplementation((): any => {
        return null;
      });

      const promise = ticketService.insertTicket(1, 1);

      expect(promise).rejects.toEqual(notFoundError());
      expect(ticketRepository.findEnrollment).toBeCalled();
    });

    it('should create ticket', async () => {
      const enrollment = enrollmentFake();

      jest.spyOn(ticketRepository, 'findEnrollment').mockImplementation((): any => {
        return enrollment;
      });

      const ticket = fakeTicket(TicketStatus.PAID);
      const TicketType = fakeTicketType();
      jest.spyOn(ticketRepository, 'createTicket').mockImplementation((): any => {
        return {
          ...ticket,
          TicketType,
        } as Ticket & { TicketType: TicketType };
      });

      const response = await ticketService.insertTicket(1, enrollment.userId);

      expect(response).toEqual({
        ...ticket,
        TicketType,
      } as Ticket & { TicketType: TicketType });
      expect(ticketRepository.findEnrollment).toBeCalled();
      expect(ticketRepository.createTicket).toBeCalled();
    });
  });
});
