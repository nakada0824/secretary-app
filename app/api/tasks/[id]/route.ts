import { NextRequest, NextResponse } from 'next/server';
import { supabase, USER_ID } from '@/lib/supabase';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const update = body.completed === true
    ? { ...body, completed_at: new Date().toISOString() }
    : body.completed === false
      ? { ...body, completed_at: null }
      : body;

  const { data, error } = await supabase
    .from('tasks')
    .update(update)
    .eq('id', id)
    .eq('user_id', USER_ID)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', USER_ID);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
