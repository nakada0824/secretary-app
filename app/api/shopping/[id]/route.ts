import { NextRequest, NextResponse } from 'next/server';
import { updateRow, deleteRow, pickColumns, errorResponse, type ShoppingItem } from '@/lib/db';

const COLUMNS = ['item', 'quantity', 'checked'] as const;

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  try {
    const data = await updateRow<ShoppingItem>('shopping_list', id, pickColumns(body, COLUMNS));
    if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteRow('shopping_list', id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
