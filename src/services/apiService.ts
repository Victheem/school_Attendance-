// Unified Client API Service Layer
// Communicates with backend REST API when online (/api/*)
// And works seamlessly with local IndexedDB for offline-first resilience

const API_BASE = '/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class ApiService {
  private token: string | null = null;
  private currentRole = 'SUPER_ADMIN';
  private currentUserName = 'Mrs. Aisha Bello';

  setAuth(role: string, name: string, token?: string) {
    this.currentRole = role;
    this.currentUserName = name;
    if (token) this.token = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-User-Role': this.currentRole,
      'X-User-Name': this.currentUserName,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async checkHealth(): Promise<{ status: string; database: string; provider: string } | null> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async postAttendance(record: any): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/attendance`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(record),
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async syncOfflineBatch(events: any[]): Promise<{ status: string; processed: number; duplicatesIgnored: number } | null> {
    try {
      const res = await fetch(`${API_BASE}/attendance/sync`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ events }),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async savePerson(person: any): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/people`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(person),
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
