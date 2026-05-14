import { NextRequest, NextResponse } from 'next/server';
import { supabase, USER_ID } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1));

  const start = new Date(year, month - 1, 1).toISOString();
  const end   = new Date(year, month, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('user_id', USER_ID)
    .gte('start_time', start)
    .lte('start_time', end)
    .order('start_time');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase
    .from('schedules')
    .insert({ ...body, user_id: USER_ID })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
