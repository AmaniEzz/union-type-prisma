import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { PrismaClient } from "@prisma/client";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";

const prisma = new PrismaClient();

interface MyContext {
  db: PrismaClient;
}

async function main() {
  // Create an Apollo Server instance with your schema
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer<MyContext>(server, {
    listen: { port: 4000 },
    context: async () => ({ db: prisma }),
  });
  return url;
}

main()
  .then(async (url) => {
    console.log(`🚀  Server ready at: ${url}`);
  })
  .catch(async (e) => {
    console.error(e);
  });
