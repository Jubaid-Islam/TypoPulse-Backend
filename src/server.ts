import app from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  prisma
    .$connect()
    .then(() => {
      console.log("Connected to database");
      app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
      });
    })
    .catch(async (error) => {
      console.error("An error occurred", error);
      await prisma.$disconnect();
      process.exit(1);
    });
}

export default app;