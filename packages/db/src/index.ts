// packages\db\src\index.ts

export { prisma } from "./client";
export { PrismaClient, Prisma } from "dist/generated/client";

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
} from "dist/generated/client";

// enum
export {
  UserRole,
  PIApplicationStatus,
  Visibility,
  EmoteKind,
  EmotePlace,
  TagKind,
} from "dist/generated/client";
