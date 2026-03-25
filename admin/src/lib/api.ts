const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://puke365-api.langsb16.workers.dev';

interface LoginResponse {
  token: string;
  username: string;
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
  game_data: string;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalGames: number;
  winRate: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('admin_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('로그인 실패');
    }

    const data = await response.json();
    this.token = data.token;
    localStorage.setItem('admin_token', data.token);
    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('admin_token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/api/admin/users`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return data.users;
  }

  async getGames(limit: number = 100): Promise<Game[]> {
    const response = await fetch(`${this.baseUrl}/api/admin/games?limit=${limit}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch games');
    }

    const data = await response.json();
    return data.games;
  }

  async getStats(): Promise<Stats> {
    const response = await fetch(`${this.baseUrl}/api/admin/stats`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
