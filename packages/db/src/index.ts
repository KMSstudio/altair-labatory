// packages\db\src\index.ts

export { prisma } from "./client";
export { PrismaClient, Prisma } from "@prisma/client";

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
} from "@prisma/client";

// enum
export {
  UserRole,
  PIApplicationStatus,
  Visibility,
} from "@prisma/client";
