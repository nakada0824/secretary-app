import { NextRequest, NextResponse } from 'next/server';
import { supabase, USER_ID } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', USER_ID)
    .order('completed')
    .order('priority', { ascending: false })
    .order('deadline', { ascending: true, nullsFirst: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...body, user_id: USER_ID, completed: false })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
