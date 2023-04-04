import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
const prisma = new PrismaClient();
async function main() {
  console.log(`Start seeding ...`);

  // create a book item
  const bookId = uuid();
  await prisma.$transaction([
    prisma.item.create({
      data: { id: bookId, amount: 20, price: 15, itemType: "Book" },
    }),
    prisma.book.create({
      data: { id: bookId, title: "Awesome Book", serialNumber: 122121313 },
    }),
  ]);

  // create a Movie
  const movieId = uuid();
  await prisma.$transaction([
    prisma.item.create({
      data: { id: movieId, amount: 10, price: 45, itemType: "Movie" },
    }),
    prisma.movie.create({
      data: { id: movieId, title: "Awesome Book", director: "John Doe" },
    }),
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log(`done seeding ...`);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
