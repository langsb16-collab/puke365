const API_URL = 'https://puke365-api.langsb16.workers.dev'

export const api = {
  async login(username, password) {
    const res = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    return res.json()
  },

  async getUsers() {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/admin/users`, {
      headers: { 'Authorization': token }
    })
    return res.json()
  },

  async getGames() {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/admin/games`, {
      headers: { 'Authorization': token }
    })
    return res.json()
  },

  async kickUser(userId) {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/admin/user/kick`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ userId })
    })
    return res.json()
  },

  async assignBot(botId, roomId) {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/admin/bot/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ botId, roomId })
    })
    return res.json()
  }
}
