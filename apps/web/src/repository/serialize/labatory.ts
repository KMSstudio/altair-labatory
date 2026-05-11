// @/repository/serialize/labatory.ts

import type { UniversityDbShape, UniversityDTO } from "@/repository/dto/labatory";
import type { SubjectDbShape, SubjectDTO } from "@/repository/dto/labatory";
import type { PiDbShape, PiDTO } from "@/repository/dto/labatory";
import type { PiApplicationDbShape, PiApplicationDTO } from "@/repository/dto/labatory";
import type { LabReviewDbShape, LabReviewDTO } from "@/repository/dto/labatory";
import type { LabDbShape, LabDTO } from "@/repository/dto/labatory";

export function serializeUniversity(univ: UniversityDbShape): UniversityDTO {
  return {
    id: univ.id.toString(),
    nameKo: univ.nameKo,
    nameEn: univ.nameEn,
    country: univ.country,
    websiteUrl: univ.websiteUrl,
    domain: univ.domain,
    createdAt: univ.createdAt.toISOString(),
  };
}

export function serializeSubject(subj: SubjectDbShape): SubjectDTO {
  return {
    id: subj.id.toString(),
    nameKo: subj.nameKo,
    nameEn: subj.nameEn,
    description: subj.description,
    isActive: subj.isActive,
    createdAt: subj.createdAt.toISOString(),
    updatedAt: subj.updatedAt.toISOString(),
  };
}

export function serializePi(pi: PiDbShape): PiDTO {
  return {
    id: pi.id.toString(),
    userId: pi.userId?.toString() ?? null,
    name: pi.name,
    email: pi.email,
    scholarUrl: pi.scholarUrl,
    labId: pi.labId?.toString() ?? null,
    createdAt: pi.createdAt.toISOString(),
  };
}

export function serializePiApplication(piApplication: PiApplicationDbShape): PiApplicationDTO {
  return {
    id: piApplication.id.toString(),
    userId: piApplication.userId.toString(),
    requestedName: piApplication.requestedName,
    labId: piApplication.labId?.toString() ?? null,
    schoolEmail: piApplication.schoolEmail,
    scholarUrl: piApplication.scholarUrl,
    note: piApplication.note,
    status: piApplication.status,
    decidedBy: piApplication.decidedBy?.toString() ?? null,
    decidedAt: piApplication.decidedAt?.toISOString() ?? null,
    createdAt: piApplication.createdAt.toISOString(),
  };
}

export function serializeLabReview(labReview: LabReviewDbShape): LabReviewDTO {
  return {
    id: labReview.id.toString(),
    labId: labReview.labId.toString(),
    authorId: labReview.authorId.toString(),
    content: labReview.content,
    recommend: labReview.recommend,
    atmos: labReview.atmos,
    lectr: labReview.lectr,
    paper: labReview.paper,
    salry: labReview.salry,
    persn: labReview.persn,
    visib: labReview.visib,
    createdAt: labReview.createdAt.toISOString(),
    updatedAt: labReview.updatedAt.toISOString(),
  };
}

export function serializeLab(lab: LabDbShape): LabDTO {
  return {
    id: lab.id.toString(),
    nameKo: lab.nameKo,
    nameEn: lab.nameEn,
    websiteUrl: lab.websiteUrl,
    description: lab.description,
    createdAt: lab.createdAt.toISOString(),
    university: lab.university ? serializeUniversity(lab.university) : null,
    pi: lab.pi ? serializePi(lab.pi) : null,
    subjects: lab.subjects.map((subject) => serializeSubject(subject.subject)),
  };
}
