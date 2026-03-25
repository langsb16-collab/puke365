import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function DashboardPage({ onLogout }) {
  const [menu, setMenu] = useState('회원관리')
  const [users, setUsers] = useState([])
  const [games, setGames] = useState([])

  const menus = ['종합현황', '회원관리', '게임방관리', '로봇관리', '공지사항', '설정']

  useEffect(() => {
    if (menu === '회원관리') {
      api.getUsers().then(setUsers)
    } else if (menu === '게임방관리') {
      api.getGames().then(setGames)
    }
  }, [menu])

  const handleKick = async (userId) => {
    if (confirm('이 회원을 강퇴하시겠습니까?')) {
      await api.kickUser(userId)
      setUsers(users.filter(u => u.id !== userId))
    }
  }

  const handleAssignBot = async (roomId) => {
    await api.assignBot(1, roomId)
    alert('봇이 투입되었습니다')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-black/40 border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-black font-black text-xl">P</span>
          </div>
          <h1 className="text-2xl font-black">PUKE365 관리자</h1>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-bold transition"
        >
          로그아웃
        </button>
      </header>

      <div className="flex">
        <aside className="w-64 bg-black/20 border-r border-white/10 min-h-screen p-4">
          <nav className="space-y-2">
            {menus.map(m => (
              <button
                key={m}
                onClick={() => setMenu(m)}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${
                  menu === m
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {m}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-6">{menu}</h2>

          {menu === '회원관리' && (
            <div className="bg-white/5 rounded-xl p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3">ID</th>
                    <th className="text-left py-3">이름</th>
                    <th className="text-left py-3">칩</th>
                    <th className="text-left py-3">상태</th>
                    <th className="text-left py-3">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b border-white/5">
                      <td className="py-3">{user.id}</td>
                      <td className="py-3">{user.username}</td>
                      <td className="py-3">{user.chips?.toLocaleString()}</td>
                      <td className="py-3">{user.status}</td>
                      <td className="py-3">
                        <button
                          onClick={() => handleKick(user.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm font-bold transition"
                        >
                          강퇴
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {menu === '게임방관리' && (
            <div className="grid grid-cols-3 gap-4">
              {games.map(game => (
                <div key={game.id} className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-bold mb-2">{game.table_name}</h3>
                  <p className="text-white/60 text-sm mb-3">팟: {game.pot}</p>
                  <button
                    onClick={() => handleAssignBot(game.id)}
                    className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded transition"
                  >
                    봇 투입
                  </button>
                </div>
              ))}
            </div>
          )}

          {menu === '종합현황' && (
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
                <h3 className="text-blue-300 font-bold mb-2">총 회원</h3>
                <p className="text-4xl font-black">{users.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
                <h3 className="text-green-300 font-bold mb-2">활성 게임</h3>
                <p className="text-4xl font-black">{games.length}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-6 border border-yellow-500/30">
                <h3 className="text-yellow-300 font-bold mb-2">총 칩</h3>
                <p className="text-4xl font-black">
                  {users.reduce((sum, u) => sum + (u.chips || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
