export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center">
          <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-black font-black text-3xl">P</span>
          </div>
          <h1 className="text-4xl font-black mb-4">PUKE365 Admin</h1>
          <p className="text-white/60 mb-8">관리자 시스템이 배포되었습니다</p>
          
          <div className="bg-black/40 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-yellow-400">✅ 배포 완료</h2>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-2">
                <span className="text-green-400">●</span>
                <span>API 서버: https://puke365-api.langsb16.workers.dev</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">●</span>
                <span>게임: https://puke365.biz</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">●</span>
                <span>관리자: 배포 진행 중...</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <h3 className="font-bold mb-2 text-blue-300">기본 로그인 정보</h3>
            <p className="text-sm text-white/80">ID: admin</p>
            <p className="text-sm text-white/80">PW: qkralscjf</p>
          </div>
        </div>
      </div>
    </div>
  );
}
