import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function test() {
  console.log(Object.keys(db));
  await db.$disconnect();
}
test();
