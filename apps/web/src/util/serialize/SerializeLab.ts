import { Prisma } from "@labatory/db";
type SerializedLab = {
  id: string;
  nameKo: string;
  nameEn: string | null;
  websiteUrl: string | null;
  description: string | null;
  universityId: string | null;
  subjects: { subjectId: string; nameKo: string; nameEn: string; isActive: boolean }[];
  createdAt: string;
  updatedAt: string;
};

type LabWithSubjects = Prisma.LabGetPayload<{
  include: {
    subjects: {
      include: {
        subject: { select: { nameKo: true; nameEn: true; isActive: true } };
      };
    };
  };
}>;

export function SerializeLab(lab: LabWithSubjects): SerializedLab {
  return {
    id: lab.id.toString(),
    nameKo: lab.nameKo,
    nameEn: lab.nameEn,
    websiteUrl: lab.websiteUrl,
    description: lab.description,
    universityId: lab.universityId ? lab.universityId.toString() : null,
    subjects: lab.subjects.map((ls) => ({
      subjectId: ls.subjectId.toString(),
      nameKo: ls.subject.nameKo,
      nameEn: ls.subject.nameEn,
      isActive: ls.subject.isActive,
    })),
    createdAt: lab.createdAt.toISOString(),
    updatedAt: lab.updatedAt.toISOString(),
  };
}
