# PUKE365 Admin System

## 📋 프로젝트 구조

```
puke365/
├── src/                  # 게임 코드 (절대 수정 금지)
├── admin/                # 관리자 UI (Vite + React)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── DashboardPage.tsx
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── api/                  # API 서버 (Cloudflare Workers + Hono)
│   └── index.ts
├── migrations/           # DB 마이그레이션
│   └── 0001_init_admin.sql
└── wrangler-api.jsonc    # Cloudflare Workers 설정
```

## 🚀 설치 및 실행

### 1. Dependencies 설치

```bash
# 게임 (루트)
npm install

# 관리자 UI
cd admin
npm install

# API는 별도 설치 불필요 (Cloudflare Workers)
```

### 2. 로컬 개발

#### 게임 실행
```bash
npm run dev
# http://localhost:3000
```

#### 관리자 UI 실행
```bash
cd admin
npm run dev
# http://localhost:5173
```

#### API 서버 실행
```bash
# D1 데이터베이스 생성
cd /home/user/puke365
export CLOUDFLARE_API_TOKEN="cfut_D2yxK1125FDLQZzXsF1Y6Dx0PVancG8yO8KjQjpRda2db1a0"
npx wrangler d1 create puke365-admin-db

# wrangler-api.jsonc에 database_id 입력

# 마이그레이션 실행 (로컬)
npx wrangler d1 migrations apply puke365-admin-db --local --config wrangler-api.jsonc

# API 서버 실행 (로컬)
npx wrangler dev api/index.ts --config wrangler-api.jsonc --local --port 8787
# http://localhost:8787
```

## 🌐 Cloudflare 배포

### 1. D1 데이터베이스 설정

```bash
# 프로덕션 DB 생성
export CLOUDFLARE_API_TOKEN="cfut_D2yxK1125FDLQZzXsF1Y6Dx0PVancG8yO8KjQjpRda2db1a0"
npx wrangler d1 create puke365-admin-db

# 출력된 database_id를 wrangler-api.jsonc에 입력

# 프로덕션 마이그레이션
npx wrangler d1 migrations apply puke365-admin-db --config wrangler-api.jsonc
```

### 2. JWT Secret 설정

```bash
# 프로덕션 JWT Secret 설정
npx wrangler secret put JWT_SECRET --config wrangler-api.jsonc
# 입력: 강력한 랜덤 문자열 (예: openssl rand -base64 32)
```

### 3. API 서버 배포

```bash
npx wrangler deploy api/index.ts --config wrangler-api.jsonc
# 배포 URL: https://puke365-api.<account>.workers.dev
```

### 4. 게임 배포 (Cloudflare Pages)

```bash
npm run build
npx wrangler pages deploy dist --project-name puke365biz
# 배포 URL: https://puke365biz.pages.dev
```

### 5. 관리자 배포 (Cloudflare Pages)

```bash
cd admin
npm run build

# 관리자 프로젝트 생성
npx wrangler pages project create puke365-admin --production-branch main

# 배포
npx wrangler pages deploy dist --project-name puke365-admin
# 배포 URL: https://puke365-admin.pages.dev
```

### 6. 커스텀 도메인 설정

**Cloudflare 대시보드**에서:
- `puke365.biz` → `puke365biz.pages.dev` (게임)
- `admin.puke365.biz` → `puke365-admin.pages.dev` (관리자)
- `api.puke365.biz` → `puke365-api.<account>.workers.dev` (API)

## 🔐 관리자 로그인

**기본 계정:**
- ID: `admin`
- PW: `qkralscjf`

## 📊 API 엔드포인트

### 공개 API
- `POST /api/game/result` - 게임 결과 저장

### 관리자 API (JWT 필요)
- `POST /api/auth/login` - 로그인
- `GET /api/admin/users` - 유저 목록
- `GET /api/admin/games` - 게임 기록
- `GET /api/admin/stats` - 통계

## 🗄️ 데이터베이스 스키마

### admins
- id (INTEGER, PRIMARY KEY)
- username (TEXT, UNIQUE)
- password (TEXT, bcrypt hash)
- created_at (DATETIME)

### users
- id (TEXT, PRIMARY KEY)
- username (TEXT)
- created_at (DATETIME)

### games
- id (INTEGER, PRIMARY KEY)
- user_id (TEXT, FK)
- score (INTEGER)
- result (TEXT: 'win'|'lose')
- game_data (TEXT, JSON)
- created_at (DATETIME)

## 🔧 환경 변수

### 관리자 UI (.env)
```
VITE_API_URL=https://api.puke365.biz
```

### API (Cloudflare Workers)
```
JWT_SECRET=<strong-random-secret>
```

## 📝 주의사항

- ⚠️ **게임 코드 (src/) 절대 수정 금지**
- ⚠️ **관리자 시스템은 완전히 분리되어 있음**
- ⚠️ **API는 Cloudflare Workers에서만 실행**
- ⚠️ **JWT Secret은 반드시 프로덕션에서 변경**

## 🎯 최종 배포 URL

- 게임: https://puke365.biz
- 관리자: https://admin.puke365.biz
- API: https://api.puke365.biz
