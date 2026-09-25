import { NextRequest, NextResponse } from 'next/server';
import { updateRow, deleteRow, errorResponse, type App } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.name?.trim())   updates.name     = body.name.trim();
  if (body.url?.trim())    updates.url      = body.url.trim();
  if (Array.isArray(body.keywords)) updates.keywords = body.keywords;

  try {
    const data = await updateRow<App>('apps', params.id, updates);
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteRow('apps', params.id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return errorResponse(e);
  }
}
