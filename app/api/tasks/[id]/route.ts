import { NextRequest, NextResponse } from 'next/server';
import { updateRow, deleteRow, pickColumns, errorResponse, type Task } from '@/lib/db';

const COLUMNS = ['title', 'description', 'priority', 'deadline', 'completed'] as const;

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const update = pickColumns(body, COLUMNS);
  if (body.completed === true) update.completed_at = new Date().toISOString();
  if (body.completed === false) update.completed_at = null;

  try {
    const data = await updateRow<Task>('tasks', id, update);
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteRow('tasks', id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
