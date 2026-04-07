// @/repository/dto/labatory.ts

import type { PIApplicationStatus, Visibility } from "@labatory/db";

//UNIVERSITY
export type UniversityDbShape = {
  id: bigint;
  nameKo: string;
  nameEn: string | null;
  country: string | null;
  websiteUrl: string | null;
  createdAt: Date;
};

export const getUniversitySelect = {
  id: true,
  nameKo: true,
  nameEn: true,
  country: true,
  websiteUrl: true,
  createdAt: true,
} as const;

export type UniversityDTO = {
  id: string;
  nameKo: string;
  nameEn: string | null;
  country: string | null;
  websiteUrl: string | null;
  createdAt: string;
};

//SUBJECT
export type SubjectDbShape = {
  id: bigint;
  nameKo: string;
  nameEn: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const getSubjectSelect = {
  id: true,
  nameKo: true,
  nameEn: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type SubjectDTO = {
  id: string;
  nameKo: string;
  nameEn: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

//PI
export type PiDbShape = {
  id: bigint;
  userId: bigint | null;
  name: string;
  email: string;
  scholarUrl: string;
  labId: bigint | null;
  createdAt: Date;
};

export const getPiSelect = {
  id: true,
  userId: true,
  name: true,
  email: true,
  scholarUrl: true,
  labId: true,
  createdAt: true,
} as const;

export type PiDTO = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  scholarUrl: string;
  labId: string | null;
  createdAt: string;
};

//PI APPLICATION
export type PiApplicationDbShape = {
  id: bigint;
  userId: bigint;
  requestedName: string;
  labId: bigint | null;
  schoolEmail: string;
  scholarUrl: string;
  note: string | null;
  status: PIApplicationStatus;
  decidedBy: bigint | null;
  decidedAt: Date | null;
  createdAt: Date;
};

export const getPiApplicationSelect = {
  id: true,
  userId: true,
  requestedName: true,
  labId: true,
  schoolEmail: true,
  scholarUrl: true,
  note: true,
  status: true,
  decidedBy: true,
  decidedAt: true,
  createdAt: true,
} as const;

export type PiApplicationDTO = {
  id: string;
  userId: string;
  requestedName: string;
  labId: string | null;
  schoolEmail: string;
  scholarUrl: string;
  note: string | null;
  status: PIApplicationStatus;
  decidedBy: string | null;
  decidedAt: string | null;
  createdAt: string;
};

//LAB REVIEW
export type LabReviewDbShape = {
  id: bigint;
  labId: bigint;
  authorId: bigint;
  content: string;
  recommend: boolean;
  atmos: number;
  lectr: number;
  paper: number;
  salry: number;
  persn: number;
  guidance: number | null;
  meetfreq: number | null;
  externok: number | null;
  visib: Visibility;
  createdAt: Date;
  updatedAt: Date;
};

export const getLabReviewSelect = {
  id: true,
  labId: true,
  authorId: true,
  content: true,
  recommend: true,
  atmos: true,
  lectr: true,
  paper: true,
  salry: true,
  persn: true,
  guidance: true,
  meetfreq: true,
  externok: true,
  visib: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type LabReviewDTO = {
  id: string;
  labId: string;
  authorId: string;
  content: string;
  recommend: boolean;
  atmos: number;
  lectr: number;
  paper: number;
  salry: number;
  persn: number;
  guidance: number | null;
  meetfreq: number | null;
  externok: number | null;
  visib: Visibility;
  createdAt: string;
  updatedAt: string;
};

export type CreateLabReviewInput = {
  content: string;
  recommend: boolean;
  atmos: number;
  lectr: number;
  paper: number;
  salry: number;
  persn: number;
  guidance?: number | null;
  meetfreq?: number | null;
  externok?: number | null;
};

export type UpdateLabReviewInput = Partial<CreateLabReviewInput>;
