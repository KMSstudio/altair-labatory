import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PIApplicationStatus,
  PrismaClient,
  TagKind,
  UserRole,
  Visibility,
} from "dist/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(__dirname, "../../../.env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$transaction([
    prisma.tag.deleteMany(),
    prisma.labReviewReport.deleteMany(),
    prisma.labReview.deleteMany(),
    prisma.labSubject.deleteMany(),
    prisma.pIApplication.deleteMany(),
    prisma.userCredential.deleteMany(),
    prisma.pI.deleteMany(),
    prisma.lab.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.university.deleteMany(),
    prisma.user.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.article.deleteMany(),
    prisma.boardAcl.deleteMany(),
    prisma.board.deleteMany(),
  ]);

  const admin = await prisma.user.create({
    data: {
      displayName: "Admin User",
      role: UserRole.ADMIN,
      primaryEmail: "admin@labatory.test",
    },
  });

  const piUser = await prisma.user.create({
    data: {
      displayName: "Dr. Jihoon Park",
      role: UserRole.PI,
      primaryEmail: "jihoon.park@labatory.test",
    },
  });

  const student = await prisma.user.create({
    data: {
      displayName: "Minseo Kim",
      role: UserRole.USER,
      primaryEmail: "minseo.kim@labatory.test",
    },
  });

  await prisma.userCredential.createMany({
    data: [
      {
        userId: admin.id,
        provider: "email",
        providerUserId: "admin@labatory.test",
        email: "admin@labatory.test",
        emailVerified: true,
        isPrimary: true,
      },
      {
        userId: piUser.id,
        provider: "email",
        providerUserId: "jihoon.park@labatory.test",
        email: "jihoon.park@labatory.test",
        emailVerified: true,
        isPrimary: true,
      },
      {
        userId: student.id,
        provider: "email",
        providerUserId: "minseo.kim@labatory.test",
        email: "minseo.kim@labatory.test",
        emailVerified: false,
        isPrimary: true,
      },
    ],
  });

  const seoulUni = await prisma.university.create({
    data: {
      nameKo: "서울대학교",
      nameEn: "Seoul National University",
      country: "KR",
      websiteUrl: "https://www.snu.ac.kr",
    },
  });

  const kaist = await prisma.university.create({
    data: {
      nameKo: "카이스트",
      nameEn: "KAIST",
      country: "KR",
      websiteUrl: "https://www.kaist.ac.kr",
    },
  });

  const labAi = await prisma.lab.create({
    data: {
      nameKo: "인공지능 연구실",
      nameEn: "AI Research Lab",
      websiteUrl: "https://example.com/ai-lab",
      description: "Focuses on applied machine learning and systems.",
      university: { connect: { id: seoulUni.id } },
    },
  });

  const labBio = await prisma.lab.create({
    data: {
      nameKo: "생명과학 연구실",
      nameEn: "Bioinformatics Lab",
      websiteUrl: "https://example.com/bio-lab",
      description: "Computational biology and genomic data analysis.",
      university: { connect: { id: kaist.id } },
    },
  });

  const labRobotics = await prisma.lab.create({
    data: {
      nameKo: "로보틱스 연구실",
      nameEn: "Robotics Lab",
      websiteUrl: "https://example.com/robotics-lab",
      description: "Human-robot interaction and autonomous systems.",
    },
  });

  const subjectAi = await prisma.subject.create({
    data: {
      nameKo: "인공지능",
      nameEn: "Artificial Intelligence",
      description: "Machine learning, deep learning, and AI systems.",
    },
  });

  const subjectBio = await prisma.subject.create({
    data: {
      nameKo: "생물정보학",
      nameEn: "Bioinformatics",
      description: "Genomics, proteomics, and computational biology.",
    },
  });

  const subjectRobotics = await prisma.subject.create({
    data: {
      nameKo: "로봇공학",
      nameEn: "Robotics",
      description: "Robotics control, perception, and planning.",
    },
  });

  await prisma.labSubject.createMany({
    data: [
      { labId: labAi.id, subjectId: subjectAi.id },
      { labId: labBio.id, subjectId: subjectBio.id },
      { labId: labRobotics.id, subjectId: subjectRobotics.id },
      { labId: labAi.id, subjectId: subjectRobotics.id },
    ],
  });

  await prisma.tag.createMany({
    data: [
      { kind: TagKind.LAB, labId: labAi.id, text: `${labAi.nameKo}(${labAi.nameEn})` },
      { kind: TagKind.LAB, labId: labBio.id, text: `${labBio.nameKo}(${labBio.nameEn})` },
      { kind: TagKind.LAB, labId: labRobotics.id, text: `${labRobotics.nameKo}(${labRobotics.nameEn})` },
      { kind: TagKind.SUBJECT, subjId: subjectAi.id, text: `${subjectAi.nameKo}(${subjectAi.nameEn})` },
      { kind: TagKind.SUBJECT, subjId: subjectBio.id, text: `${subjectBio.nameKo}(${subjectBio.nameEn})` },
      { kind: TagKind.SUBJECT, subjId: subjectRobotics.id, text: `${subjectRobotics.nameKo}(${subjectRobotics.nameEn})` },
      { kind: TagKind.UNIV, univId: seoulUni.id, text: `${seoulUni.nameKo}(${seoulUni.nameEn})` },
      { kind: TagKind.UNIV, univId: kaist.id, text: `${kaist.nameKo}(${kaist.nameEn})` },
    ]
  })
  await prisma.pI.create({
    data: {
      name: "Jihoon Park",
      email: "jihoon.park@labatory.test",
      scholarUrl: "https://scholar.google.com/citations?user=sample",
      user: { connect: { id: piUser.id } },
      lab: { connect: { id: labAi.id } },
    },
  });

  const piApplication = await prisma.pIApplication.create({
    data: {
      userId: student.id,
      requestedName: "Minseo Kim",
      labId: labBio.id,
      schoolEmail: "minseo.kim@school.test",
      ScholarUrl: "https://scholar.google.com/citations?user=minseo",
      note: "Looking to register the lab for recruitment.",
      status: PIApplicationStatus.APPROVED,
      decidedBy: admin.id,
      decidedAt: new Date(),
    },
  });

  const reviewAi = await prisma.labReview.create({
    data: {
      labId: labAi.id,
      authorId: student.id,
      content: "Collaborative environment with strong mentorship.",
      recommend: true,
      atmos: 5,
      lectr: 4,
      paper: 5,
      salry: 3,
      persn: 5,
      visib: Visibility.PUBLIC,
    },
  });

  await prisma.labReview.create({
    data: {
      labId: labBio.id,
      authorId: student.id,
      content: "Interesting projects, but workload can be heavy.",
      recommend: false,
      atmos: 3,
      lectr: 3,
      paper: 4,
      salry: 3,
      persn: 4,
      visib: Visibility.PUBLIC,
    },
  });

  const freeBoard = await prisma.board.create({
    data: {
      nameKo: "자유게시판",
      nameEn: "General discussion",
      description: "A board for any theme and subject.",
      sortOrder: 1,
    }
  })

  const bestBoard = await prisma.board.create({
    data: {
      nameKo: "베스트게시판",
      nameEn: "Top articles",
      description: "A board featuring the most popular and highly rated posts.",
      sortOrder: 2,
    }
  })

  const freeArticle1 = await prisma.article.create({
    data: {
      boardId: freeBoard.id,
      title: "First Example title",
      content: "first Example content.",
      authorId: student.id,
      authorIp: "172.0.0.1",
    }
  })
  const freeArticle2 = await prisma.article.create({
    data: {
      boardId: freeBoard.id,
      title: "Second Example title",
      content: "Second example content.",
      authorId: piUser.id,
      authorIp: "172.0.0.2",
    }
  })
  await prisma.labReviewReport.create({
    data: {
      reviewId: reviewAi.id,
      reporterId: admin.id,
      reason: "PI requested clarification",
      detail: "Check for sensitive information in the review.",
    },
  });

  console.log("Seed completed", {
    users: [admin.id, piUser.id, student.id],
    universities: [seoulUni.id, kaist.id],
    labs: [labAi.id, labBio.id, labRobotics.id],
    subjects: [subjectAi.id, subjectBio.id, subjectRobotics.id],
    piApplicationId: piApplication.id,
    reviewId: reviewAi.id,
    boardId: [freeBoard.id, bestBoard.id],
    articleId: [freeArticle1.id, freeArticle2.id],
  });
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
