// packages\db\src\index.ts

export { prisma } from "./client";
export { PrismaClient, Prisma } from "../generated/client";

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
} from "../generated/client";

// enum
export {
  UserRole,
  PIApplicationStatus,
  Visibility,
  EmoteKind,
  EmotePlace,
  TagKind,
} from "../generated/client";
