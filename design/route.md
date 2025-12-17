
## Users

/user/oauth/google: google callback 처리
/user/apply: 회원가입 페이지
/user/login: 로그인 페이지
/user/me: 내 정보 조회 및 수정 페이지

/admin/user/:user_id: 유저 정보 페이지
/admin/user 전체 유저 조회 및 로그 페이지

/api/user/me: 내 정보 조회
/api/user/edit: 내 정보 수정

## Labatory

### PI

/pi/new: PI 신청 페이지
/pi/:pi_id: PI 메인 페이지
/pi/edit/:pi_id: PI 수정 페이지

/admin/pi/application: PI 신청 대기자 리스트
/admin/pi: PI 목록

/api/pi/new
/api/pi/edit

### Labatories

/lab: 랩 리스트 메인페이지 (lab or university or subject 검색)

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

### Universities

/univ/new: 대학 생성 페이지
/univ/:univ_id: 대학 상세 페이지
/univ/edit/:univ_id: 대학 수정
/api/univ/new: 대학 생성
/api/univ/edit: 대학 수정

### Subjects

/subj/new: 연구주제 생성 페이지
/sibj/merge: 연구주제 병합 페이지
/subj/list: 연구주제 검색 페이지
/subj/:subj_id: 연구주제 상세 페이지 (해당 연구주제가 등록된 lab 조회)

/api/subj/new: 연구주제 생성
/api/subj/edit: 연구주제 내용 수정
/api/subj/merge: 두 연구주제 병합

## Builetin Board System

/bbs/:bbs_id/list
/bbs/:bbs_id/new

/article/:article_id/
/article/:article_id/update

/api/article/update
/api/article/new
/api/article/comment/new

