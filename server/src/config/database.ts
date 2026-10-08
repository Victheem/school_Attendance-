// Server Database Configuration & In-Memory / PostgreSQL Connector
import { Pool } from 'pg';

export interface DatabaseAdapter {
  isPostgres(): boolean;
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  testConnection(): Promise<{ connected: boolean; provider: string; error?: string }>;
}

let pgPool: Pool | null = null;

if (process.env.DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  } catch (err) {
    console.warn('[PostgreSQL] Could not initialize pool, falling back to embedded operational store:', err);
    pgPool = null;
  }
}

// In-Memory operational store as embedded fallback for portable school server mode
export const memoryStore = {
  users: [] as any[],
  people: [] as any[],
  students: [] as any[],
  classes: [] as any[],
  shifts: [] as any[],
  attendance: [] as any[],
  devices: [] as any[],
  settings: {} as any,
  leave_requests: [] as any[],
  audit_logs: [] as any[],
  sync_events: [] as any[],
};

export const db: DatabaseAdapter = {
  isPostgres() {
    return pgPool !== null;
  },

  async testConnection() {
    if (!pgPool) {
      return { connected: true, provider: 'Embedded Standalone Server DB (PostgreSQL-Ready)' };
    }
    try {
      const client = await pgPool.connect();
      const res = await client.query('SELECT NOW() as now, version() as version');
      client.release();
      return { 
        connected: true, 
        provider: 'PostgreSQL Relational DB', 
        version: res.rows[0]?.version 
      };
    } catch (err: any) {
      return { 
        connected: false, 
        provider: 'PostgreSQL (Connection Failed, fallback active)', 
        error: err.message 
      };
    }
  },

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (pgPool) {
      try {
        const res = await pgPool.query(sql, params);
        return res.rows;
      } catch (err) {
        console.error('[PostgreSQL Error]:', err);
        throw err;
      }
    }

    // Embedded store simulator
    return [];
  }
};
