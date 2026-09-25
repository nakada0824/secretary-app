import { neon, types, type NeonQueryFunction } from '@neondatabase/serverless';

export const USER_ID = process.env.WEB_USER_ID!;

// Supabase時代と同じく日付・日時は文字列で返す
// DATE → 'YYYY-MM-DD'、TIMESTAMPTZ → ISO 8601 文字列
const DATE_OID = 1082;
const TIMESTAMPTZ_OID = 1184;
const parseTimestamptz = types.getTypeParser(TIMESTAMPTZ_OID);
const typeParsers = {
  getTypeParser: ((oid: number, format?: 'text' | 'binary') => {
    if (oid === DATE_OID) return (v: string) => v;
    if (oid === TIMESTAMPTZ_OID) return (v: string) => new Date(parseTimestamptz(v)).toISOString();
    return types.getTypeParser(oid, format);
  }) as typeof types.getTypeParser,
};

let client: NeonQueryFunction<false, false> | null = null;

export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  client ??= neon(process.env.DATABASE_URL!);
  return (await client.query(text, params, { types: typeParsers })) as T[];
}

// 画面から送られてきた値のうち、書き込んでよい列だけを残す
export function pickColumns(body: Record<string, unknown>, columns: readonly string[]) {
  return Object.fromEntries(
    Object.entries(body).filter(([k, v]) => columns.includes(k) && v !== undefined)
  );
}

export async function insertRow<T>(table: string, row: Record<string, unknown>): Promise<T> {
  const cols = Object.keys(row);
  const placeholders = cols.map((_, i) => `$${i + 1}`);
  const [inserted] = await query<T>(
    `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
    Object.values(row)
  );
  return inserted;
}

// 自分（USER_ID）の行だけを更新する。該当なしなら null
export async function updateRow<T>(
  table: string,
  id: string,
  changes: Record<string, unknown>
): Promise<T | null> {
  const cols = Object.keys(changes);
  if (!cols.length) {
    const [row] = await query<T>(`SELECT * FROM ${table} WHERE id = $1 AND user_id = $2`, [id, USER_ID]);
    return row ?? null;
  }
  const sets = cols.map((c, i) => `${c} = $${i + 3}`);
  const [row] = await query<T>(
    `UPDATE ${table} SET ${sets.join(', ')} WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, USER_ID, ...Object.values(changes)]
  );
  return row ?? null;
}

export async function deleteRow(table: string, id: string): Promise<void> {
  await query(`DELETE FROM ${table} WHERE id = $1 AND user_id = $2`, [id, USER_ID]);
}

export function errorResponse(e: unknown) {
  return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: number;
  deadline?: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface ShoppingItem {
  id: string;
  user_id: string;
  item: string;
  quantity?: string;
  checked: boolean;
  created_at: string;
}

export interface Memo {
  id: string;
  user_id: string;
  content: string;
  tags: string[];
  created_at: string;
}

export interface App {
  id: string;
  user_id: string;
  name: string;
  url: string;
  keywords: string[];
  created_at: string;
}
