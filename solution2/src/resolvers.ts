import { Book, Item, Movie, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define your resolvers
type BookOrMovie = Item & { book: Book | null; movie: Movie | null };
export const resolvers = {
  Query: {
    products: async (
      _parent: any,
      _args: any,
      { db }: { db: PrismaClient }
    ) => {
      /**
       * Entire Items of all types
       */
      const generticItems: Item[] = await db.item.findMany();

      // Limitations of this approach: n+1 problem
      const result = await Promise.all(
        generticItems.map(async (genericItem) => {
          // @ts-ignore
          const specificItem = await db[genericItem.itemType].findFirstOrThrow({
            where: { id: genericItem.ownerId },
          });
          return { ...genericItem, ...specificItem };
        })
      );

      console.log("result: ");
      console.dir(result, { depth: Infinity });

      return result;
    },
  },
  SearchResult: {
    __resolveType: (obj: Item) => {
      if (obj.itemType === "Book") {
        return "Book";
      } else if (obj.itemType === "Movie") {
        return "Movie";
      } else {
        return null;
      }
    },
  },
};
