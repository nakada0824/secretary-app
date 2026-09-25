import { NextRequest, NextResponse } from 'next/server';
import { query, insertRow, pickColumns, errorResponse, USER_ID, type Schedule } from '@/lib/db';

const COLUMNS = ['title', 'description', 'start_time', 'end_time', 'location'] as const;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1));

  const start = new Date(year, month - 1, 1).toISOString();
  const end   = new Date(year, month, 0, 23, 59, 59).toISOString();

  try {
    const data = await query<Schedule>(
      `SELECT * FROM schedules
       WHERE user_id = $1 AND start_time >= $2 AND start_time <= $3
       ORDER BY start_time`,
      [USER_ID, start, end]
    );
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const data = await insertRow<Schedule>('schedules', { ...pickColumns(body, COLUMNS), user_id: USER_ID });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
