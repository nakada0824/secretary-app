import { NextRequest, NextResponse } from 'next/server';
import { updateEvent, deleteEvent, type EventInput } from '@/lib/icloud';
import { calendarErrorResponse } from '@/lib/calendar-api';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const changes: Partial<EventInput> = {};
  if (body.title !== undefined) changes.title = String(body.title).trim();
  if (body.start_time !== undefined) changes.start_time = body.start_time;
  if (body.end_time !== undefined) changes.end_time = body.end_time || null;
  if (body.all_day !== undefined) changes.all_day = body.all_day === true;
  if (body.location !== undefined) changes.location = body.location || null;
  if (body.description !== undefined) changes.description = body.description || null;

  try {
    return NextResponse.json(await updateEvent(id, changes));
  } catch (e) {
    return calendarErrorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteEvent(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return calendarErrorResponse(e);
  }
}
