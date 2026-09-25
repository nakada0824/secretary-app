import { NextRequest, NextResponse } from 'next/server';
import { query, insertRow, pickColumns, errorResponse, USER_ID, type ShoppingItem } from '@/lib/db';

const COLUMNS = ['item', 'quantity'] as const;

export async function GET() {
  try {
    const data = await query<ShoppingItem>(
      'SELECT * FROM shopping_list WHERE user_id = $1 ORDER BY checked, created_at',
      [USER_ID]
    );
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const data = await insertRow<ShoppingItem>('shopping_list', {
      ...pickColumns(body, COLUMNS),
      user_id: USER_ID,
      checked: false,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
