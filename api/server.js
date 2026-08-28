// src/app.ts
import express from "express";
import cors from "cors";
import { createYoga } from "graphql-yoga";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.9.1",
  "engineVersion": "e922089b7d7502aff4249d5da3420f6fa55fc6ad",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel GameResult {\n  id                String   @id @default(uuid())\n  userId            String\n  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  totalTimeMs       Int\n  penaltyMs         Int\n  rawTimeMs         Int\n  correctChars      Int\n  wrongAttempts     Int\n  accuracy          Float\n  wpmTimeline       Float[]\n  characterTimeline Int[]\n  createdAt         DateTime @default(now())\n\n  @@index([userId])\n  @@index([totalTimeMs])\n  @@index([createdAt])\n}\n\nmodel User {\n  id            String       @id\n  name          String\n  email         String\n  emailVerified Boolean      @default(false)\n  image         String?\n  createdAt     DateTime     @default(now())\n  updatedAt     DateTime     @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n  gameResults   GameResult[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  issuer                String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"GameResult":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"GameResultToUser"},{"name":"totalTimeMs","kind":"scalar","type":"Int"},{"name":"penaltyMs","kind":"scalar","type":"Int"},{"name":"rawTimeMs","kind":"scalar","type":"Int"},{"name":"correctChars","kind":"scalar","type":"Int"},{"name":"wrongAttempts","kind":"scalar","type":"Int"},{"name":"accuracy","kind":"scalar","type":"Float"},{"name":"wpmTimeline","kind":"scalar","type":"Float"},{"name":"characterTimeline","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"gameResults","kind":"object","type":"GameResult","relationName":"GameResultToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"issuer","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","gameResults","_count","GameResult.findUnique","GameResult.findUniqueOrThrow","GameResult.findFirst","GameResult.findFirstOrThrow","GameResult.findMany","data","GameResult.createOne","GameResult.createMany","GameResult.createManyAndReturn","GameResult.updateOne","GameResult.updateMany","GameResult.updateManyAndReturn","create","update","GameResult.upsertOne","GameResult.deleteOne","GameResult.deleteMany","having","_avg","_sum","_min","_max","GameResult.groupBy","GameResult.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","AND","OR","NOT","id","identifier","value","expiresAt","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","accountId","providerId","userId","accessToken","refreshToken","idToken","issuer","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","name","email","emailVerified","image","every","some","none","totalTimeMs","penaltyMs","rawTimeMs","correctChars","wrongAttempts","accuracy","wpmTimeline","characterTimeline","has","hasEvery","hasSome","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","push","increment","decrement","multiply","divide"]'),
  graph: "kwIsUA8DAACtAQAgYAAAqgEAMGEAAAsAEGIAAKoBADBjAQAAAAFnQACOAQAhdgEAjQEAIYkBAgCrAQAhigECAKsBACGLAQIAqwEAIYwBAgCrAQAhjQECAKsBACGOAQgArAEAIY8BAAClAQAgkAEAAKYBACABAAAAAQAgDAMAAK0BACBgAACwAQAwYQAAAwAQYgAAsAEAMGMBAI0BACFmQACOAQAhZ0AAjgEAIWhAAI4BACF2AQCNAQAhfwEAjQEAIYABAQCeAQAhgQEBAJ4BACEDAwAAgQIAIIABAAC2AQAggQEAALYBACAMAwAArQEAIGAAALABADBhAAADABBiAACwAQAwYwEAAAABZkAAjgEAIWdAAI4BACFoQACOAQAhdgEAjQEAIX8BAAAAAYABAQCeAQAhgQEBAJ4BACEDAAAAAwAgAQAABAAwAgAABQAgEgMAAK0BACBgAACuAQAwYQAABwAQYgAArgEAMGMBAI0BACFnQACOAQAhaEAAjgEAIXQBAI0BACF1AQCNAQAhdgEAjQEAIXcBAJ4BACF4AQCeAQAheQEAngEAIXoBAJ4BACF7QACvAQAhfEAArwEAIX0BAJ4BACF-AQCeAQAhCQMAAIECACB3AAC2AQAgeAAAtgEAIHkAALYBACB6AAC2AQAgewAAtgEAIHwAALYBACB9AAC2AQAgfgAAtgEAIBIDAACtAQAgYAAArgEAMGEAAAcAEGIAAK4BADBjAQAAAAFnQACOAQAhaEAAjgEAIXQBAI0BACF1AQCNAQAhdgEAjQEAIXcBAJ4BACF4AQCeAQAheQEAngEAIXoBAJ4BACF7QACvAQAhfEAArwEAIX0BAJ4BACF-AQCeAQAhAwAAAAcAIAEAAAgAMAIAAAkAIA8DAACtAQAgYAAAqgEAMGEAAAsAEGIAAKoBADBjAQCNAQAhZ0AAjgEAIXYBAI0BACGJAQIAqwEAIYoBAgCrAQAhiwECAKsBACGMAQIAqwEAIY0BAgCrAQAhjgEIAKwBACGPAQAApQEAIJABAACmAQAgAQMAAIECACADAAAACwAgAQAADAAwAgAAAQAgAQAAAAMAIAEAAAAHACABAAAACwAgAQAAAAEAIAMAAAALACABAAAMADACAAABACADAAAACwAgAQAADAAwAgAAAQAgAwAAAAsAIAEAAAwAMAIAAAEAIAwDAACAAgAgYwEAAAABZ0AAAAABdgEAAAABiQECAAAAAYoBAgAAAAGLAQIAAAABjAECAAAAAY0BAgAAAAGOAQgAAAABjwEAANoBACCQAQAA2wEAIAENAAAVACALYwEAAAABZ0AAAAABdgEAAAABiQECAAAAAYoBAgAAAAGLAQIAAAABjAECAAAAAY0BAgAAAAGOAQgAAAABjwEAANoBACCQAQAA2wEAIAENAAAXADABDQAAFwAwDAMAAP8BACBjAQC0AQAhZ0AAtQEAIXYBALQBACGJAQIA1AEAIYoBAgDUAQAhiwECANQBACGMAQIA1AEAIY0BAgDUAQAhjgEIANUBACGPAQAA1gEAIJABAADXAQAgAgAAAAEAIA0AABoAIAtjAQC0AQAhZ0AAtQEAIXYBALQBACGJAQIA1AEAIYoBAgDUAQAhiwECANQBACGMAQIA1AEAIY0BAgDUAQAhjgEIANUBACGPAQAA1gEAIJABAADXAQAgAgAAAAsAIA0AABwAIAIAAAALACANAAAcACADAAAAAQAgFAAAFQAgFQAAGgAgAQAAAAEAIAEAAAALACAFBwAA-gEAIBoAAPsBACAbAAD-AQAgHAAA_QEAIB0AAPwBACAOYAAAogEAMGEAACMAEGIAAKIBADBjAQCFAQAhZ0AAhgEAIXYBAIUBACGJAQIAowEAIYoBAgCjAQAhiwECAKMBACGMAQIAowEAIY0BAgCjAQAhjgEIAKQBACGPAQAApQEAIJABAACmAQAgAwAAAAsAIAEAACIAMBkAACMAIAMAAAALACABAAAMADACAAABACANBAAAnwEAIAUAAKABACAGAAChAQAgYAAAnAEAMGEAACkAEGIAAJwBADBjAQAAAAFnQACOAQAhaEAAjgEAIYIBAQCNAQAhgwEBAAAAAYQBIACdAQAhhQEBAJ4BACEBAAAAJgAgAQAAACYAIA0EAACfAQAgBQAAoAEAIAYAAKEBACBgAACcAQAwYQAAKQAQYgAAnAEAMGMBAI0BACFnQACOAQAhaEAAjgEAIYIBAQCNAQAhgwEBAI0BACGEASAAnQEAIYUBAQCeAQAhBAQAAPcBACAFAAD4AQAgBgAA-QEAIIUBAAC2AQAgAwAAACkAIAEAACoAMAIAACYAIAMAAAApACABAAAqADACAAAmACADAAAAKQAgAQAAKgAwAgAAJgAgCgQAAPQBACAFAAD1AQAgBgAA9gEAIGMBAAAAAWdAAAAAAWhAAAAAAYIBAQAAAAGDAQEAAAABhAEgAAAAAYUBAQAAAAEBDQAALgAgB2MBAAAAAWdAAAAAAWhAAAAAAYIBAQAAAAGDAQEAAAABhAEgAAAAAYUBAQAAAAEBDQAAMAAwAQ0AADAAMAoEAADHAQAgBQAAyAEAIAYAAMkBACBjAQC0AQAhZ0AAtQEAIWhAALUBACGCAQEAtAEAIYMBAQC0AQAhhAEgAMYBACGFAQEAugEAIQIAAAAmACANAAAzACAHYwEAtAEAIWdAALUBACFoQAC1AQAhggEBALQBACGDAQEAtAEAIYQBIADGAQAhhQEBALoBACECAAAAKQAgDQAANQAgAgAAACkAIA0AADUAIAMAAAAmACAUAAAuACAVAAAzACABAAAAJgAgAQAAACkAIAQHAADDAQAgHAAAxQEAIB0AAMQBACCFAQAAtgEAIApgAACYAQAwYQAAPAAQYgAAmAEAMGMBAIUBACFnQACGAQAhaEAAhgEAIYIBAQCFAQAhgwEBAIUBACGEASAAmQEAIYUBAQCQAQAhAwAAACkAIAEAADsAMBkAADwAIAMAAAApACABAAAqADACAAAmACABAAAABQAgAQAAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAkDAADCAQAgYwEAAAABZkAAAAABZ0AAAAABaEAAAAABdgEAAAABfwEAAAABgAEBAAAAAYEBAQAAAAEBDQAARAAgCGMBAAAAAWZAAAAAAWdAAAAAAWhAAAAAAXYBAAAAAX8BAAAAAYABAQAAAAGBAQEAAAABAQ0AAEYAMAENAABGADAJAwAAwQEAIGMBALQBACFmQAC1AQAhZ0AAtQEAIWhAALUBACF2AQC0AQAhfwEAtAEAIYABAQC6AQAhgQEBALoBACECAAAABQAgDQAASQAgCGMBALQBACFmQAC1AQAhZ0AAtQEAIWhAALUBACF2AQC0AQAhfwEAtAEAIYABAQC6AQAhgQEBALoBACECAAAAAwAgDQAASwAgAgAAAAMAIA0AAEsAIAMAAAAFACAUAABEACAVAABJACABAAAABQAgAQAAAAMAIAUHAAC-AQAgHAAAwAEAIB0AAL8BACCAAQAAtgEAIIEBAAC2AQAgC2AAAJcBADBhAABSABBiAACXAQAwYwEAhQEAIWZAAIYBACFnQACGAQAhaEAAhgEAIXYBAIUBACF_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_AQCFAQAhgAEBAJABACGBAQEAkAEAIQpgAACYAQAwYQAAPAAQYgAAmAEAMGMBAIUBACFnQACGAQAhaEAAhgEAIYIBAQCFAQAhgwEBAIUBACGEASAAmQEAIYUBAQCQAQAhBQcAAIgBACAcAACbAQAgHQAAmwEAIGkgAAAAAXAgAJoBACEFBwAAiAEAIBwAAJsBACAdAACbAQAgaSAAAAABcCAAmgEAIQJpIAAAAAFwIACbAQAhDQQAAJ8BACAFAACgAQAgBgAAoQEAIGAAAJwBADBhAAApABBiAACcAQAwYwEAjQEAIWdAAI4BACFoQACOAQAhggEBAI0BACGDAQEAjQEAIYQBIACdAQAhhQEBAJ4BACECaSAAAAABcCAAmwEAIQtpAQAAAAFqAQAAAAVrAQAAAAVsAQAAAAFtAQAAAAFuAQAAAAFvAQAAAAFwAQCWAQAhcQEAAAABcgEAAAABcwEAAAABA4YBAAADACCHAQAAAwAgiAEAAAMAIAOGAQAABwAghwEAAAcAIIgBAAAHACADhgEAAAsAIIcBAAALACCIAQAACwAgDmAAAKIBADBhAAAjABBiAACiAQAwYwEAhQEAIWdAAIYBACF2AQCFAQAhiQECAKMBACGKAQIAowEAIYsBAgCjAQAhjAECAKMBACGNAQIAowEAIY4BCACkAQAhjwEAAKUBACCQAQAApgEAIA0HAACIAQAgGgAAqAEAIBsAAIgBACAcAACIAQAgHQAAiAEAIGkCAAAAAWoCAAAABGsCAAAABGwCAAAAAW0CAAAAAW4CAAAAAW8CAAAAAXACAKkBACENBwAAiAEAIBoAAKgBACAbAACoAQAgHAAAqAEAIB0AAKgBACBpCAAAAAFqCAAAAARrCAAAAARsCAAAAAFtCAAAAAFuCAAAAAFvCAAAAAFwCACnAQAhBGkIAAAABZEBCAAAAAGSAQgAAAAEkwEIAAAABARpAgAAAAWRAQIAAAABkgECAAAABJMBAgAAAAQNBwAAiAEAIBoAAKgBACAbAACoAQAgHAAAqAEAIB0AAKgBACBpCAAAAAFqCAAAAARrCAAAAARsCAAAAAFtCAAAAAFuCAAAAAFvCAAAAAFwCACnAQAhCGkIAAAAAWoIAAAABGsIAAAABGwIAAAAAW0IAAAAAW4IAAAAAW8IAAAAAXAIAKgBACENBwAAiAEAIBoAAKgBACAbAACIAQAgHAAAiAEAIB0AAIgBACBpAgAAAAFqAgAAAARrAgAAAARsAgAAAAFtAgAAAAFuAgAAAAFvAgAAAAFwAgCpAQAhDwMAAK0BACBgAACqAQAwYQAACwAQYgAAqgEAMGMBAI0BACFnQACOAQAhdgEAjQEAIYkBAgCrAQAhigECAKsBACGLAQIAqwEAIYwBAgCrAQAhjQECAKsBACGOAQgArAEAIY8BAAClAQAgkAEAAKYBACAIaQIAAAABagIAAAAEawIAAAAEbAIAAAABbQIAAAABbgIAAAABbwIAAAABcAIAiAEAIQhpCAAAAAFqCAAAAARrCAAAAARsCAAAAAFtCAAAAAFuCAAAAAFvCAAAAAFwCACoAQAhDwQAAJ8BACAFAACgAQAgBgAAoQEAIGAAAJwBADBhAAApABBiAACcAQAwYwEAjQEAIWdAAI4BACFoQACOAQAhggEBAI0BACGDAQEAjQEAIYQBIACdAQAhhQEBAJ4BACGUAQAAKQAglQEAACkAIBIDAACtAQAgYAAArgEAMGEAAAcAEGIAAK4BADBjAQCNAQAhZ0AAjgEAIWhAAI4BACF0AQCNAQAhdQEAjQEAIXYBAI0BACF3AQCeAQAheAEAngEAIXkBAJ4BACF6AQCeAQAhe0AArwEAIXxAAK8BACF9AQCeAQAhfgEAngEAIQhpQAAAAAFqQAAAAAVrQAAAAAVsQAAAAAFtQAAAAAFuQAAAAAFvQAAAAAFwQACUAQAhDAMAAK0BACBgAACwAQAwYQAAAwAQYgAAsAEAMGMBAI0BACFmQACOAQAhZ0AAjgEAIWhAAI4BACF2AQCNAQAhfwEAjQEAIYABAQCeAQAhgQEBAJ4BACEAAAABmQEBAAAAAQGZAUAAAAABAAAAAAGZAQEAAAABAZkBQAAAAAEFFAAAjwIAIBUAAJICACCWAQAAkAIAIJcBAACRAgAgnAEAACYAIAMUAACPAgAglgEAAJACACCcAQAAJgAgAAAABRQAAIoCACAVAACNAgAglgEAAIsCACCXAQAAjAIAIJwBAAAmACADFAAAigIAIJYBAACLAgAgnAEAACYAIAAAAAGZASAAAAABCxQAAOgBADAVAADtAQAwlgEAAOkBADCXAQAA6gEAMJgBAADrAQAgmQEAAOwBADCaAQAA7AEAMJsBAADsAQAwnAEAAOwBADCdAQAA7gEAMJ4BAADvAQAwCxQAANwBADAVAADhAQAwlgEAAN0BADCXAQAA3gEAMJgBAADfAQAgmQEAAOABADCaAQAA4AEAMJsBAADgAQAwnAEAAOABADCdAQAA4gEAMJ4BAADjAQAwCxQAAMoBADAVAADPAQAwlgEAAMsBADCXAQAAzAEAMJgBAADNAQAgmQEAAM4BADCaAQAAzgEAMJsBAADOAQAwnAEAAM4BADCdAQAA0AEAMJ4BAADRAQAwCmMBAAAAAWdAAAAAAYkBAgAAAAGKAQIAAAABiwECAAAAAYwBAgAAAAGNAQIAAAABjgEIAAAAAY8BAADaAQAgkAEAANsBACACAAAAAQAgFAAA2QEAIAMAAAABACAUAADZAQAgFQAA2AEAIAENAACJAgAwDwMAAK0BACBgAACqAQAwYQAACwAQYgAAqgEAMGMBAAAAAWdAAI4BACF2AQCNAQAhiQECAKsBACGKAQIAqwEAIYsBAgCrAQAhjAECAKsBACGNAQIAqwEAIY4BCACsAQAhjwEAAKUBACCQAQAApgEAIAIAAAABACANAADYAQAgAgAAANIBACANAADTAQAgDmAAANEBADBhAADSAQAQYgAA0QEAMGMBAI0BACFnQACOAQAhdgEAjQEAIYkBAgCrAQAhigECAKsBACGLAQIAqwEAIYwBAgCrAQAhjQECAKsBACGOAQgArAEAIY8BAAClAQAgkAEAAKYBACAOYAAA0QEAMGEAANIBABBiAADRAQAwYwEAjQEAIWdAAI4BACF2AQCNAQAhiQECAKsBACGKAQIAqwEAIYsBAgCrAQAhjAECAKsBACGNAQIAqwEAIY4BCACsAQAhjwEAAKUBACCQAQAApgEAIApjAQC0AQAhZ0AAtQEAIYkBAgDUAQAhigECANQBACGLAQIA1AEAIYwBAgDUAQAhjQECANQBACGOAQgA1QEAIY8BAADWAQAgkAEAANcBACAFmQECAAAAAaABAgAAAAGhAQIAAAABogECAAAAAaMBAgAAAAEFmQEIAAAAAaABCAAAAAGhAQgAAAABogEIAAAAAaMBCAAAAAECmQEIAAAABJ8BCAAAAAUCmQECAAAABJ8BAgAAAAUKYwEAtAEAIWdAALUBACGJAQIA1AEAIYoBAgDUAQAhiwECANQBACGMAQIA1AEAIY0BAgDUAQAhjgEIANUBACGPAQAA1gEAIJABAADXAQAgCmMBAAAAAWdAAAAAAYkBAgAAAAGKAQIAAAABiwECAAAAAYwBAgAAAAGNAQIAAAABjgEIAAAAAY8BAADaAQAgkAEAANsBACABmQEIAAAABAGZAQIAAAAEDWMBAAAAAWdAAAAAAWhAAAAAAXQBAAAAAXUBAAAAAXcBAAAAAXgBAAAAAXkBAAAAAXoBAAAAAXtAAAAAAXxAAAAAAX0BAAAAAX4BAAAAAQIAAAAJACAUAADnAQAgAwAAAAkAIBQAAOcBACAVAADmAQAgAQ0AAIgCADASAwAArQEAIGAAAK4BADBhAAAHABBiAACuAQAwYwEAAAABZ0AAjgEAIWhAAI4BACF0AQCNAQAhdQEAjQEAIXYBAI0BACF3AQCeAQAheAEAngEAIXkBAJ4BACF6AQCeAQAhe0AArwEAIXxAAK8BACF9AQCeAQAhfgEAngEAIQIAAAAJACANAADmAQAgAgAAAOQBACANAADlAQAgEWAAAOMBADBhAADkAQAQYgAA4wEAMGMBAI0BACFnQACOAQAhaEAAjgEAIXQBAI0BACF1AQCNAQAhdgEAjQEAIXcBAJ4BACF4AQCeAQAheQEAngEAIXoBAJ4BACF7QACvAQAhfEAArwEAIX0BAJ4BACF-AQCeAQAhEWAAAOMBADBhAADkAQAQYgAA4wEAMGMBAI0BACFnQACOAQAhaEAAjgEAIXQBAI0BACF1AQCNAQAhdgEAjQEAIXcBAJ4BACF4AQCeAQAheQEAngEAIXoBAJ4BACF7QACvAQAhfEAArwEAIX0BAJ4BACF-AQCeAQAhDWMBALQBACFnQAC1AQAhaEAAtQEAIXQBALQBACF1AQC0AQAhdwEAugEAIXgBALoBACF5AQC6AQAhegEAugEAIXtAALsBACF8QAC7AQAhfQEAugEAIX4BALoBACENYwEAtAEAIWdAALUBACFoQAC1AQAhdAEAtAEAIXUBALQBACF3AQC6AQAheAEAugEAIXkBALoBACF6AQC6AQAhe0AAuwEAIXxAALsBACF9AQC6AQAhfgEAugEAIQ1jAQAAAAFnQAAAAAFoQAAAAAF0AQAAAAF1AQAAAAF3AQAAAAF4AQAAAAF5AQAAAAF6AQAAAAF7QAAAAAF8QAAAAAF9AQAAAAF-AQAAAAEHYwEAAAABZkAAAAABZ0AAAAABaEAAAAABfwEAAAABgAEBAAAAAYEBAQAAAAECAAAABQAgFAAA8wEAIAMAAAAFACAUAADzAQAgFQAA8gEAIAENAACHAgAwDAMAAK0BACBgAACwAQAwYQAAAwAQYgAAsAEAMGMBAAAAAWZAAI4BACFnQACOAQAhaEAAjgEAIXYBAI0BACF_AQAAAAGAAQEAngEAIYEBAQCeAQAhAgAAAAUAIA0AAPIBACACAAAA8AEAIA0AAPEBACALYAAA7wEAMGEAAPABABBiAADvAQAwYwEAjQEAIWZAAI4BACFnQACOAQAhaEAAjgEAIXYBAI0BACF_AQCNAQAhgAEBAJ4BACGBAQEAngEAIQtgAADvAQAwYQAA8AEAEGIAAO8BADBjAQCNAQAhZkAAjgEAIWdAAI4BACFoQACOAQAhdgEAjQEAIX8BAI0BACGAAQEAngEAIYEBAQCeAQAhB2MBALQBACFmQAC1AQAhZ0AAtQEAIWhAALUBACF_AQC0AQAhgAEBALoBACGBAQEAugEAIQdjAQC0AQAhZkAAtQEAIWdAALUBACFoQAC1AQAhfwEAtAEAIYABAQC6AQAhgQEBALoBACEHYwEAAAABZkAAAAABZ0AAAAABaEAAAAABfwEAAAABgAEBAAAAAYEBAQAAAAEEFAAA6AEAMJYBAADpAQAwmAEAAOsBACCcAQAA7AEAMAQUAADcAQAwlgEAAN0BADCYAQAA3wEAIJwBAADgAQAwBBQAAMoBADCWAQAAywEAMJgBAADNAQAgnAEAAM4BADAAAAAAAAAAAAUUAACCAgAgFQAAhQIAIJYBAACDAgAglwEAAIQCACCcAQAAJgAgAxQAAIICACCWAQAAgwIAIJwBAAAmACAEBAAA9wEAIAUAAPgBACAGAAD5AQAghQEAALYBACAJBAAA9AEAIAUAAPUBACBjAQAAAAFnQAAAAAFoQAAAAAGCAQEAAAABgwEBAAAAAYQBIAAAAAGFAQEAAAABAgAAACYAIBQAAIICACADAAAAKQAgFAAAggIAIBUAAIYCACALAAAAKQAgBAAAxwEAIAUAAMgBACANAACGAgAgYwEAtAEAIWdAALUBACFoQAC1AQAhggEBALQBACGDAQEAtAEAIYQBIADGAQAhhQEBALoBACEJBAAAxwEAIAUAAMgBACBjAQC0AQAhZ0AAtQEAIWhAALUBACGCAQEAtAEAIYMBAQC0AQAhhAEgAMYBACGFAQEAugEAIQdjAQAAAAFmQAAAAAFnQAAAAAFoQAAAAAF_AQAAAAGAAQEAAAABgQEBAAAAAQ1jAQAAAAFnQAAAAAFoQAAAAAF0AQAAAAF1AQAAAAF3AQAAAAF4AQAAAAF5AQAAAAF6AQAAAAF7QAAAAAF8QAAAAAF9AQAAAAF-AQAAAAEKYwEAAAABZ0AAAAABiQECAAAAAYoBAgAAAAGLAQIAAAABjAECAAAAAY0BAgAAAAGOAQgAAAABjwEAANoBACCQAQAA2wEAIAkFAAD1AQAgBgAA9gEAIGMBAAAAAWdAAAAAAWhAAAAAAYIBAQAAAAGDAQEAAAABhAEgAAAAAYUBAQAAAAECAAAAJgAgFAAAigIAIAMAAAApACAUAACKAgAgFQAAjgIAIAsAAAApACAFAADIAQAgBgAAyQEAIA0AAI4CACBjAQC0AQAhZ0AAtQEAIWhAALUBACGCAQEAtAEAIYMBAQC0AQAhhAEgAMYBACGFAQEAugEAIQkFAADIAQAgBgAAyQEAIGMBALQBACFnQAC1AQAhaEAAtQEAIYIBAQC0AQAhgwEBALQBACGEASAAxgEAIYUBAQC6AQAhCQQAAPQBACAGAAD2AQAgYwEAAAABZ0AAAAABaEAAAAABggEBAAAAAYMBAQAAAAGEASAAAAABhQEBAAAAAQIAAAAmACAUAACPAgAgAwAAACkAIBQAAI8CACAVAACTAgAgCwAAACkAIAQAAMcBACAGAADJAQAgDQAAkwIAIGMBALQBACFnQAC1AQAhaEAAtQEAIYIBAQC0AQAhgwEBALQBACGEASAAxgEAIYUBAQC6AQAhCQQAAMcBACAGAADJAQAgYwEAtAEAIWdAALUBACFoQAC1AQAhggEBALQBACGDAQEAtAEAIYQBIADGAQAhhQEBALoBACEBAwACBAQGAwUKBAYNAQcABQEDAAIBAwACAwQOAAUPAAYQAAABAwACAQMAAgUHAAoaAAsbAAwcAA0dAA4AAAAAAAUHAAoaAAsbAAwcAA0dAA4AAAMHABMcABQdABUAAAADBwATHAAUHQAVAQMAAgEDAAIDBwAaHAAbHQAcAAAAAwcAGhwAGx0AHAEDAAIBAwACAwcAIRwAIh0AIwAAAAMHACEcACIdACMAAAADBwApHAAqHQArAAAAAwcAKRwAKh0AKwgCAQkRAQoSAQsTAQwUAQ4WAQ8YBhAZBxEbARIdBhMeCBYfARcgARghBh4kCR8lDyAnAiEoAiIrAiMsAiQtAiUvAiYxBicyECg0Aik2Bio3ESs4Aiw5Ai06Bi49Ei8-FjA_AzFAAzJBAzNCAzRDAzVFAzZHBjdIFzhKAzlMBjpNGDtOAzxPAz1QBj5TGT9UHUBVBEFWBEJXBENYBERZBEVbBEZdBkdeHkhgBEliBkpjH0tkBExlBE1mBk5pIE9qJFBsJVFtJVJwJVNxJVRyJVV0JVZ2Bld3Jlh5JVl7Blp8J1t9JVx-JV1_Bl6CAShfgwEs"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
var auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
  trustedOrigins: [
    process.env.APP_URL || "http://localhost:3000"
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true
  }
});

// src/context.ts
async function createContext(request, res) {
  const session = await auth.api.getSession({
    headers: request.headers
  });
  return {
    userId: session?.user?.id ?? null,
    user: session?.user ?? null,
    headers: request.headers,
    res
  };
}

// src/graphql/schema.ts
import { createSchema } from "graphql-yoga";

// src/modules/auth/auth.typeDefs.ts
var authTypeDefs = `
  type User {
    id: String!
    name: String!
    email: String!
    image: String
  }

  type AuthPayload {
    user: User!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  extend type Query {
    me: User
  }

  extend type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
  }
`;

// src/modules/auth/auth.resolver.ts
import { GraphQLError } from "graphql";

// src/modules/auth/auth.service.ts
var AuthService = class {
  // get current user
  async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, image: true }
    });
    if (!user) throw new Error("USER_NOT_FOUND");
    return user;
  }
  // user registration
  async register(name, email, password) {
    const response = await auth.api.signUpEmail({
      body: { name, email, password },
      returnHeaders: true
    });
    const user = response?.response?.user;
    if (!user) {
      throw new Error("REGISTRATION_FAILED");
    }
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      headers: response.headers
    };
  }
  // user login
  async login(email, password) {
    const response = await auth.api.signInEmail({
      body: { email, password },
      returnHeaders: true
    });
    if (!response || !response.response?.user) {
      throw new Error("INVALID_CREDENTIALS");
    }
    const user = response.response.user;
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      headers: response.headers
    };
  }
  // user logout
  async logout(headers) {
    const response = await auth.api.signOut({
      headers,
      returnHeaders: true
    });
    return {
      success: true,
      headers: response?.headers
    };
  }
};
var authService = new AuthService();

// src/validation/schemas.ts
import { z } from "zod";
var registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters").trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password is too long")
});
var loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required")
});
var submitGameResultSchema = z.object({
  correctChars: z.number().int("Must be an integer").min(0, "Cannot be negative").max(20, "Maximum 20 characters allowed"),
  wrongAttempts: z.number().int("Must be an integer").min(0, "Cannot be negative").max(100, "Too many wrong attempts"),
  rawTimeMs: z.number().int("Must be an integer").min(0, "Time cannot be negative").max(6e5, "Time cannot exceed 10 minutes"),
  wpmTimeline: z.array(z.number().min(0, "WPM cannot be negative")).min(1, "WPM timeline is required"),
  characterTimeline: z.array(z.number().int().min(0, "Character time cannot be negative")).optional()
});
var leaderboardLimitSchema = z.object({
  limit: z.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10)
});
function validateOrThrow(schema2, data) {
  const result = schema2.safeParse(data);
  if (!result.success) {
    const message = result.error.issues[0]?.message || "Invalid input";
    throw new Error(message);
  }
  return result.data;
}

// src/modules/auth/auth.resolver.ts
import { APIError } from "better-auth";
function setResponseCookies(res, headers) {
  if (!res || !headers) return;
  const cookies = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : headers.get("set-cookie");
  if (cookies) {
    res.setHeader("Set-Cookie", cookies);
  }
}
var authResolvers = {
  Query: {
    // user
    me: async (_parent, _args, context) => {
      if (!context.userId) {
        throw new GraphQLError("User is not authenticated", {
          extensions: { code: "UNAUTHENTICATED" }
        });
      }
      try {
        return await authService.getCurrentUser(context.userId);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message === "USER_NOT_FOUND") {
          throw new GraphQLError("User not found", {
            extensions: { code: "NOT_FOUND" }
          });
        }
        console.error("Fetch current user error:", error);
        throw new GraphQLError("Failed to fetch user. Please try again.", {
          extensions: { code: "INTERNAL_ERROR" }
        });
      }
    }
  },
  Mutation: {
    // register
    register: async (_parent, { input }, context) => {
      const validated = validateOrThrow(registerSchema, input);
      const { name, email, password } = validated;
      try {
        const { user, headers } = await authService.register(
          name,
          email,
          password
        );
        setResponseCookies(context.res, headers);
        return { user };
      } catch (error) {
        if (error instanceof APIError && error.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
          throw new GraphQLError("Email already registered", {
            extensions: { code: "BAD_USER_INPUT" }
          });
        }
        console.error("Registration error:", error);
        throw new GraphQLError("Registration failed. Please try again.", {
          extensions: { code: "INTERNAL_ERROR" }
        });
      }
    },
    // login
    login: async (_parent, { input }, context) => {
      const validated = validateOrThrow(loginSchema, input);
      const { email, password } = validated;
      try {
        const { user, headers } = await authService.login(email, password);
        setResponseCookies(context.res, headers);
        return { user };
      } catch (error) {
        if (error instanceof APIError && error.body?.code === "INVALID_EMAIL_OR_PASSWORD") {
          throw new GraphQLError("Invalid email or password", {
            extensions: { code: "BAD_USER_INPUT" }
          });
        }
        console.error("Login error:", error);
        throw new GraphQLError("Login failed. Please try again.", {
          extensions: { code: "INTERNAL_ERROR" }
        });
      }
    },
    // logout
    logout: async (_parent, _args, context) => {
      if (!context.userId) {
        throw new GraphQLError("User is not authenticated", {
          extensions: { code: "UNAUTHENTICATED" }
        });
      }
      try {
        const { headers } = await authService.logout(context.headers);
        setResponseCookies(context.res, headers);
        return true;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        console.error("Logout error:", error);
        throw new GraphQLError("Logout failed. Please try again.", {
          extensions: { code: "INTERNAL_ERROR" }
        });
      }
    }
  }
};

// src/modules/game/game.typeDefs.ts
var gameTypeDefs = `
  type GameResult {
    id: String!
    correctChars: Int!
    wrongAttempts: Int!
    rawTimeMs: Int!        
    penaltyMs: Int!         
    totalTimeMs: Int!        
    accuracy: Float!        
    wpmTimeline: [Float!]!   
    characterTimeline: [Int!]
    createdAt: String!
  }

  type LeaderboardEntry {
    rank: Int!
    playerName: String!
    bestTimeMs: Int!
  }

input SubmitGameResultInput {
  correctChars: Int!
  wrongAttempts: Int!
  rawTimeMs: Int!          
  wpmTimeline: [Float!]!  
  characterTimeline: [Int!]!
}

  extend type Query {
    myGameHistory: [GameResult!]!
    myBestScore: GameResult
    leaderboard(limit: Int = 10): [LeaderboardEntry!]!
  }

  extend type Mutation {
    submitGameResult(input: SubmitGameResultInput!): GameResult!
  }
`;

// src/modules/game/game.resolver.ts
import { GraphQLError as GraphQLError2 } from "graphql";

// src/modules/game/game.service.ts
var GameService = class {
  // game history
  async getHistory(userId) {
    return prisma.gameResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }
  // best score
  async getBestScore(userId) {
    return prisma.gameResult.findFirst({
      where: { userId },
      orderBy: { totalTimeMs: "asc" }
    });
  }
  // leaderboard
  async getLeaderboard(limit) {
    const rows = await prisma.$queryRaw`
    SELECT 
      u.name as "playerName",
      MIN(g."totalTimeMs")::int as "bestTimeMs",
      (ROW_NUMBER() OVER (ORDER BY MIN(g."totalTimeMs") ASC))::int as rank
    FROM "GameResult" g
    JOIN "user" u ON g."userId" = u.id
    GROUP BY u.id, u.name
    ORDER BY "bestTimeMs" ASC
    LIMIT ${limit}
  `;
    return rows.map((row) => ({
      playerName: row.playerName,
      bestTimeMs: Number(row.bestTimeMs),
      rank: Number(row.rank)
    }));
  }
  // submit result
  async submitResult(userId, input) {
    const penaltyMs = input.wrongAttempts * 500;
    const totalTimeMs = input.rawTimeMs + penaltyMs;
    const totalAttempts = input.correctChars + input.wrongAttempts;
    const accuracy = totalAttempts > 0 ? input.correctChars / totalAttempts * 100 : 0;
    return await prisma.gameResult.create({
      data: {
        userId,
        correctChars: input.correctChars,
        wrongAttempts: input.wrongAttempts,
        rawTimeMs: input.rawTimeMs,
        penaltyMs,
        totalTimeMs,
        accuracy,
        wpmTimeline: input.wpmTimeline,
        characterTimeline: input.characterTimeline || []
      }
    });
  }
};
var gameService = new GameService();

// src/modules/game/game.resolver.ts
var gameResolvers = {
  Query: {
    // game history
    myGameHistory: async (_parent, _args, context) => {
      if (!context.userId) {
        throw new GraphQLError2("User is not authenticated", {
          extensions: { code: "UNAUTHENTICATED" }
        });
      }
      return gameService.getHistory(context.userId);
    },
    // best score
    myBestScore: async (_parent, _args, context) => {
      if (!context.userId) {
        throw new GraphQLError2("User is not authenticated", {
          extensions: { code: "UNAUTHENTICATED" }
        });
      }
      return gameService.getBestScore(context.userId);
    },
    // leaderboard
    leaderboard: async (_parent, { limit }) => {
      const validated = validateOrThrow(leaderboardLimitSchema, { limit });
      return gameService.getLeaderboard(validated.limit);
    }
  },
  Mutation: {
    submitGameResult: async (_parent, { input }, context) => {
      if (!context.userId) {
        throw new GraphQLError2("User is not authenticated", {
          extensions: { code: "UNAUTHENTICATED" }
        });
      }
      const validated = validateOrThrow(submitGameResultSchema, input);
      try {
        const result = await gameService.submitResult(
          context.userId,
          validated
        );
        return result;
      } catch (error) {
        if (error instanceof GraphQLError2) {
          throw error;
        }
        console.error("Submit game result error:", error);
        throw new GraphQLError2(
          "Failed to submit game result. Please try again.",
          {
            extensions: { code: "INTERNAL_ERROR" }
          }
        );
      }
    }
  },
  GameResult: {
    createdAt: (parent) => {
      if (!parent.createdAt) return (/* @__PURE__ */ new Date()).toISOString();
      if (parent.createdAt instanceof Date) {
        return parent.createdAt.toISOString();
      }
      return new Date(parent.createdAt).toISOString();
    }
  }
};

// src/graphql/schema.ts
var baseTypeDefs = `
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`;
var typeDefs = [
  baseTypeDefs,
  authTypeDefs,
  gameTypeDefs
];
var resolvers = {
  Query: {
    ...authResolvers.Query,
    ...gameResolvers.Query
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...gameResolvers.Mutation
  },
  GameResult: {
    ...gameResolvers.GameResult
  }
};
var schema = createSchema({
  typeDefs,
  resolvers
});

// src/app.ts
var app = express();
app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true
  })
);
app.all("/api/auth/*splat", (req) => auth.handler(req));
app.use(express.json());
var yoga = createYoga({
  graphqlEndpoint: "/graphql",
  schema,
  context: async (initialContext) => {
    return createContext(initialContext.request, initialContext.res);
  }
});
app.use(yoga.graphqlEndpoint, yoga);
app.get("/", (req, res) => {
  res.send("He");
});
var app_default = app;

// src/server.ts
var PORT = process.env.PORT || 3e3;
async function main() {
  try {
    await prisma.$connect();
    console.log("connected to database");
    app_default.listen(PORT, () => {
      console.log(`server is running on ${PORT}`);
    });
  } catch (error) {
    console.error("an error occurred", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
main();
