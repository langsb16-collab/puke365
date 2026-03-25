import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { Users, GamepadIcon, TrendingUp, LogOut, RefreshCw } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalGames: number;
  winRate: number;
}

interface User {
  id: string;
  username: string;
  created_at: string;
}

interface Game {
  id: number;
  user_id: string;
  username: string;
  score: number;
  result: string;
  created_at: string;
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'games'>('overview');
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [statsData, usersData, gamesData] = await Promise.all([
        apiClient.getStats(),
        apiClient.getUsers(),
        apiClient.getGames(50),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setGames(gamesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      // 인증 실패 시 로그인 페이지로
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    apiClient.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-black font-black text-lg">P</span>
            </div>
            <div>
              <h1 className="text-xl font-black">PUKE365 Admin</h1>
              <p className="text-xs text-white/60">관리자 대시보드</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="새로고침"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-black/20 border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { key: 'overview', label: '개요', icon: TrendingUp },
              { key: 'users', label: '유저', icon: Users },
              { key: 'games', label: '게임 기록', icon: GamepadIcon },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-6 py-3 font-bold transition-colors ${
                  activeTab === key
                    ? 'bg-yellow-500 text-black'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-black mb-6">통계 개요</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-400" />
                  <span className="text-3xl font-black text-blue-400">
                    {stats?.totalUsers || 0}
                  </span>
                </div>
                <p className="text-white/80 font-bold">총 유저 수</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <GamepadIcon className="w-8 h-8 text-green-400" />
                  <span className="text-3xl font-black text-green-400">
                    {stats?.totalGames || 0}
                  </span>
                </div>
                <p className="text-white/80 font-bold">총 게임 수</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                  <span className="text-3xl font-black text-yellow-400">
                    {stats?.winRate?.toFixed(1) || 0}%
                  </span>
                </div>
                <p className="text-white/80 font-bold">승률</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-black mb-6">유저 목록</h2>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold">유저 ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">이름</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-6 py-4 text-sm font-mono">{user.id}</td>
                      <td className="px-6 py-4 text-sm">{user.username}</td>
                      <td className="px-6 py-4 text-sm text-white/60">
                        {new Date(user.created_at).toLocaleString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'games' && (
          <div>
            <h2 className="text-2xl font-black mb-6">게임 기록 (최근 50개)</h2>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">유저</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">점수</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">결과</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">시간</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => (
                    <tr key={game.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-6 py-4 text-sm font-mono">{game.id}</td>
                      <td className="px-6 py-4 text-sm">{game.username || game.user_id}</td>
                      <td className="px-6 py-4 text-sm font-bold">{game.score}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            game.result === 'win'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {game.result}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60">
                        {new Date(game.created_at).toLocaleString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
