import { Book, Item, Movie, PrismaClient } from "@prisma/client";

// Define your resolvers
type BookOrMovie = Item & { book: Book | null; movie: Movie | null };
export const resolvers = {
  Query: {
    products: async (
      _parent: any,
      _args: any,
      { db }: { db: PrismaClient }
    ) => {
      const items: BookOrMovie[] = await db.item.findMany({
        include: { book: true, movie: true },
      });

      const results = items.map((item) => {
        return { ...item, ...item?.book, ...item?.movie };
      });

      return results;
    },
  },
  SearchResult: {
    __resolveType: (obj: BookOrMovie) => {
      if (obj.book) {
        return "Book";
      } else if (obj.movie) {
        return "Movie";
      } else {
        return null;
      }
    },
  },
};
