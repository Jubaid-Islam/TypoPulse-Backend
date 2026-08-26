import { createSchema } from "graphql-yoga";

import { authTypeDefs } from "../modules/auth/auth.typeDefs";
import { authResolvers } from "../modules/auth/auth.resolver";

import { gameTypeDefs } from "../modules/game/game.typeDefs";
import { gameResolvers } from "../modules/game/game.resolver";

const baseTypeDefs = `
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`;

const typeDefs = [
  baseTypeDefs,
  authTypeDefs,
  gameTypeDefs,
];

const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...gameResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...gameResolvers.Mutation,
  },
};

export const schema = createSchema({
  typeDefs,
  resolvers,
});