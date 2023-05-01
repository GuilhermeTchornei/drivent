import supertest from 'supertest';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import { TicketStatus } from '@prisma/client';
import {
  createEnrollmentWithAddress,
  createHotelWithRooms,
  createTicket,
  createTicketType,
  createUser,
} from '../factories';
import { createBooking, findBookingById } from '../factories/booking-factory';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 if user hasnt a booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.statusCode).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 200 and return booking id with room', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms();
      const room = hotel.Rooms[0];
      await createBooking(user.id, room.id);

      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(response.statusCode).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(Number),
        Room: {
          id: room.id,
          capacity: room.capacity,
          hotelId: room.hotelId,
          name: room.name,
          createdAt: room.createdAt.toJSON(),
          updatedAt: room.updatedAt.toJSON(),
        },
      });
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 if room doesnt exists', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelWithRooms();
      const room = hotel.Rooms[hotel.Rooms.length - 1];

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: room.id + 1 });
      expect(response.statusCode).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 if body is wrong', async () => {
      const token = await generateValidToken();

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: 0 });
      expect(response.statusCode).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if ticket isnt paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: hotel.Rooms[0].id });
      expect(response.statusCode).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if ticket is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: hotel.Rooms[0].id });
      expect(response.statusCode).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if ticket doesnt include hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, false);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: hotel.Rooms[0].id });
      expect(response.statusCode).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if room is full', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms();
      const room = hotel.Rooms[0];
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      for (let i = 0; i < room.capacity; i++) await createBooking(user.id, room.id);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(response.statusCode).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and return booking id', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotelWithRooms();
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: hotel.Rooms[0].id });
      expect(response.statusCode).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: expect.any(Number),
      });
    });
  });
});

describe('PUT /booking/:bookingId', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.post('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 if room doesnt exists', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelWithRooms();
      const room = hotel.Rooms[hotel.Rooms.length - 1];
      const booking = await createBooking(user.id, room.id);

      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: room.id + 1 });
      expect(response.statusCode).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 403 if booking doesnt exists', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelWithRooms();
      const room = hotel.Rooms[hotel.Rooms.length - 1];
      const booking = await createBooking(user.id, room.id);

      const response = await server
        .put(`/booking/${booking.id + 1}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: room.id + 1 });
      expect(response.statusCode).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if body is wrong', async () => {
      const token = await generateValidToken();

      const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`).send({ roomId: 0 });
      expect(response.statusCode).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if param is wrong', async () => {
      const token = await generateValidToken();

      const response = await server.put(`/booking/0`).set('Authorization', `Bearer ${token}`).send({ roomId: 1 });
      expect(response.statusCode).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if room is full', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelWithRooms();
      const room = hotel.Rooms[0];
      const newRoom = hotel.Rooms[1];
      const booking = await createBooking(user.id, room.id);
      for (let i = 0; i < newRoom.capacity; i++) await createBooking(user.id, newRoom.id);

      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: newRoom.id });
      expect(response.statusCode).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if bookingId is from another user', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelWithRooms();
      const room = hotel.Rooms[0];
      const newRoom = hotel.Rooms[1];
      const anotherUser = await createUser();
      const booking = await createBooking(anotherUser.id, room.id);

      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: newRoom.id });
      expect(response.statusCode).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 200 and return bookingId', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelWithRooms();
      const room = hotel.Rooms[0];
      const newRoom = hotel.Rooms[1];
      const booking = await createBooking(user.id, room.id);

      const response = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: newRoom.id });
      expect(response.statusCode).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: booking.id,
      });
      const checkBooking = await findBookingById(booking.id);
      expect(checkBooking.roomId).toEqual(newRoom.id);
    });
  });
});
