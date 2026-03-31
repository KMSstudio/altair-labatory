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
  labId: bigint | null;
  userId: bigint | null;
};

export type Pi_Application_Input = {
  requestedName: string;
  labId: bigint | null;
  schoolEmail: string;
  scholarUrl: string;
  note: string | null;
};
