// src/lib/__mocks__/prisma.ts
import { mock } from "bun:test";

function createModelMock() {
  return {
    findUnique: mock(),
    findFirst: mock(),
    findMany: mock(),
    create: mock(),
    update: mock(),
    delete: mock(),
  };
}

export const prismaMock = {
  user: createModelMock(),
  gameResult: createModelMock(),
  $queryRaw: mock(),
  $connect: mock(),
  $disconnect: mock(),
};

export function resetPrismaMock() {
  Object.values(prismaMock.user).forEach((fn: any) => fn.mockReset?.());
  Object.values(prismaMock.gameResult).forEach((fn: any) => fn.mockReset?.());
  prismaMock.$queryRaw.mockReset();
}