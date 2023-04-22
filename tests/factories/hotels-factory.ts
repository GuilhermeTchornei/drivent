import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotelWithRooms() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.business(),
      Rooms: {
        createMany: {
          data: {
            name: faker.name.findName(),
            capacity: parseInt(faker.random.numeric(2)),
          },
        },
      },
    },
    select: {
      id: true,
    },
  });
}

export async function createHotelWithoutRooms() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.business(),
    },
    select: {
      id: true,
    },
  });
}
