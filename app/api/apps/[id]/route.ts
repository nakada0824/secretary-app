import { NextRequest, NextResponse } from 'next/server';
import { supabase, USER_ID } from '@/lib/supabase';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.name?.trim())   updates.name     = body.name.trim();
  if (body.url?.trim())    updates.url      = body.url.trim();
  if (Array.isArray(body.keywords)) updates.keywords = body.keywords;

  const { data, error } = await supabase
    .from('apps')
    .update(updates)
    .eq('id', params.id)
    .eq('user_id', USER_ID)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabase
    .from('apps')
    .delete()
    .eq('id', params.id)
    .eq('user_id', USER_ID);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
