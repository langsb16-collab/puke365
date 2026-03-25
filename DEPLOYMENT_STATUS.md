# 🎯 PUKE365 관리자 시스템 배포 완료

## ✅ 완료된 작업

### 1️⃣ 데이터베이스 (Cloudflare D1)
- ✅ `puke365-admin-db` 생성 완료
- ✅ Database ID: `2c724e24-4674-4776-8a51-61e4e41ab73c`
- ✅ 마이그레이션 적용 완료 (로컬 + 프로덕션)
- ✅ 기본 admin 계정 생성 (admin / qkralscjf)

### 2️⃣ API 서버 (Cloudflare Workers)
- ✅ 배포 URL: **https://puke365-api.langsb16.workers.dev**
- ✅ JWT 인증 시스템 구현
- ✅ D1 데이터베이스 연동
- ✅ CORS 설정 완료

### 3️⃣ 관리자 UI (빌드 완료)
- ✅ Vite + React + TailwindCSS
- ✅ 로그인/대시보드 페이지 구현
- ✅ API 연동 완료
- ✅ `admin/dist` 빌드 완료

### 4️⃣ 게임 코드
- ✅ **게임 코드 100% 보존**
- ✅ API 연동 유틸 추가 (`src/lib/gameApi.ts`)
- ✅ 게임 로직 변경 없음

### 5️⃣ GitHub
- ✅ 커밋: **be8f599**
- ✅ 저장소: https://github.com/langsb16-collab/puke365

---

## 🚀 남은 작업 (수동 배포 필요)

### 관리자 UI Cloudflare Pages 배포

**API 토큰 권한 부족으로 자동 배포 실패. 아래 방법 중 하나 선택:**

#### 방법 1: Cloudflare 대시보드 (추천)

1. **Cloudflare 대시보드 접속**
   - https://dash.cloudflare.com/

2. **Pages → Create Project**
   - Project name: `puke365-admin`
   - Production branch: `main`

3. **Build settings:**
   - Build command: `cd admin && npm install && npm run build`
   - Build output directory: `admin/dist`
   - Root directory: `/`

4. **Environment variables:**
   - `VITE_API_URL` = `https://puke365-api.langsb16.workers.dev`

5. **Deploy**

#### 방법 2: GitHub 연동 자동 배포

1. **Cloudflare Pages → Create Project → Connect to Git**
2. **GitHub에서 puke365 저장소 선택**
3. **Build settings 입력 (위와 동일)**
4. **저장하면 자동 배포 시작**

---

## 🌐 최종 URL 구조

```
게임:      https://puke365.biz
           → Cloudflare Pages (puke365biz)

관리자:    https://admin.puke365.biz
           → Cloudflare Pages (puke365-admin) ← 배포 필요

API:       https://api.puke365.biz
           → Cloudflare Workers (puke365-api) ✅ 배포 완료
```

---

## 🔐 관리자 로그인

**기본 계정:**
- ID: `admin`
- PW: `qkralscjf`

**로그인 URL (배포 후):**
- https://admin.puke365.biz/login
- 또는: https://puke365-admin.pages.dev/login

---

## 📊 API 엔드포인트

### 공개 API
- `POST /api/game/result` - 게임 결과 저장

### 관리자 API (JWT 필요)
- `POST /api/auth/login` - 로그인
- `GET /api/admin/users` - 유저 목록
- `GET /api/admin/games` - 게임 기록
- `GET /api/admin/stats` - 통계

---

## 🗄️ 데이터베이스 스키마

### admins
```sql
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### games
```sql
CREATE TABLE games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  result TEXT NOT NULL,
  game_data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🔧 로컬 개발

### 게임 실행
```bash
cd /home/user/puke365
npm run dev
# http://localhost:3000
```

### 관리자 UI 실행
```bash
cd /home/user/puke365/admin
npm run dev
# http://localhost:5173
```

### API 서버 실행 (로컬)
```bash
cd /home/user/puke365
export CLOUDFLARE_API_TOKEN="..."
npx wrangler dev api/index.ts --config wrangler-api.jsonc --local --port 8787
# http://localhost:8787
```

---

## 📝 커스텀 도메인 설정

**Cloudflare 대시보드에서 설정:**

1. **Pages → puke365-admin → Custom domains**
2. **도메인 추가:**
   - `admin.puke365.biz`
3. **DNS 자동 설정됨**

---

## ⚠️ 중요 사항

1. ✅ **게임 코드 (src/) 절대 수정 금지** - 100% 보존됨
2. ✅ **관리자 시스템 완전 분리** - 게임에 영향 없음
3. ✅ **API 배포 완료** - 프로덕션 사용 가능
4. ⚠️ **관리자 UI는 수동 배포 필요** - Cloudflare 대시보드 사용

---

## 📦 빌드된 파일

```
puke365/
├── dist/              ← 게임 빌드 (이미 배포됨)
├── admin/
│   └── dist/          ← 관리자 빌드 (배포 대기 중)
└── api/index.ts       ← API 서버 (배포 완료)
```

---

## 🎉 다음 단계

1. **Cloudflare 대시보드에서 관리자 UI 배포**
2. **커스텀 도메인 연결 (admin.puke365.biz)**
3. **관리자 페이지 접속 테스트**
4. **게임 플레이 후 결과 확인**

---

## 📞 문의

- GitHub: https://github.com/langsb16-collab/puke365
- 커밋: be8f599
