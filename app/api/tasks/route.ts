import { NextRequest, NextResponse } from 'next/server';
import { query, insertRow, pickColumns, errorResponse, USER_ID, type Task } from '@/lib/db';

const COLUMNS = ['title', 'description', 'priority', 'deadline'] as const;

export async function GET() {
  try {
    const data = await query<Task>(
      `SELECT * FROM tasks WHERE user_id = $1
       ORDER BY completed, priority DESC, deadline ASC NULLS LAST`,
      [USER_ID]
    );
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const data = await insertRow<Task>('tasks', {
      ...pickColumns(body, COLUMNS),
      user_id: USER_ID,
      completed: false,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
