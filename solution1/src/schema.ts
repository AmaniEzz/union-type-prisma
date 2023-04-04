// Define your schema using SDL
export const typeDefs = `#graphql
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
