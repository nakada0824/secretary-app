import { NextResponse } from 'next/server';
import { CalendarError } from '@/lib/icloud';

// iCloud 操作のエラーを API レスポンスにする。想定内のもの（読み取り専用の予定など）は 400
export function calendarErrorResponse(e: unknown) {
  if (e instanceof CalendarError) return NextResponse.json({ error: e.message }, { status: 400 });
  console.error('[calendar api]', e);
  return NextResponse.json({ error: 'iCloud カレンダーとの通信に失敗しました' }, { status: 502 });
}
