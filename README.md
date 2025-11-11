# 블로그 배포 시스템 (Blog Deployment System)

## 프로젝트 개요

블로그 운영자가 여러 블로그 계정을 관리하고, 배포 현황 및 수익을 한눈에 확인할 수 있는 통합 관리 시스템

## 주요 기능

- 🎯 다중 플랫폼 통합 관리 (네이버, 티스토리, 벨로그, 브런치)
- 💰 실시간 수익 모니터링 (일/주/월/연간)
- 📱 모바일 우선 반응형 디자인
- 📊 데이터 기반 의사결정 지원
- 🔒 보안 강화 (JWT, 암호화)

## 기술 스택

### Frontend
- **Framework**: React 18.2 + Vite
- **Styling**: Tailwind CSS 4.0
- **Routing**: React Router 6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Font Awesome 6
- **Animation**: Framer Motion

### Backend
- **Runtime**: Node.js 20 LTS (ES Modules)
- **Framework**: Express.js 5
- **Database**: PostgreSQL 15 + Sequelize ORM
- **Cache**: Redis
- **Authentication**: JWT + bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, compression

### DevOps
- **Frontend**: Netlify
- **Backend**: Railway (준비 중)
- **Database**: PostgreSQL (로컬/Supabase)
- **Version Control**: Git + GitHub

## 시작하기

### 사전 요구사항

- Node.js 20 LTS 이상
- PostgreSQL 15 이상
- Redis (선택사항)
- npm or yarn

### Frontend 개발 서버

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend는 `http://localhost:5173`에서 실행됩니다.

### Backend 개발 서버

```bash
cd backend
npm install
cp .env.example .env

# .env 파일에서 데이터베이스 설정 수정
# DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD

npm run dev
```

Backend API는 `http://localhost:5000`에서 실행됩니다.

## API 엔드포인트

### 인증 (Authentication)
```
POST   /api/v1/auth/signup          # 회원가입
POST   /api/v1/auth/login           # 로그인
GET    /api/v1/auth/me              # 현재 사용자 정보
PUT    /api/v1/auth/profile         # 프로필 수정
PUT    /api/v1/auth/password        # 비밀번호 변경
```

### 계정 관리 (Accounts)
```
GET    /api/v1/accounts             # 계정 목록 (필터링, 정렬, 페이징)
GET    /api/v1/accounts/:id         # 계정 상세
POST   /api/v1/accounts             # 계정 추가
PUT    /api/v1/accounts/:id         # 계정 수정
DELETE /api/v1/accounts/:id         # 계정 삭제
POST   /api/v1/accounts/:id/sync    # 계정 동기화
```

### 수익 관리 (Revenue)
```
GET    /api/v1/revenue/summary      # 수익 요약
GET    /api/v1/revenue/daily        # 일별 수익
GET    /api/v1/revenue/monthly      # 월별 수익
```

### 포스트 관리 (Posts)
```
GET    /api/v1/posts                # 포스트 목록
GET    /api/v1/posts/:id            # 포스트 상세
POST   /api/v1/posts                # 포스트 작성
```

## 프로젝트 구조

```
blog-deployment-admin/
├── frontend/                    # React 프론트엔드
│   ├── src/
│   │   ├── components/         # 재사용 가능한 컴포넌트
│   │   │   ├── auth/           # 인증 관련
│   │   │   ├── dashboard/      # 대시보드 컴포넌트
│   │   │   ├── layout/         # 레이아웃 (Sidebar, Header)
│   │   │   └── common/         # 공통 컴포넌트
│   │   ├── pages/              # 페이지 컴포넌트
│   │   ├── contexts/           # React Context (AuthContext)
│   │   ├── hooks/              # Custom Hooks
│   │   ├── utils/              # 유틸리티 함수
│   │   └── services/           # API 서비스
│   └── public/                 # 정적 파일
│
├── backend/                     # Express 백엔드
│   ├── src/
│   │   ├── controllers/        # API 컨트롤러
│   │   │   ├── auth.controller.js
│   │   │   └── account.controller.js
│   │   ├── models/             # Sequelize 모델
│   │   │   ├── User.js
│   │   │   └── Account.js
│   │   ├── routes/             # API 라우트
│   │   ├── middleware/         # 미들웨어 (auth, error)
│   │   ├── services/           # 비즈니스 로직
│   │   ├── config/             # 설정 파일
│   │   └── utils/              # 유틸리티
│   └── tests/                  # 테스트
│
├── blog-deployment-system-documentation.md  # 상세 기획서
└── README.md                   # 프로젝트 소개
```

## 데이터베이스 스키마

### Users 테이블
- id (UUID, PK)
- username (String, Unique)
- email (String, Unique)
- phone (String)
- password_hash (String)
- is_active (Boolean)
- last_login (DateTime)

### Accounts 테이블
- id (UUID, PK)
- user_id (UUID, FK)
- name (String)
- platform (Enum: naver, tistory, velog, brunch)
- url (String, Unique)
- credentials_encrypted (Text)
- api_key (String)
- post_count (Integer)
- daily_revenue (Decimal)
- weekly_revenue (Decimal)
- monthly_revenue (Decimal)
- last_synced (DateTime)
- is_active (Boolean)

## 개발 현황

### ✅ 완료된 기능
- React + Vite + Tailwind CSS 프론트엔드 설정
- 로그인/회원가입 UI
- 대시보드 레이아웃 (수익 카드, 계정 리스트)
- 반응형 네비게이션 (데스크톱/모바일)
- Express.js 백엔드 서버
- PostgreSQL 데이터베이스 연동
- JWT 인증 시스템
- RESTful API 엔드포인트
- 계정 CRUD 작업

### 🚧 진행 중
- 수익 데이터 집계 로직
- 포스트 관리 시스템
- 플랫폼별 API 연동
- Netlify/Railway 배포

### 📋 예정
- Redis 캐싱
- 자동 포스팅 시스템
- AI 콘텐츠 생성
- 수익 예측 모델
- 모바일 앱

## 환경 변수

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api/v1
```

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blog_deployment
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

## 로드맵

- ✅ **Phase 1**: MVP (프로토타입, UI/UX, 인증 시스템)
- 🚧 **Phase 2**: 백엔드 개발 (API, 데이터 집계, 플랫폼 연동)
- 📋 **Phase 3**: 고급 기능 (자동화, AI, 예측 모델)
- 🔮 **Phase 4**: 확장 (모바일 앱, 마켓플레이스)

## 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 문의

- 이메일: contact@blog-system.com
- 문서: [상세 기획서](./blog-deployment-system-documentation.md)

---

**Built with ❤️ by Blog Deployment System Team**
