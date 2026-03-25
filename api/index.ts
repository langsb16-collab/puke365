import { Hono } from 'hono';
import { cors } from 'hono/cors';
import bcrypt from 'bcryptjs';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS 설정
app.use('*', cors({
  origin: ['https://puke365.biz', 'https://www.puke365.biz', 'https://admin.puke365.biz', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// JWT 생성 함수
async function createJWT(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    ),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

// JWT 검증 함수
async function verifyJWT(token: string, secret: string): Promise<any> {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    const signature = await crypto.subtle.sign(
      'HMAC',
      await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ),
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
    if (encodedSignature !== expectedSignature) {
      throw new Error('Invalid signature');
    }
    return JSON.parse(atob(encodedPayload));
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// JWT 미들웨어
const requireAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.substring(7);
  try {
    const payload = await verifyJWT(token, c.env.JWT_SECRET);
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// ============================================================
// AUTH ROUTES
// ============================================================

// 로그인
app.post('/api/auth/login', async (c) => {
  const { username, password } = await c.req.json();

  const admin = await c.env.DB.prepare(
    'SELECT * FROM admins WHERE username = ?'
  ).bind(username).first();

  if (!admin) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const isValid = await bcrypt.compare(password, admin.password as string);
  if (!isValid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const token = await createJWT(
    { id: admin.id, username: admin.username },
    c.env.JWT_SECRET
  );

  return c.json({ token, username: admin.username });
});

// ============================================================
// GAME ROUTES
// ============================================================

// 게임 결과 저장 (공개 API)
app.post('/api/game/result', async (c) => {
  const { userId, score, result, gameData } = await c.req.json();

  // 유저가 없으면 생성
  await c.env.DB.prepare(
    'INSERT OR IGNORE INTO users (id, username) VALUES (?, ?)'
  ).bind(userId, userId).run();

  // 게임 결과 저장
  const insertResult = await c.env.DB.prepare(
    'INSERT INTO games (user_id, score, result, game_data) VALUES (?, ?, ?, ?)'
  ).bind(userId, score, result, JSON.stringify(gameData)).run();

  return c.json({ 
    success: true, 
    gameId: insertResult.meta.last_row_id 
  });
});

// ============================================================
// ADMIN ROUTES (JWT 필요)
// ============================================================

// 전체 유저 목록
app.get('/api/admin/users', requireAuth, async (c) => {
  const users = await c.env.DB.prepare(
    'SELECT id, username, created_at FROM users ORDER BY created_at DESC'
  ).all();

  return c.json({ users: users.results });
});

// 게임 기록 조회
app.get('/api/admin/games', requireAuth, async (c) => {
  const limit = c.req.query('limit') || '100';
  
  const games = await c.env.DB.prepare(`
    SELECT 
      g.id, 
      g.user_id, 
      g.score, 
      g.result, 
      g.game_data,
      g.created_at,
      u.username
    FROM games g
    LEFT JOIN users u ON g.user_id = u.id
    ORDER BY g.created_at DESC
    LIMIT ?
  `).bind(parseInt(limit)).all();

  return c.json({ games: games.results });
});

// 통계
app.get('/api/admin/stats', requireAuth, async (c) => {
  const totalUsers = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM users'
  ).first();

  const totalGames = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM games'
  ).first();

  const winRate = await c.env.DB.prepare(`
    SELECT 
      COUNT(CASE WHEN result = 'win' THEN 1 END) * 100.0 / COUNT(*) as rate
    FROM games
  `).first();

  return c.json({
    totalUsers: totalUsers?.count || 0,
    totalGames: totalGames?.count || 0,
    winRate: winRate?.rate || 0
  });
});

export default app;
