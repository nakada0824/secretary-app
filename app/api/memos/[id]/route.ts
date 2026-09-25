import { NextRequest, NextResponse } from 'next/server';
import { updateRow, deleteRow, errorResponse, type Memo } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  try {
    const data = await updateRow<Memo>('memos', id, {
      content: body.content.trim(),
      tags: Array.isArray(body.tags) ? body.tags : [],
    });
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteRow('memos', id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
