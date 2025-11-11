# 블로그 배포 시스템 (Blog Deployment System)

## 프로젝트 개요

블로그 운영자가 여러 블로그 계정을 관리하고, 배포 현황 및 수익을 한눈에 확인할 수 있는 통합 관리 시스템

## 주요 기능

- 🎯 다중 플랫폼 통합 관리 (네이버, 티스토리, 벨로그, 브런치)
- 💰 실시간 수익 모니터링 (일/주/월/연간)
- 📱 모바일 우선 반응형 디자인
- 📊 데이터 기반 의사결정 지원
- 🔒 보안 강화 (JWT, 암호화, 2FA)

## 기술 스택

### Frontend
- React 18.2
- Tailwind CSS 3.3
- React Router 6
- Axios
- Recharts
- Framer Motion

### Backend
- Node.js 20 LTS
- Express.js
- PostgreSQL 15
- Redis
- JWT + bcrypt

### DevOps
- Frontend: Netlify
- Backend: Railway
- Database: Supabase
- CI/CD: GitHub Actions

## 시작하기

### Frontend 개발 서버

```bash
cd frontend
npm install
npm run dev
```

### Backend 개발 서버

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## 프로젝트 구조

```
blog-deployment-admin/
├── frontend/              # React 프론트엔드
│   ├── src/
│   │   ├── components/   # 재사용 가능한 컴포넌트
│   │   ├── pages/        # 페이지 컴포넌트
│   │   ├── contexts/     # React Context
│   │   ├── hooks/        # Custom Hooks
│   │   ├── utils/        # 유틸리티 함수
│   │   └── styles/       # 전역 스타일
│   └── public/           # 정적 파일
│
├── backend/              # Express 백엔드
│   ├── src/
│   │   ├── controllers/  # API 컨트롤러
│   │   ├── models/       # 데이터 모델
│   │   ├── routes/       # API 라우트
│   │   ├── middleware/   # 미들웨어
│   │   ├── services/     # 비즈니스 로직
│   │   └── utils/        # 유틸리티
│   └── tests/            # 테스트
│
└── docs/                 # 문서
```

## 로드맵

- ✅ Phase 1: MVP (프로토타입, UI/UX)
- 🚧 Phase 2: 백엔드 개발 (인증, API, DB)
- 📋 Phase 3: 고급 기능 (자동화, AI)
- 🔮 Phase 4: 확장 (모바일 앱, 마켓플레이스)

## 라이선스

MIT License

## 문의

contact@blog-system.com
