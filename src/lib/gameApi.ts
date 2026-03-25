const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.puke365.biz';

export async function saveGameResult(userId: string, score: number, result: 'win' | 'lose', gameData?: any) {
  try {
    await fetch(`${API_BASE_URL}/api/game/result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        score,
        result,
        gameData,
      }),
    });
  } catch (error) {
    console.error('Failed to save game result:', error);
    // 에러가 나도 게임은 계속 진행
  }
}
