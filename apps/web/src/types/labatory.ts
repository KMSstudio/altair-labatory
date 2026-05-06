// @/types/labatory.ts

export type University_Input = {
  nameKo: string;
  nameEn: string | null;
  country: string | null;
  websiteUrl: string | null;
};

export type Subject_Input = {
  nameKo: string;
  nameEn: string;
  description: string | null;
  isActive?: boolean;
};

export type Pi_Input = {
  name: string;
  email: string;
  scholarUrl: string;
  labId?: bigint | null;
  userId?: bigint | null;
};

export type Pi_Application_Input = {
  requestedName: string;
  labId: bigint | null;
  schoolEmail: string;
  scholarUrl: string;
  note: string | null;
};

export type Labatory_Input = {
  nameKo: string;
  nameEn: string;
  websiteUrl: string | null;
  description: string | null;
  universityId: bigint | null;
  piId: bigint;
};

export type Labatory_Update_Input = {
  nameKo: string;
  nameEn: string;
  websiteUrl: string | null;
  description: string | null;
  universityId: bigint | null;
};

export type LabReviewInput = {
  content: string;
  recommend: boolean;
  atmos: number;
  lectr: number;
  paper: number;
  salry: number;
  persn: number;
  guidance: number | null;
  meetFreq: number | null;
  externOk: number | null;
};
