import { Payment, Ticket, TicketStatus, TicketType } from '@prisma/client';
import { response } from 'express';
import { fakeCardData, fakePayment, fakeTicket, fakeTicketType } from '../factories';
import { notFoundError, unauthorizedError } from '@/errors';
import paymentRepository from '@/repositories/payments-repository';
import ticketRepository from '@/repositories/tickets-repository';
import paymentService from '@/services/payments-service';

describe('Payments service test suit', () => {
  describe('findPaymentByTicketId test', () => {
    it('should return notFound error if ticket doesnt exists', () => {
      jest.spyOn(ticketRepository, 'findUniqueTicketById').mockImplementation((): any => {
        return null;
      });

      const promise = paymentService.findPaymentByTicketId(1, 1);
      expect(promise).rejects.toEqual(notFoundError());
      expect(ticketRepository.findUniqueTicketById).toBeCalled();
    });

    it('should return unauthorized error if ticket isnt from that user', () => {
      const ticket = fakeTicket(TicketStatus.PAID);
      const TicketType = fakeTicketType();
      const Enrollment = { userId: 1 };

      jest.spyOn(ticketRepository, 'findUniqueTicketById').mockImplementationOnce((): any => {
        return {
          ...ticket,
          TicketType,
          Enrollment,
        } as Ticket & {
          TicketType: TicketType;
          Enrollment: {
            userId: number;
          };
        };
      });

      const promise = paymentService.findPaymentByTicketId(1, 2);
      expect(promise).rejects.toEqual(unauthorizedError());
      expect(ticketRepository.findUniqueTicketById).toBeCalled();
    });

    it('should return unauthorized error if payment doesnt exists', () => {
      const ticket = fakeTicket(TicketStatus.PAID);
      const TicketType = fakeTicketType();
      const Enrollment = { userId: 1 };

      jest.spyOn(ticketRepository, 'findUniqueTicketById').mockImplementationOnce((): any => {
        return {
          ...ticket,
          TicketType,
          Enrollment,
        } as Ticket & {
          TicketType: TicketType;
          Enrollment: {
            userId: number;
          };
        };
      });

      jest.spyOn(paymentRepository, 'findFirstPaymentByTicketId').mockImplementation((): any => {
        return null;
      });

      const promise = paymentService.findPaymentByTicketId(1, Enrollment.userId);
      expect(promise).rejects.toEqual(unauthorizedError());
      expect(ticketRepository.findUniqueTicketById).toBeCalled();
    });

    it('should return payment', async () => {
      const ticket = fakeTicket(TicketStatus.PAID);
      const TicketType = fakeTicketType();
      const Enrollment = { userId: 1 };

      jest.spyOn(ticketRepository, 'findUniqueTicketById').mockImplementationOnce((): any => {
        return {
          ...ticket,
          TicketType,
          Enrollment,
        } as Ticket & {
          TicketType: TicketType;
          Enrollment: {
            userId: number;
          };
        };
      });

      const payment = fakePayment();
      jest.spyOn(paymentRepository, 'findFirstPaymentByTicketId').mockImplementation((): any => {
        return payment;
      });

      const response = await paymentService.findPaymentByTicketId(ticket.id, Enrollment.userId);
      expect(response).toEqual(payment);
      expect(ticketRepository.findUniqueTicketById).toBeCalled();
      expect(paymentRepository.findFirstPaymentByTicketId).toBeCalled();
    });
  });

  describe('createPayment test', () => {
    it('should return notFound error if ticket doesnt exists', () => {
      const cardData = fakeCardData();
      jest.spyOn(ticketRepository, 'findUniqueTicketById').mockImplementation((): any => {
        return null;
      });

      const promise = paymentService.createPayment(1, cardData, 1);
      expect(promise).rejects.toEqual(notFoundError());
      expect(ticketRepository.findUniqueTicketById).toBeCalled();
    });

    it('should return unauthorized error if ticket isnt from that user', () => {
      const ticket = fakeTicket(TicketStatus.PAID);
      const TicketType = fakeTicketType();
      const Enrollment = { userId: 1 };
      const cardData = fakeCardData();

      jest.spyOn(ticketRepository, 'findUniqueTicketById').mockImplementationOnce((): any => {
        return {
          ...ticket,
          TicketType,
          Enrollment,
        } as Ticket & {
          TicketType: TicketType;
          Enrollment: {
            userId: number;
          };
        };
      });

      const promise = paymentService.createPayment(1, cardData, 2);
      expect(promise).rejects.toEqual(unauthorizedError());
      expect(ticketRepository.findUniqueTicketById).toBeCalled();
    });

    it('should create payment', async () => {
      const ticket = fakeTicket(TicketStatus.PAID);
      const TicketType = fakeTicketType();
      const Enrollment = { userId: 1 };
      const cardData = fakeCardData();

      jest.spyOn(ticketRepository, 'findUniqueTicketById').mockImplementationOnce((): any => {
        return {
          ...ticket,
          TicketType,
          Enrollment,
        } as Ticket & {
          TicketType: TicketType;
          Enrollment: {
            userId: number;
          };
        };
      });

      const payment = fakePayment();
      jest.spyOn(paymentRepository, 'createPayment').mockImplementation((): any => {
        return payment;
      });

      const response = await paymentService.createPayment(ticket.id, cardData, Enrollment.userId);
      expect(response).toEqual(payment);
      expect(ticketRepository.findUniqueTicketById).toBeCalled();
      expect(paymentRepository.createPayment).toBeCalled();
    });
  });
});
