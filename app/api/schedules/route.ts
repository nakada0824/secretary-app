import { NextRequest, NextResponse } from 'next/server';
import { listEvents, createEvent, isWritableCalendar } from '@/lib/icloud';
import { calendarErrorResponse } from '@/lib/calendar-api';

// 予定は iCloud カレンダー（自宅・職場・シフトボード）に直接読み書きする

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()));
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1));

  // JST の月初 0:00 〜 翌月初 0:00
  const start = new Date(`${year}-${String(month).padStart(2, '0')}-01T00:00:00+09:00`);
  const next = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const end = new Date(`${next.y}-${String(next.m).padStart(2, '0')}-01T00:00:00+09:00`);

  try {
    return NextResponse.json(await listEvents(start, end));
  } catch (e) {
    return calendarErrorResponse(e);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!isWritableCalendar(body.calendar)) {
    return NextResponse.json({ error: '登録先（職場・自宅）を選んでください' }, { status: 400 });
  }
  if (!body.title?.trim() || !body.start_time) {
    return NextResponse.json({ error: 'タイトルと開始日時は必須です' }, { status: 400 });
  }

  try {
    const event = await createEvent(body.calendar, {
      title: body.title.trim(),
      start_time: body.start_time,
      end_time: body.end_time || null,
      all_day: body.all_day === true,
      location: body.location || null,
      description: body.description || null,
    });
    return NextResponse.json(event, { status: 201 });
  } catch (e) {
    return calendarErrorResponse(e);
  }
}
