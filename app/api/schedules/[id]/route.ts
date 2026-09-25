import { NextRequest, NextResponse } from 'next/server';
import { updateRow, deleteRow, pickColumns, errorResponse, type Schedule } from '@/lib/db';

const COLUMNS = ['title', 'description', 'start_time', 'end_time', 'location'] as const;

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  try {
    const data = await updateRow<Schedule>('schedules', id, pickColumns(body, COLUMNS));
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteRow('schedules', id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
