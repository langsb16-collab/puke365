# CHUANQI PUKE - 전문가급 텍사스 홀덤 포커

## 📋 프로젝트 개요

- **이름**: CHUANQI PUKE (传奇扑克)
- **타입**: WSOP 스타일 포커 게임 (Progressive Web App)
- **목표**: 최고 수준의 카지노 경험을 웹에서 제공
- **기술 스택**: React 19 + TypeScript + Vite + Tailwind CSS + Motion (Framer Motion) + Cloudflare Pages

## 🌐 접속 URL

- **메인 도메인**: https://puke365.biz
- **WWW 도메인**: https://www.puke365.biz
- **Cloudflare Pages**: https://puke365biz.pages.dev
- **최신 배포**: https://276b8822.puke365biz.pages.dev
- **GitHub 저장소**: https://github.com/langsb16-collab/puke365

## ✨ 완료된 기능

### 🎮 게임 시스템
- ✅ **9인 텍사스 홀덤 포커** (1명 유저 + 8명 AI)
- ✅ **멀티 게임 모드**: 토너먼트, 캐시게임, Sit & Go
- ✅ **AI 플레이어** 시스템 (Win Rate 기반 의사결정)
- ✅ **핸드 평가 시스템** (로얄 플러시 ~ 하이 카드)
- ✅ **Blind 레벨 시스템** (자동 증가)
- ✅ **올인/레이즈/콜/체크/폴드** 액션
- ✅ **팟 관리** (메인 팟 + 사이드 팟)
- ✅ **승자 결정 및 칩 분배**
- ✅ **게임 로그** (핸드 히스토리)

### 🔊 사운드 시스템 (NEW!)
- ✅ **AudioManager 통합** (Web Audio API 기반)
- ✅ **Welcome 사운드** - 앱 시작 시 웰컴 차임
- ✅ **Chip 사운드** - 베팅/레이즈 시 칩 소리
- ✅ **Card 사운드** - 플롭/턴/리버 시 카드 플립
- ✅ **Win 사운드** - 승리 시 축하 사운드
- ✅ **합성 사운드** - 외부 파일 불필요 (Oscillator 기반)

### 🎨 UI/UX
- ✅ **WSOP 스타일 디자인** (프리미엄 카지노 느낌)
- ✅ **20개 캐릭터** 선택 시스템 (아바타 + 플레이 스타일)
- ✅ **실시간 채팅 시스템** (이모지 16개 포함)
- ✅ **애니메이션** (Motion/Framer Motion)
- ✅ **Confetti 효과** (승리 시)
- ✅ **프로그레스 바** (레벨 진행)
- ✅ **글로벌 잭팟** 배너
- ✅ **플레이어 통계** (VPIP, PFR, 승률)
- ✅ **토너먼트 순위표**

### 📱 반응형 레이아웃 (NEW!)
- ✅ **PC 풀 디스플레이** (좌우 빈공간 없이 화면 85% 사용)
  - 테이블 너비: `w-[85vw]` (max-width 제약 없음)
  - 사이드 패널 활용 (채팅, 핸드 히스토리)
  - 모든 UI 요소 표시
- ✅ **모바일 스크롤 최적화**
  - 세로 스크롤 지원 (`overflow-y-auto`)
  - 테이블 너비: `w-[95vw]` (편안한 스크롤)
  - 간결한 UI (중요 요소만 표시)
- ✅ **태블릿 레이아웃**
  - 가로 레이아웃
  - 슬라이드 채팅 패널
  - Raise 슬라이더 표시

### 🌍 다국어 지원
- ✅ **3개 언어**: 한국어 (ko), 영어 (en), 중문 (zh)
- ✅ **실시간 언어 전환** (드롭다운)
- ✅ **캐릭터명/플레이 스타일 번역**
- ✅ **게임 로그 다국어**

### 💾 데이터 구조

#### Player 모델
```typescript
{
  id: string;              // 'user' or 'ai-{n}'
  name: string;            // Character name
  chips: number;           // Current chips
  cards: Card[];           // [Card, Card]
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  currentBet: number;
  isFolded: boolean;
  isAllIn: boolean;
  isAI: boolean;
  avatar: string;          // Avatar URL (DiceBear API)
  characterId: number;     // 0-19
  lastAction?: string;     // 'fold' | 'check' | 'call' | 'raise' | 'all-in'
  winRate?: number;        // AI decision factor
  stats: {
    vpip: number;          // Voluntarily Put $ In Pot %
    pfr: number;           // Pre-Flop Raise %
    handsPlayed: number;
    handsWon: number;
  };
}
```

#### GameState 모델
```typescript
{
  mode: 'lobby' | 'tournament' | 'cash' | 'sit-and-go';
  players: Player[];
  communityCards: Card[];
  pot: number;
  sidePots: { amount: number; players: string[] }[];
  currentBet: number;
  dealerIndex: number;
  activePlayerIndex: number;
  stage: 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';
  deck: Card[];
  blindLevel: number;
  smallBlind: number;
  bigBlind: number;
  logs: { key: string; params?: any }[];
  timer: number;
}
```

## 🎯 현재 기능 URI 요약

### 게임 진입
- `/` → Lobby (게임 모드 선택)
- `initGame('tournament')` → 토너먼트 시작
- `initGame('cash')` → 캐시 게임 시작
- `initGame('sit-and-go')` → Sit & Go 시작

### 게임 액션
- `handleAction('fold')` → 폴드
- `handleAction('check')` → 체크 (베팅 없음)
- `handleAction('call')` → 콜 (현재 베팅 매치)
- `handleAction('raise', amount)` → 레이즈
- `handleAction('raise', user.chips)` → 올인

### UI 네비게이션
- `setLobbyView('main')` → 메인 로비
- `setLobbyView('tournaments')` → 토너먼트 목록
- `setLobbyView('characters')` → 캐릭터 선택
- `setLobbyView('stats')` → 통계 화면
- `setLobbyView('shop')` → 상점

### 채팅
- `handleSendMessage(message)` → 메시지 전송
- `setIsChatOpen(true/false)` → 채팅 패널 토글

### 언어
- `setLanguage('ko' | 'en' | 'zh')` → 언어 변경

## 🚧 미구현 기능

### 백엔드/네트워크
- ❌ 실시간 멀티플레이어 (Socket.io/WebRTC)
- ❌ 서버 사이드 게임 로직
- ❌ 데이터베이스 연동 (D1/KV)
- ❌ 인증 시스템 (OAuth/JWT)
- ❌ 리더보드 (글로벌 랭킹)

### 고급 게임 기능
- ❌ 사이드 팟 로직 완전 구현
- ❌ 토너먼트 페이아웃 구조
- ❌ Rebuy/Add-on 시스템
- ❌ 프라이빗 테이블 생성
- ❌ 핸드 리플레이
- ❌ 자동 폴드/Check 버튼

### UI/UX 개선
- ❌ 카드 스퀴즈 애니메이션 (전체 구현)
- ❌ 음성 메시지/통화
- ❌ 자동 번역 (Google Translate API)
- ❌ 프로파일 편집
- ❌ 아바타 업로드
- ❌ 커스텀 테마
- ❌ 배경 음악 (BGM)

### 상점/결제
- ❌ 인앱 결제 (Stripe/PayPal)
- ❌ 칩 패키지 구매
- ❌ VIP 멤버십
- ❌ 스킨/테마 구매

## 🔧 기술 아키텍처

### 프론트엔드
- **React 19**: 최신 Concurrent Features
- **TypeScript 5**: 타입 안전성
- **Vite 6**: 초고속 번들러
- **Tailwind CSS 4**: 유틸리티 퍼스트 CSS
- **Motion (Framer Motion)**: 애니메이션 라이브러리
- **Lucide React**: 아이콘

### 배포
- **Cloudflare Pages**: Edge 배포 (글로벌 CDN)
- **Wrangler**: Cloudflare CLI
- **Git**: 버전 관리

### 사운드
- **Web Audio API**: 브라우저 네이티브 오디오
- **Oscillator**: 합성 사운드 생성 (파일 불필요)

## 📊 주요 알고리즘

### 1. 핸드 평가 (PokerUtils.evaluateHand)
7장(플레이어 카드 2장 + 커뮤니티 카드 5장)에서 최고 5장 조합 계산:
- Royal Flush: 10,000점
- Straight Flush: 9,000점
- Four of a Kind: 8,000점
- Full House: 7,000점
- Flush: 6,000점
- Straight: 5,000점
- Three of a Kind: 4,000점
- Two Pair: 3,000점
- One Pair: 2,000점
- High Card: 0-100점

### 2. Win Rate 계산 (Monte Carlo 시뮬레이션)
```typescript
calculateWinRate(playerCards, communityCards, numOpponents, iterations = 1000)
```
- 남은 카드로 가능한 결과 시뮬레이션
- 상대방 핸드 랜덤 생성
- 승률 반환 (0.0 ~ 1.0)

### 3. AI 의사결정
```typescript
getAIDecision(player, gameState, winRate)
```
- **Tight-Aggressive**: 높은 Win Rate에서만 레이즈
- **Loose-Aggressive**: 자주 레이즈
- **Tight-Passive**: 보수적 플레이
- **Loose-Passive**: 자주 콜

## 🎮 사용자 가이드

### 게임 시작
1. 웹사이트 접속: https://puke365.biz
2. 캐릭터 선택 (20개 중 선택)
3. 게임 모드 선택 (토너먼트/캐시게임)
4. "Play" 버튼 클릭

### 게임 플레이
1. **자신의 턴**이 되면 버튼 활성화
2. **액션 선택**:
   - **Fold**: 카드 버림 (판에서 하차)
   - **Check**: 베팅하지 않고 넘김 (베팅 없을 때만)
   - **Call**: 현재 베팅 매치
   - **Raise**: 베팅 금액 증가 (슬라이더 사용)
   - **All-In**: 모든 칩 베팅
3. **AI 턴**: 자동으로 진행 (1.5초 대기)
4. **승자 결정**: 최고 핸드 보유자 또는 마지막 남은 플레이어

### 채팅 사용
1. 우측 채팅 아이콘 클릭
2. 메시지 입력 후 Enter
3. 이모지 버튼으로 이모지 전송
4. AI 플레이어가 70% 확률로 응답

### 언어 변경
1. 우측 상단 Globe 아이콘 클릭
2. 언어 선택 (한국어/English/中文)

## 🚀 배포 상태

- **플랫폼**: Cloudflare Pages
- **상태**: ✅ Active
- **마지막 배포**: 2026-03-17 23:52 UTC
- **Git Commit**: `dd86aa7` - "Add AudioManager with synthesized sounds + PC full-width layout"
- **빌드 시간**: ~6초
- **번들 크기**:
  - HTML: 0.40 kB (gzip: 0.27 kB)
  - CSS: 75.72 kB (gzip: 10.97 kB)
  - JS: 410.47 kB (gzip: 128.60 kB)

## 📈 권장 다음 단계

### 1단계: 네트워크 기능 (우선순위 높음)
- [ ] Socket.io 또는 WebSocket 서버 구축
- [ ] 실시간 멀티플레이어 동기화
- [ ] Cloudflare D1 데이터베이스 연동
- [ ] 사용자 인증 시스템

### 2단계: 게임 로직 고도화
- [ ] 사이드 팟 완전 구현
- [ ] 토너먼트 구조 (블라인드 증가, 페이아웃)
- [ ] 핸드 히스토리 저장/리플레이
- [ ] 통계 트래킹 (장기)

### 3단계: UI/UX 개선
- [ ] 카드 스퀴즈 애니메이션 완성
- [ ] 음성 채팅 (Agora/Vivox)
- [ ] 자동 번역 (Google Translate API)
- [ ] 프로필 커스터마이징

### 4단계: 수익화
- [ ] Stripe/PayPal 결제 연동
- [ ] 칩 패키지 판매
- [ ] VIP 멤버십
- [ ] 광고 시스템 (선택적)

## 📞 기술 지원

- **GitHub Issues**: https://github.com/langsb16-collab/puke365/issues
- **Repository**: https://github.com/langsb16-collab/puke365

## 📝 라이선스

Private Repository (비공개)

---

**Last Updated**: 2026-03-17
**Version**: 1.0.0
**Author**: langsb16-collab
