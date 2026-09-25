import { NextRequest, NextResponse } from 'next/server';
import { query, insertRow, errorResponse, USER_ID, type Memo } from '@/lib/db';

export async function GET() {
  try {
    const data = await query<Memo>(
      'SELECT * FROM memos WHERE user_id = $1 ORDER BY created_at DESC',
      [USER_ID]
    );
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  try {
    const data = await insertRow<Memo>('memos', {
      user_id: USER_ID,
      content: body.content.trim(),
      tags: Array.isArray(body.tags) ? body.tags : [],
    });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
