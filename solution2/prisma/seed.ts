import { PrismaClient } from "@prisma/client";
import { v4 as uuid } from "uuid";
const prisma = new PrismaClient();

export enum ItemTypeEnum {
  Book = "Book",
  Movie = "Movie",
}
async function main() {
  console.log(`Start seeding ...`);

  // create a book item
  const bookId = uuid();
  await prisma.$transaction([
    prisma.book.create({
      data: { id: bookId, title: "Awesome Book", serialNumber: 122121313 },
    }),
    prisma.item.create({
      data: {
        id: uuid(),
        ownerId: bookId,
        itemType: ItemTypeEnum.Book,
        amount: 20,
        price: 15,
      },
    }),
  ]);

  // create a Movie
  const movieId = uuid();
  await prisma.$transaction([
    prisma.item.create({
      data: {
        id: movieId,
        amount: 10,
        price: 45,
        ownerId: movieId,
        itemType: ItemTypeEnum.Movie,
      },
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
