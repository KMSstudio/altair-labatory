// packages\db\src\index.ts

export { prisma } from "./client";
export { PrismaClient, Prisma } from "../src/generated/client";

// type
export type {
  User,
  UserCredential,
  University,
  PI,
  PIApplication,
  Lab,
  Subject,
  LabSubject,
  LabReview,
  LabReviewReport,
  VerificationToken,
} from "../src/generated/client";

// enum
export {
  UserRole,
  PIApplicationStatus,
  Visibility,
  EmoteKind,
  EmotePlace,
  TagKind,
} from "../src/generated/client";
