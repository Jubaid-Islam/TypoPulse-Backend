import express, { Application } from "express";
import cors from "cors";
import { createYoga } from "graphql-yoga";
import { createContext } from "./context.js";
import { auth } from "./lib/auth.js";
import { schema } from "./graphql/schema.js";
const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.all("/api/auth/*splat", (req) => auth.handler(req as unknown as Request));
app.use(express.json());

const yoga = createYoga({
  graphqlEndpoint: "/graphql",
  schema,
  context: async (initialContext: any) => {
    return createContext(initialContext.request, initialContext.res);
  },
});

app.use(yoga.graphqlEndpoint, yoga);

app.get("/", (req, res) => {
  res.send("Server is running smoothly!");
});

export default app;