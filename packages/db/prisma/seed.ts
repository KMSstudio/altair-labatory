import { config as loadEnv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  EmoteKind,
  EmotePlace,
  PIApplicationStatus,
  PrismaClient,
  TagKind,
  UserRole,
  Visibility,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcryptjs from "bcryptjs"

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

  const admins = await prisma.user.createManyAndReturn({
    data: [
      {
        displayName: "Admin User1",
        role: UserRole.ADMIN,
        primaryEmail: "admin1@labatory.test",
      },
      {
        displayName: "Admin User2",
        role: UserRole.ADMIN,
        primaryEmail: "admin2@labatory.test",
      },
    ]
  });

  const piUsers = await prisma.user.createManyAndReturn({
    data: [
      {
        displayName: "Dr. Jihoon Park",
        role: UserRole.PI,
        primaryEmail: "jihoon.park@labatory.test",
      },
      {
        displayName: "Dr. Jihong Kim",
        role: UserRole.PI,
        primaryEmail: "jihong.kim@labatory.test",
      },
      {
        displayName: "Dr. Seojun Park",
        role: UserRole.PI,
        primaryEmail: "seojun.park@labatory.test",
      },
      {
        displayName: "Dr. Jane Doe",
        role: UserRole.PI,
        primaryEmail: "jane.doe@labatory.test",
      },
    ],
  });

  const students = await prisma.user.createManyAndReturn({
    data: [
      {
        displayName: "Minseo Kim",
        role: UserRole.USER,
        primaryEmail: "minseo.kim@labatory.test",
      },
      {
        displayName: "Cheolsu Kim",
        role: UserRole.USER,
        primaryEmail: "cheolsu.kim@labatory.test",
      },
      {
        displayName: "Younghee Lee",
        role: UserRole.USER,
        primaryEmail: "younghee.lee@labatory.test",
      },
      {
        displayName: "Seungwoo Choi",
        role: UserRole.USER,
        primaryEmail: "seungwoo.choi@labatory.test",
      },
      {
        displayName: "Hana Jung",
        role: UserRole.USER,
        primaryEmail: "hana.jung@labatory.test",
      },
      {
        displayName: "Donghyun Kang",
        role: UserRole.USER,
        primaryEmail: "donghyun.kang@labatory.test",
      },
    ],
  });

  const passwordHash = await bcryptjs.hash("password", 10)
  await prisma.userCredential.createMany({
    data: [
      {
        userId: admins[0].id,
        provider: "credentials",
        providerUserId: "admin1@labatory.test",
        email: "admin1@labatory.test",
        emailVerified: true,
        isPrimary: true,
        passwordHash,
      },
      {
        userId: admins[1].id,
        provider: "credentials",
        providerUserId: "admin2@labatory.test",
        email: "admin2@labatory.test",
        emailVerified: true,
        isPrimary: true,
        passwordHash,
      },
      {
        userId: piUsers[0].id,
        provider: "credentials",
        providerUserId: "jihoon.park@labatory.test",
        email: "jihoon.park@labatory.test",
        emailVerified: true,
        isPrimary: true,
        passwordHash,
      },
      {
        userId: piUsers[1].id,
        provider: "credentials",
        providerUserId: "jihong.kim@labatory.test",
        email: "jihong.kim@labatory.test",
        emailVerified: true,
        isPrimary: true,
        passwordHash,
      },
      {
        userId: piUsers[2].id,
        provider: "credentials",
        providerUserId: "seojun.park@labatory.test",
        email: "seojun.park@labatory.test",
        emailVerified: true,
        isPrimary: true,
        passwordHash,
      },
      {
        userId: piUsers[3].id,
        provider: "credentials",
        providerUserId: "jane.doe@labatory.test",
        email: "jane.doe@labatory.test",
        emailVerified: true,
        isPrimary: true,
        passwordHash,
      },
      {
        userId: students[0].id,
        provider: "credentials",
        providerUserId: "minseo.kim@labatory.test",
        email: "minseo.kim@labatory.test",
        emailVerified: true,
        isPrimary: true,
        passwordHash,
      },
      {
        userId: students[1].id,
        provider: "credentials",
        providerUserId: "cheolsu.kim@labatory.test",
        email: "cheolsu.kim@labatory.test",
        emailVerified: true,
        isPrimary: true,
        passwordHash,
      },
      {
        userId: students[2].id,
        provider: "credentials",
        providerUserId: "younghee.lee@labatory.test",
        email: "younghee.lee@labatory.test",
        emailVerified: true,
        isPrimary: true,
        passwordHash,
      },
      {
        userId: students[3].id,
        provider: "credentials",
        providerUserId: "seungwoo.choi@labatory.test",
        email: "seungwoo.choi@labatory.test",
        emailVerified: true,
        isPrimary: true,
        passwordHash,
      },
      {
        userId: students[4].id,
        provider: "credentials",
        providerUserId: "hana.jung@labatory.test",
        email: "hana.jung@labatory.test",
        emailVerified: true,
        isPrimary: true,
        passwordHash,
      },
      {
        userId: students[5].id,
        provider: "credentials",
        providerUserId: "donghyun.kang@labatory.test",
        email: "donghyun.kang@labatory.test",
        emailVerified: true,
        isPrimary: true,
        passwordHash,
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

  const yonseiUni = await prisma.university.create({
    data: {
      nameKo: "연세대학교",
      nameEn: "Yonsei University",
      country: "KR",
      websiteUrl: "https://www.yonsei.ac.kr",
    },
  });

  const koreaUni = await prisma.university.create({
    data: {
      nameKo: "고려대학교",
      nameEn: "Korea University",
      country: "KR",
      websiteUrl: "https://www.korea.ac.kr",
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

  const berkeleyUni = await prisma.university.create({
    data: {
      nameKo: "캘리포니아 대학교 버클리",
      nameEn: "University of California, Berkeley",
      country: "US",
      websiteUrl: "https://www.berkeley.edu",
    },
  });

  const oxfordUni = await prisma.university.create({
    data: {
      nameKo: "옥스퍼드 대학교",
      nameEn: "University of Oxford",
      country: "UK",
      websiteUrl: "https://www.ox.ac.uk",
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
      university: { connect: { id: seoulUni.id } },
    },
  });

  const labRobotics = await prisma.lab.create({
    data: {
      nameKo: "로보틱스 연구실",
      nameEn: "Robotics Lab",
      websiteUrl: "https://example.com/robotics-lab",
      description: "Human-robot interaction and autonomous systems.",
      university: { connect: { id: kaist.id } },
    },
  });

  const labVision = await prisma.lab.create({
    data: {
      nameKo: "컴퓨터비전 연구실",
      nameEn: "Computer Vision Lab",
      websiteUrl: "https://example.com/cv-lab",
      description: "Image understanding, object detection, and visual AI.",
      university: { connect: { id: yonseiUni.id } },
    },
  });

  const labNlp = await prisma.lab.create({
    data: {
      nameKo: "자연어처리 연구실",
      nameEn: "Natural Language Processing Lab",
      websiteUrl: "https://example.com/nlp-lab",
      description: "Language models, text mining, and conversational AI.",
      university: { connect: { id: koreaUni.id } },
    },
  });

  const labSystems = await prisma.lab.create({
    data: {
      nameKo: "분산시스템 연구실",
      nameEn: "Distributed Systems Lab",
      websiteUrl: "https://example.com/ds-lab",
      description: "Scalable systems, distributed computing, and cloud infrastructure.",
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

  const subjectMl = await prisma.subject.create({
    data: {
      nameKo: "머신러닝",
      nameEn: "Machine Learning",
      description: "Supervised learning, reinforcement learning, and model optimization.",
    },
  });

  const subjectVision = await prisma.subject.create({
    data: {
      nameKo: "컴퓨터비전",
      nameEn: "Computer Vision",
      description: "Image processing, recognition, and visual perception.",
    },
  });

  const subjectNlp = await prisma.subject.create({
    data: {
      nameKo: "자연어처리",
      nameEn: "Natural Language Processing",
      description: "Text analysis, language models, and dialogue systems.",
    },
  });

  const inactiveSubject = await prisma.subject.create({
    data: {
      nameKo: "전자계산",
      nameEn: "Computer Science",
      description: "Development of efficient algorithms for emerging electronic computers.",
      isActive: false,
    },
  });

  const NotLinkedSubject = await prisma.subject.create({
    data: {
      nameKo: "양자역학",
      nameEn: "Quantum Science",
      description: "Experiment and Study of Quantum Science.",
    },
  })

  await prisma.labSubject.createMany({
    data: [
      { labId: labAi.id, subjectId: subjectAi.id },
      { labId: labAi.id, subjectId: subjectRobotics.id },
      { labId: labAi.id, subjectId: subjectMl.id },
      { labId: labAi.id, subjectId: subjectNlp.id },
      { labId: labBio.id, subjectId: subjectBio.id },
      { labId: labRobotics.id, subjectId: subjectRobotics.id },
      { labId: labVision.id, subjectId: subjectVision.id },
      { labId: labNlp.id, subjectId: subjectNlp.id },
    ],
  });

  const tags = await prisma.tag.createManyAndReturn({
    data: [
      { kind: TagKind.LAB, labId: labAi.id, text: `${labAi.nameKo}(${labAi.nameEn})` },
      { kind: TagKind.LAB, labId: labBio.id, text: `${labBio.nameKo}(${labBio.nameEn})` },
      { kind: TagKind.LAB, labId: labRobotics.id, text: `${labRobotics.nameKo}(${labRobotics.nameEn})` },
      { kind: TagKind.LAB, labId: labVision.id, text: `${labVision.nameKo}(${labVision.nameEn})` },
      { kind: TagKind.LAB, labId: labNlp.id, text: `${labNlp.nameKo}(${labNlp.nameEn})` },
      { kind: TagKind.LAB, labId: labSystems.id, text: `${labSystems.nameKo}(${labSystems.nameEn})` },
      { kind: TagKind.SUBJECT, subjId: subjectAi.id, text: `${subjectAi.nameKo}(${subjectAi.nameEn})` },
      { kind: TagKind.SUBJECT, subjId: subjectBio.id, text: `${subjectBio.nameKo}(${subjectBio.nameEn})` },
      { kind: TagKind.SUBJECT, subjId: subjectRobotics.id, text: `${subjectRobotics.nameKo}(${subjectRobotics.nameEn})` },
      { kind: TagKind.SUBJECT, subjId: subjectMl.id, text: `${subjectMl.nameKo}(${subjectMl.nameEn})` },
      { kind: TagKind.SUBJECT, subjId: subjectVision.id, text: `${subjectVision.nameKo}(${subjectVision.nameEn})` },
      { kind: TagKind.SUBJECT, subjId: subjectNlp.id, text: `${subjectNlp.nameKo}(${subjectNlp.nameEn})` },
      { kind: TagKind.UNIV, univId: seoulUni.id, text: `${seoulUni.nameKo}(${seoulUni.nameEn})` },
      { kind: TagKind.UNIV, univId: kaist.id, text: `${kaist.nameKo}(${kaist.nameEn})` },
      { kind: TagKind.UNIV, univId: yonseiUni.id, text: `${yonseiUni.nameKo}(${yonseiUni.nameEn})` },
      { kind: TagKind.UNIV, univId: koreaUni.id, text: `${koreaUni.nameKo}(${koreaUni.nameEn})` },
      { kind: TagKind.UNIV, univId: berkeleyUni.id, text: `${berkeleyUni.nameKo}(${berkeleyUni.nameEn})` },
      { kind: TagKind.UNIV, univId: oxfordUni.id, text: `${oxfordUni.nameKo}(${oxfordUni.nameEn})` },
      { kind: TagKind.TEXT, text: "Maintenance" },
      { kind: TagKind.TEXT, text: "Information" },
      { kind: TagKind.TEXT, text: "Update" },
    ],
    select: {
      id: true,
    }
  });

  const pis = await prisma.pI.createManyAndReturn({
    data: [
      {
        name: "Jihoon Park",
        email: "jihoon.park@labatory.test",
        scholarUrl: "https://scholar.google.com/citations?user=sample",
        userId: piUsers[0].id,
        labId: labAi.id,
      },
      {
        name: "Jihong Kim",
        email: "jihong.kim@labatory.test",
        scholarUrl: "https://scholar.google.com/citations?user=sample",
        userId: piUsers[1].id,
        labId: labRobotics.id,
      },
      {
        name: "Seojun Park",
        email: "seojun.park@labatory.test",
        scholarUrl: "https://scholar.google.com/citations?user=sample",
        userId: piUsers[2].id,
        labId: labSystems.id,
      },
      {
        name: "John Doe",
        email: "john.doe@labatory.test",
        scholarUrl: "https://scholar.google.com/citations?user=sample",
        userId: null,
        labId: null,
      }
    ],
    select: {
      id: true,
    }
  });

  const pendingPiApplication = await prisma.pIApplication.create({
    data: {
      userId: students[0].id,
      requestedName: "Minseo Kim",
      labId: labBio.id,
      schoolEmail: "minseo.kim@school.test",
      ScholarUrl: "https://scholar.google.com/citations?user=minseo",
      note: "Looking to register the lab for recruitment.",
      status: PIApplicationStatus.PENDING,
    },
  });

  const approvedPiApplication = await prisma.pIApplication.create({
    data: {
      userId: students[1].id,
      requestedName: "Cheolsu Kim",
      labId: labVision.id,
      schoolEmail: "cheolsu.kim@school.test",
      ScholarUrl: "https://scholar.google.com/citations?user=cheolsu",
      note: "Looking to register the lab for recruitment.",
      status: PIApplicationStatus.APPROVED,
      decidedBy: admins[0].id,
      decidedAt: new Date(),
    },
  });

  const rejectedPiApplication = await prisma.pIApplication.create({
    data: {
      userId: students[2].id,
      requestedName: "Younghee Lee",
      labId: labNlp.id,
      schoolEmail: "younghee.lee@school.test",
      ScholarUrl: "https://scholar.google.com/citations?user=younghee",
      note: "Looking to register the lab for recruitment.",
      status: PIApplicationStatus.REJECTED,
      decidedBy: admins[0].id,
      decidedAt: new Date(),
    },
  });

  const reviewAi = await prisma.labReview.create({
    data: {
      labId: labAi.id,
      authorId: students[0].id,
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

  const reviewRobotics1 = await prisma.labReview.create({
    data: {
      labId: labRobotics.id,
      authorId: students[0].id,
      content: "Hands-on robotics projects and supportive senior students.",
      recommend: true,
      atmos: 5,
      lectr: 4,
      paper: 4,
      salry: 3,
      persn: 5,
      visib: Visibility.PUBLIC,
    },
  });

  const reviewRobotics2 = await prisma.labReview.create({
    data: {
      labId: labRobotics.id,
      authorId: students[1].id,
      content: "Good research topics but workload can be heavy near deadlines.",
      recommend: true,
      atmos: 4,
      lectr: 4,
      paper: 5,
      salry: 3,
      persn: 4,
      visib: Visibility.PUBLIC,
    },
  });

  const reviewVision1 = await prisma.labReview.create({
    data: {
      labId: labVision.id,
      authorId: students[0].id,
      content: "Strong focus on deep learning and computer vision benchmarks.",
      recommend: true,
      atmos: 4,
      lectr: 5,
      paper: 5,
      salry: 3,
      persn: 4,
      visib: Visibility.PUBLIC,
    },
  });

  const reviewVision2 = await prisma.labReview.create({
    data: {
      labId: labVision.id,
      authorId: students[1].id,
      content: "Lots of opportunities to publish if you are proactive.",
      recommend: true,
      atmos: 4,
      lectr: 4,
      paper: 5,
      salry: 3,
      persn: 4,
      visib: Visibility.PUBLIC,
    },
  });

  const reviewNlp1 = await prisma.labReview.create({
    data: {
      labId: labNlp.id,
      authorId: students[0].id,
      content: "Interesting NLP projects and good access to GPU resources.",
      recommend: true,
      atmos: 4,
      lectr: 4,
      paper: 4,
      salry: 3,
      persn: 4,
      visib: Visibility.PUBLIC,
    },
  });

  const reviewSystems1 = await prisma.labReview.create({
    data: {
      labId: labSystems.id,
      authorId: students[0].id,
      content: "Research topics are challenging but rewarding.",
      recommend: true,
      atmos: 3,
      lectr: 4,
      paper: 4,
      salry: 3,
      persn: 3,
      visib: Visibility.PUBLIC,
    },
  });

  const reviewBio1 = await prisma.labReview.create({
    data: {
      labId: labBio.id,
      authorId: students[0].id,
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

  const privateReview1 = await prisma.labReview.create({
    data: {
      labId: labAi.id,
      authorId: students[1].id,
      content: "Worst lab ever; Don't recommend joining it.",
      recommend: false,
      atmos: 2,
      lectr: 1,
      paper: 1,
      salry: 1,
      persn: 3,
      visib: Visibility.PRIVATE,
    }
  })

  const privateReview2 = await prisma.labReview.create({
    data: {
      labId: labAi.id,
      authorId: students[2].id,
      content: "Interesting subject, but professor doesn't have work ethics at all.",
      recommend: false,
      atmos: 1,
      lectr: 3,
      paper: 4,
      salry: 1,
      persn: 1,
      visib: Visibility.PRIVATE,
    }
  })

  const protectedReview = await prisma.labReview.create({
    data: {
      labId: labAi.id,
      authorId: students[1].id,
      content: "Enthusiastic professor and Great equipments.",
      recommend: true,
      atmos: 5,
      lectr: 4,
      paper: 4,
      salry: 4,
      persn: 5,
      visib: Visibility.PROTECT,
    }
  })

  await prisma.labReviewReport.create({
    data: {
      reviewId: reviewAi.id,
      reporterId: admins[0].id,
      reason: "PI requested clarification.",
      detail: "Check for sensitive information in the review.",
    },
  });

  await prisma.labReviewReport.create({
    data: {
      reviewId: reviewAi.id,
      reporterId: admins[1].id,
      reason: "PI requested clarification again.",
      detail: "Check for still remaining sensitive information in the review.",
    },
  });

  const Board1 = await prisma.board.create({
    data: {
      nameKo: "홍보게시판",
      nameEn: "Promotion board",
      description: "A board for Promotion of lab, subject, etc.",
      sortOrder: 1,
    }
  });

  const EmptyBoard = await prisma.board.create({
    data: {
      nameKo: "연구소게시판",
      nameEn: "Lab discussion",
      description: "A board for promotion or information of your lab activity.",
      sortOrder: 2,
    }
  });

  const CrowdedBoard = await prisma.board.create({
    data: {
      nameKo: "자유게시판",
      nameEn: "General discussion",
      description: "A board for any theme and subject.",
      sortOrder: 3,
    }
  });

  const updatedBoard = await prisma.board.create({
    data: {
      nameKo: "베스트게시판",
      nameEn: "Top articles",
      description: "A board featuring the most popular and highly rated posts.",
      sortOrder: 4,
      updatedBy: { connect: { id: admins[0].id } },
      updatedAt: new Date(Date.now() + 1000),
    }
  });

  const inactiveBoard = await prisma.board.create({
    data: {
      nameKo: "추가게시판",
      nameEn: "temp",
      description: "A board under construction.",
      sortOrder: 5,
      isActive: false,
    }
  })

  const PinnedArticle1 = await prisma.article.create({
    data: {
      boardId: Board1.id,
      title: "Rules and guide",
      content: "1. Be Nice - Treat community members with respect.\n 2. Illegal Activities - Do not engage in illegal activities",
      authorId: admins[0].id,
      authorIp: "211.36.128.45",
      isPinned: true,
    }
  })

  const PinnedArticle2 = await prisma.article.create({
    data: {
      boardId: Board1.id,
      title: "Announcement",
      content: "Board will be closed in 2027-03-31 3:00 ~ 6:00 UTC+9 for maintenance.",
      authorId: admins[0].id,
      authorIp: "2406:5900:abcd:1234::21",
      isPinned: true,
    }
  })

  const Article1 = await prisma.article.create({
    data: {
      boardId: Board1.id,
      title: "Example title",
      content: "Example content.",
      authorId: students[3].id,
      authorIp: "106.102.91.203",
    }
  });

  const UpdatedArticle = await prisma.article.create({
    data: {
      boardId: Board1.id,
      title: "Changed title",
      content: "Changed content.",
      authorId: students[4].id,
      authorIp: "121.165.73.52",
      updatedAt: new Date(Date.now() + 1000),
    }
  });

  const UpdatedArticleHistory = await prisma.articleHistory.create({
    data: {
      articleId: UpdatedArticle.id,
      oldTitle: "Original title",
      oldContent: "Original content",
      oldAuthorIp: "121.165.73.52",
      editedAt: new Date(Date.now() + 1000),
    }
  })

  const DeletedArticle = await prisma.article.create({
    data: {
      boardId: Board1.id,
      title: "Deleted title",
      content: "Deleted content.",
      authorId: students[3].id,
      authorIp: "2001:2d8:abcd:44::19",
      isHidden: true,
      deletedAt: new Date(Date.now() + 1000),
    }
  })

  const deletedUserArticle = await prisma.article.create({
    data: {
      boardId: Board1.id,
      title: "Author is gone.",
      content: "Author is not a user anymore.",
      authorId: null,
      authorIp: "2001:2d8:abcd:44::19",
      isHidden: false,
    }
  })

  const Articles = [];

  for (let i = 0; i < 100; i++) {
    Articles.push({
      boardId: CrowdedBoard.id,
      title: `Title number ${i}`,
      content: `Content number ${i}`,
      authorId: admins[0].id,
      authorIp: "1.1.1.1",
    })
  }

  await prisma.article.createMany({
    data: Articles
  })

  const comment1 = await prisma.comment.create({
    data: {
      articleId: Article1.id,
      authorId: students[5].id,
      authorIp: "175.223.44.18",
      content: "Example comment."
    }
  })

  const selfComment = await prisma.comment.create({
    data: {
      articleId: Article1.id,
      authorId: students[3].id,
      authorIp: "106.102.91.203",
      content: "Comment left by author of article."
    }
  })

  const updatedComment = await prisma.comment.create({
    data: {
      articleId: Article1.id,
      authorId: students[5].id,
      authorIp: "2001:2d8:abcd:44::19",
      content: "Updated Comment.",
      updatedAt: new Date(Date.now() + 1000),
    }
  })

  const updatedCommentHistory = await prisma.commentHistory.create({
    data: {
      commentId: updatedComment.id,
      oldAuthorIp: "2406:5900:2211:77::88",
      oldContent: "Original comment.",
      editedAt: new Date(Date.now() + 1000),
    }
  })

  const deletedComment = await prisma.comment.create({
    data: {
      articleId: Article1.id,
      authorId: students[5].id,
      authorIp: "118.235.12.97",
      content: "Deleted Comment.",
      isHidden: true,
      deletedAt: new Date(Date.now() + 1000),
    }
  })

  const reply = await prisma.comment.create({
    data: {
      articleId: Article1.id,
      authorId: students[5].id,
      authorIp: "2406:da14:8899:1::7",
      content: "Example reply.",
      parentId: comment1.id,
    }
  })

  const updatedReply = await prisma.comment.create({
    data: {
      articleId: Article1.id,
      authorId: students[5].id,
      authorIp: "118.165.12.76",
      content: "Updated reply.",
      parentId: comment1.id,
      updatedAt: new Date(Date.now() + 1000),
    }
  })

  const updatedReplyHistory = await prisma.commentHistory.create({
    data: {
      commentId: updatedReply.id,
      oldAuthorIp: "::ffff:192.168.0.1",
      oldContent: "Original reply.",
      editedAt: new Date(Date.now() + 1000000),
    }
  })

  const selfReply = await prisma.comment.create({
    data: {
      articleId: Article1.id,
      authorId: students[3].id,
      authorIp: "255.255.255.255",
      content: "Reply left by author of article.",
      parentId: selfComment.id,
    }
  })

  const deletedReply = await prisma.comment.create({
    data: {
      articleId: Article1.id,
      authorId: students[5].id,
      authorIp: "172.0.0.1",
      content: "Deleted Comment.",
      parentId: deletedComment.id,
      isHidden: true,
      deletedAt: new Date(Date.now() + 1000),
    }
  })

  const deletedUserComment = await prisma.comment.create({
    data: {
      articleId: deletedUserArticle.id,
      authorId: null,
      authorIp: "175.223.44.18",
      content: "Author of this comment is gone too."
    }
  })

  const replyOfReply = await prisma.comment.create({
    data: {
      articleId: Article1.id,
      authorId: students[4].id,
      authorIp: "172.0.0.8",
      content: "Example reply of reply.",
      parentId: reply.id,
    }
  })

  const replyOfReplyOfReply = await prisma.comment.create({
    data: {
      articleId: Article1.id,
      authorId: students[5].id,
      authorIp: "45.67.89.101",
      content: "Example reply of reply of reply.",
      parentId: replyOfReply.id,
    }
  })

  await prisma.emote.createMany({
    data: [
      {
        articleId: Article1.id,
        userId: students[3].id,
        kind: EmoteKind.EMPATHY,
        place: EmotePlace.ARTICLE,
      },
      {
        articleId: Article1.id,
        userId: students[4].id,
        kind: EmoteKind.EMPATHY,
        place: EmotePlace.ARTICLE,
      },
      {
        articleId: Article1.id,
        userId: students[5].id,
        kind: EmoteKind.EMPATHY,
        place: EmotePlace.ARTICLE,
      },
      {
        articleId: Article1.id,
        userId: students[3].id,
        kind: EmoteKind.LIKE,
        place: EmotePlace.ARTICLE,
      },
      {
        articleId: Article1.id,
        userId: students[4].id,
        kind: EmoteKind.CHEER,
        place: EmotePlace.ARTICLE,
      },
      {
        articleId: Article1.id,
        userId: students[5].id,
        kind: EmoteKind.QUESTION,
        place: EmotePlace.ARTICLE,
      },
    ]
  })

  await prisma.articleTag.createMany({
    data: [
      {
        articleId: Article1.id,
        tagId: tags[0].id,
      },
      {
        articleId: Article1.id,
        tagId: tags[3].id,
      },
      {
        articleId: Article1.id,
        tagId: tags[5].id,
      },
      {
        articleId: PinnedArticle2.id,
        tagId: tags[19].id,
      },
      {
        articleId: PinnedArticle2.id,
        tagId: tags[20].id,
      },
      {
        articleId: PinnedArticle1.id,
        tagId: tags[18].id,
      },
    ]
  })

  console.log("Seed completed", {
    users: [admins[0].id, admins[1].id, piUsers[0].id, piUsers[1].id, piUsers[2].id, students[0].id, students[1].id, students[2].id, students[3].id, students[4].id, students[5].id],
    universities: [seoulUni.id, yonseiUni.id, koreaUni.id, kaist.id, berkeleyUni.id, oxfordUni.id],
    labs: [labAi.id, labBio.id, labRobotics.id, labVision.id, labNlp.id, labSystems.id],
    subjects: [subjectAi.id, subjectBio.id, subjectRobotics.id, subjectMl.id, subjectVision.id, subjectNlp.id],
    piApplicationId: [pendingPiApplication.id, approvedPiApplication.id, rejectedPiApplication.id],
    piId: [pis[0].id, pis[1].id, pis[2].id, pis[3].id,],
    reviewId: [reviewAi.id, reviewRobotics1.id, reviewRobotics2.id, reviewVision1.id, reviewVision2.id, reviewNlp1.id, reviewSystems1.id, reviewBio1.id, privateReview1.id, privateReview2.id, protectedReview.id],
    boardId: [Board1.id, EmptyBoard.id, CrowdedBoard.id, updatedBoard.id, inactiveBoard.id],
    articleId: [PinnedArticle1.id, PinnedArticle2.id, Article1.id, UpdatedArticle.id, DeletedArticle.id, deletedUserArticle.id],
    commentId: [comment1.id, selfComment.id, updatedComment.id, deletedComment.id, reply.id, updatedReply.id, selfReply.id, deletedReply.id, deletedUserComment.id, replyOfReply.id, replyOfReplyOfReply.id],
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
