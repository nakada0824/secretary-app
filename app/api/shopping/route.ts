import { NextRequest, NextResponse } from 'next/server';
import { supabase, USER_ID } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('shopping_list')
    .select('*')
    .eq('user_id', USER_ID)
    .order('checked')
    .order('created_at');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase
    .from('shopping_list')
    .insert({ ...body, user_id: USER_ID, checked: false })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
