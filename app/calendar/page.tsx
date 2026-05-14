'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MouseEvent } from 'react';
import type { Schedule } from '@/lib/supabase';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function toJST(iso: string) {
  return new Date(new Date(iso).toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
}

function fmt(iso: string) {
  return toJST(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(iso: string) {
  return toJST(iso).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
}

interface ModalState {
  open: boolean;
  date: string;
  schedule: Schedule | null;
}

const emptyForm = { title: '', description: '', start_time: '', end_time: '', location: '' };

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear]       = useState(today.getFullYear());
  const [month, setMonth]     = useState(today.getMonth() + 1);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [modal, setModal]     = useState<ModalState>({ open: false, date: '', schedule: null });
  const [form, setForm]       = useState(emptyForm);
  const [saving, setSaving]   = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/schedules?year=${year}&month=${month}`);
    if (res.ok) setSchedules(await res.json());
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const firstDay  = new Date(year, month - 1, 1).getDay();
  const daysCount = new Date(year, month, 0).getDate();

  const schedulesOnDay = (day: number) =>
    schedules.filter(s => toJST(s.start_time).getDate() === day);

  const openAdd = (day: number) => {
    const d = new Date(year, month - 1, day, 9, 0);
    const iso = d.toISOString().slice(0, 16);
    setForm({ ...emptyForm, start_time: iso, end_time: '' });
    setModal({ open: true, date: `${month}/${day}`, schedule: null });
  };

  const openEdit = (s: Schedule, e: MouseEvent) => {
    e.stopPropagation();
    setForm({
      title: s.title,
      description: s.description ?? '',
      start_time: s.start_time.slice(0, 16),
      end_time: s.end_time ? s.end_time.slice(0, 16) : '',
      location: s.location ?? '',
    });
    setModal({ open: true, date: fmtDate(s.start_time), schedule: s });
  };

  const closeModal = () => setModal({ open: false, date: '', schedule: null });

  const save = async () => {
    if (!form.title || !form.start_time) return;
    setSaving(true);
    const body = {
      title: form.title,
      description: form.description || null,
      start_time: new Date(form.start_time).toISOString(),
      end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
      location: form.location || null,
    };
    if (modal.schedule) {
      await fetch(`/api/schedules/${modal.schedule.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      await fetch('/api/schedules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    await load();
    setSaving(false);
    closeModal();
  };

  const remove = async () => {
    if (!modal.schedule) return;
    setSaving(true);
    await fetch(`/api/schedules/${modal.schedule.id}`, { method: 'DELETE' });
    await load();
    setSaving(false);
    closeModal();
  };

  const selectedSchedules = selectedDay ? schedulesOnDay(selectedDay) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">{year}年{month}月</h1>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="btn-secondary px-3 py-1.5">‹</button>
          <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1); setSelectedDay(null); }} className="btn-secondary text-xs px-3 py-1.5">今月</button>
          <button onClick={nextMonth} className="btn-secondary px-3 py-1.5">›</button>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div className="card mb-4 p-0 overflow-hidden">
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((w, i) => (
            <div key={w} className={`text-center text-xs font-semibold py-2 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'}`}>
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 border-t border-gray-100">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e${i}`} className="border-r border-b border-gray-100 min-h-[60px] sm:min-h-[80px] bg-gray-50/50" />
          ))}
          {Array.from({ length: daysCount }).map((_, i) => {
            const day    = i + 1;
            const isToday = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
            const dayOfWeek = (firstDay + i) % 7;
            const daySchedules = schedulesOnDay(day);
            const isSelected = selectedDay === day;

            return (
              <div
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`border-r border-b border-gray-100 min-h-[60px] sm:min-h-[80px] p-1 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                  isToday ? 'bg-blue-500 text-white' :
                  dayOfWeek === 0 ? 'text-red-500' :
                  dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-700'
                }`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {daySchedules.slice(0, 2).map(s => (
                    <div
                      key={s.id}
                      onClick={e => openEdit(s, e)}
                      className="text-xs bg-blue-100 text-blue-700 rounded px-1 truncate leading-5 hover:bg-blue-200"
                    >
                      {fmt(s.start_time)} {s.title}
                    </div>
                  ))}
                  {daySchedules.length > 2 && (
                    <div className="text-xs text-gray-400 pl-1">+{daySchedules.length - 2}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 選択日の詳細 */}
      {selectedDay && (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{month}/{selectedDay}の予定</h2>
            <button onClick={() => openAdd(selectedDay)} className="btn-primary text-xs px-3 py-1.5">
              ＋ 追加
            </button>
          </div>
          {selectedSchedules.length === 0 ? (
            <p className="text-sm text-gray-400">予定はありません</p>
          ) : (
            <ul className="space-y-2">
              {selectedSchedules.map(s => (
                <li key={s.id} className="flex items-start justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium">{s.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {fmt(s.start_time)}{s.end_time ? ` 〜 ${fmt(s.end_time)}` : ''}
                      {s.location ? ` 📍 ${s.location}` : ''}
                    </div>
                    {s.description && <div className="text-xs text-gray-400 mt-0.5">{s.description}</div>}
                  </div>
                  <button onClick={e => openEdit(s, e)} className="text-gray-400 hover:text-blue-500 text-sm shrink-0">✏️</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* モーダル */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <h3 className="font-bold text-lg mb-4">
                {modal.schedule ? '予定を編集' : `予定を追加（${modal.date}）`}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="label">タイトル *</label>
                  <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="例：歯医者" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label">開始 *</label>
                    <input type="datetime-local" className="input" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">終了</label>
                    <input type="datetime-local" className="input" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">場所</label>
                  <input className="input" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="例：渋谷駅" />
                </div>
                <div>
                  <label className="label">メモ</label>
                  <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="備考など" />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                {modal.schedule && (
                  <button onClick={remove} disabled={saving} className="btn-danger">削除</button>
                )}
                <div className="flex-1" />
                <button onClick={closeModal} className="btn-secondary">キャンセル</button>
                <button onClick={save} disabled={saving || !form.title || !form.start_time} className="btn-primary">
                  {saving ? '保存中…' : '保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
