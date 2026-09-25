import { NextRequest, NextResponse } from 'next/server';
import { query, insertRow, errorResponse, USER_ID, type App } from '@/lib/db';

export async function GET() {
  try {
    const data = await query<App>(
      'SELECT * FROM apps WHERE user_id = $1 ORDER BY created_at ASC',
      [USER_ID]
    );
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name?.trim() || !body.url?.trim()) {
    return NextResponse.json({ error: 'name and url are required' }, { status: 400 });
  }

  try {
    const data = await insertRow<App>('apps', {
      user_id: USER_ID,
      name: body.name.trim(),
      url: body.url.trim(),
      keywords: Array.isArray(body.keywords) ? body.keywords : [],
    });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
