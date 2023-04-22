import supertest from 'supertest';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import { Hotel, Room, TicketStatus } from '@prisma/client';
import {
  createEnrollmentWithAddress,
  createTicket,
  createTicketType,
  createUser,
  createHotelWithRooms,
  createHotelWithoutRooms,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/payments');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/payments').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/payments').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with 404 if none hotel exists', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const token = await generateValidToken(user);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with 404 if ticket doesnt exists', async () => {
      await createHotelWithRooms();
      await createEnrollmentWithAddress();
      const token = await generateValidToken();

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with 404 if enrollment doesnt exists', async () => {
      await createHotelWithRooms();
      const token = await generateValidToken();

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with 402 if ticket isnt paid', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      await createHotelWithRooms();

      const token = await generateValidToken(user);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with 402 if ticketType is remote', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotelWithRooms();

      const token = await generateValidToken(user);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with 402 if ticketType dont includes hotel', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, false);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotelWithRooms();

      const token = await generateValidToken(user);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with 200 and return hotels list', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotelWithRooms();

      const token = await generateValidToken(user);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([
          {
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          } as Hotel,
        ]),
      );
    });
  });
});

describe('GET hotels/:hotelId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/payments');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/payments').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/payments').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with 404 if hotel doesnt exists', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const token = await generateValidToken(user);

      const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should repond with 400 if hotelId isnt a number', async () => {
      const token = await generateValidToken();
      const response = await server.get('/hotels/a').set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with 404 if ticket doesnt exists', async () => {
      const { id } = await createHotelWithRooms();
      await createEnrollmentWithAddress();
      const token = await generateValidToken();

      const response = await server.get(`/hotels/${id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with 404 if enrollment doesnt exists', async () => {
      const { id } = await createHotelWithRooms();
      const token = await generateValidToken();

      const response = await server.get(`/hotels/${id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with 402 if ticket isnt paid', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const { id } = await createHotelWithRooms();

      const token = await generateValidToken(user);

      const response = await server.get(`/hotels/${id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with 402 if ticketType is remote', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const { id } = await createHotelWithRooms();

      const token = await generateValidToken(user);

      const response = await server.get(`/hotels/${id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with 402 if ticketType dont includes hotel', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, false);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const { id } = await createHotelWithRooms();

      const token = await generateValidToken(user);

      const response = await server.get(`/hotels/${id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with 404 if hotel hasnt rooms', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const { id } = await createHotelWithoutRooms();

      const token = await generateValidToken(user);

      const response = await server.get(`/hotels/${id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with 200 and return hotel and his rooms', async () => {
      const user = await createUser();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const { id } = await createHotelWithRooms();

      const token = await generateValidToken(user);

      const response = await server.get(`/hotels/${id}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        Rooms: expect.arrayContaining([
          {
            id: expect.any(Number),
            name: expect.any(String),
            capacity: expect.any(Number),
            hotelId: expect.any(Number),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        ]),
      } as Hotel & { Rooms: Room[] });
    });
  });
});
