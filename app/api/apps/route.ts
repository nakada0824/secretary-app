import { NextRequest, NextResponse } from 'next/server';
import { supabase, USER_ID } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .eq('user_id', USER_ID)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name?.trim() || !body.url?.trim()) {
    return NextResponse.json({ error: 'name and url are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('apps')
    .insert({
      user_id: USER_ID,
      name: body.name.trim(),
      url: body.url.trim(),
      keywords: Array.isArray(body.keywords) ? body.keywords : [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
