import faker from '@faker-js/faker';
import { Payment } from '@prisma/client';
import { prisma } from '@/config';
import {} from '@brazilian-utils/brazilian-utils';
import { CardData } from '@/protocols';

export function fakePayment() {
  return {
    id: faker.datatype.number(),
    cardIssuer: faker.name.findName(),
    cardLastDigits: faker.datatype.number({ min: 1000, max: 9999 }).toString(),
    ticketId: faker.datatype.number(),
    value: faker.datatype.number(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
  } as Payment;
}

export function fakeCardData() {
  return {
    issuer: faker.name.findName(),
    number: faker.datatype.number({ min: 100000000000000, max: 999999999999999 }),
    name: faker.name.findName(),
    expirationDate: faker.date.recent(),
    cvv: faker.datatype.number({ min: 100, max: 999 }),
  } as CardData;
}

export async function createPayment(ticketId: number, value: number) {
  return prisma.payment.create({
    data: {
      ticketId,
      value,
      cardIssuer: faker.name.findName(),
      cardLastDigits: faker.datatype.number({ min: 1000, max: 9999 }).toString(),
    },
  });
}

export function generateCreditCardData() {
  const futureDate = faker.date.future();

  return {
    issuer: faker.name.findName(),
    number: faker.datatype.number({ min: 100000000000000, max: 999999999999999 }).toString(),
    name: faker.name.findName(),
    expirationDate: `${futureDate.getMonth() + 1}/${futureDate.getFullYear()}`,
    cvv: faker.datatype.number({ min: 100, max: 999 }).toString(),
  };
}
