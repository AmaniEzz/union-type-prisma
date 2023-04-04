import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// Define your schema using SDL
const typeDefs = `#graphql
  schema {
    query: Query
  }

  interface Item {
    id: String!
    price: Int!
    amount: Int!
  }

  type Book implements Item {
    id: String!
    title: String!
    serialNumber: Int
    price: Int!
    amount: Int!
  }

  type Movie implements Item {
    id: String!
    title: String!
    director: String!
    price: Int!
    amount: Int!
  }

  union SearchResult = Book | Movie

  type Query {
    products: [SearchResult!]!
  }
`;
// Define your resolvers
const resolvers = {
    Query: {
        products: async (_parent, _args, { db }) => {
            /**
             * Entire Items of all types
             */
            const itemsOfAnyType = await db.item.findMany();
            // Limitations of this approach: n+1 problem
            const result = await Promise.all(itemsOfAnyType.map(async (item) => {
                const singleItem = await prisma[item.itemType].findUnique({
                    where: { id: item.ownerId },
                });
                if (item.itemType === "Book") {
                    return { ...item, ...singleItem };
                }
                else if (item.itemType === "Movie") {
                    return { ...item, ...singleItem };
                }
                else
                    return null;
            }));
            console.log("result: ");
            console.dir(result, { depth: Infinity });
            return result;
        },
    },
    SearchResult: {
        __resolveType: (obj) => {
            if (obj.itemType === "Book") {
                return "Book";
            }
            else if (obj.itemType === "Movie") {
                return "Movie";
            }
            else {
                return null;
            }
        },
    },
};
// Create an Apollo Server instance with your schema
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async () => ({ db: prisma }),
});
console.log(`🚀  Server ready at: ${url}`);
