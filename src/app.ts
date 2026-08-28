import express, { Application } from "express";
import cors from "cors";
import { createYoga } from "graphql-yoga";
import { createContext } from "./context";
import { auth } from "./lib/auth";
import { schema } from "./graphql/schema";

const app: Application = express();


const allowedOrigins = [
  process.env.APP_URL,
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); 
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
  })
);


app.options("*", cors());

app.use(express.json());


app.all("/api/auth/*splat", (req, res) => {
  return auth.handler(req as unknown as Request);
});

// GraphQL Yoga Setup
const yoga = createYoga({
  graphqlEndpoint: "/graphql",
  schema,
  context: async (initialContext: any) => {
    return createContext(initialContext.request, initialContext.res);
  },
});

app.use("/graphql", yoga);

app.get("/", (req, res) => {
  res.send("Server is running smoothly!");
});

export default app;