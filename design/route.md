
개발목적
김박사넷 오각형 부활

# routes

사용도구
psql
docker+k8s+argocd
next.js+prisma
prettier+github
nodemailer

라우트
/field/create: 분야 생성 페이지

## Labatory

/lab: 랩 리스트 메인페이지 (lab or university 검색)

/lab/new: 랩 생성 페이지
/lab/:lab_id: 랩 상세 페이지 
/lab/:lab_id/review/new: 랩 리뷰 페이지
/lab/:lab_id/review/edit/:review_id: 리뷰 수정 페이지
/lab/edit/:lab_id: 랩 수정
/api/lab/new: 랩 생성
/api/lab/edit: 랩 내용 수정
/api/lab/review/new: 랩 리뷰 생성
/api/lab/review/edit: 리뷰 수정
/api/lab/review/report: 리뷰 신고

/univ/new: 대학 생성 페이지
/univ/:univ_id: 대학 상세 페이지
/univ/edit/:univ_id: 대학 수정
/api/univ/new: 대학 생성
/api/univ/edit: 대학 수정

/field: 분야별 보기 메인페이지

/v/prof/:lab_id: 랩 리뷰 결과 요약 페이지
/v/field/:field_id
/v/lab/:lad_id

/img/prof/:professor_id

## Bulletin Board System

/bbs/[id]/read
/bbs/[id]/create

/article/[id]/read
/article/[id]/update
/article/[id]/comment/create

대응
