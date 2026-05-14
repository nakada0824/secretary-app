'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/lib/supabase';

const PRIORITY_LABEL: Record<number, string> = { 1: '最低', 2: '低', 3: '中', 4: '高', 5: '最高' };
const PRIORITY_COLOR: Record<number, string> = {
  1: 'bg-gray-100 text-gray-500',
  2: 'bg-green-100 text-green-600',
  3: 'bg-yellow-100 text-yellow-600',
  4: 'bg-orange-100 text-orange-600',
  5: 'bg-red-100 text-red-600',
};

function deadlineLabel(deadline?: string) {
  if (!deadline) return null;
  const d = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor((d.getTime() - today.getTime()) / 86400000);
  const label = d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
  if (diff < 0) return { text: `${label}（期限切れ）`, cls: 'text-red-500' };
  if (diff === 0) return { text: '今日まで', cls: 'text-red-500 font-semibold' };
  if (diff === 1) return { text: '明日まで', cls: 'text-orange-500 font-semibold' };
  if (diff <= 7) return { text: `${label}（${diff}日後）`, cls: 'text-orange-400' };
  return { text: label, cls: 'text-gray-400' };
}

const emptyForm = { title: '', description: '', priority: 3, deadline: '' };

export default function TasksPage() {
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [filter, setFilter]     = useState<'all' | 'pending' | 'completed'>('pending');
  const [showAdd, setShowAdd]   = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm]         = useState(emptyForm);
  const [saving, setSaving]     = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/tasks');
    if (res.ok) setTasks(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tasks.filter(t =>
    filter === 'all' ? true :
    filter === 'pending' ? !t.completed :
    t.completed
  );

  const toggle = async (t: Task) => {
    await fetch(`/api/tasks/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !t.completed }),
    });
    await load();
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditTask(null);
    setShowAdd(true);
  };

  const openEdit = (t: Task) => {
    setForm({
      title: t.title,
      description: t.description ?? '',
      priority: t.priority,
      deadline: t.deadline ? t.deadline.slice(0, 10) : '',
    });
    setEditTask(t);
    setShowAdd(true);
  };

  const save = async () => {
    if (!form.title) return;
    setSaving(true);
    const body = {
      title: form.title,
      description: form.description || null,
      priority: form.priority,
      deadline: form.deadline ? new Date(form.deadline + 'T23:59:59').toISOString() : null,
    };
    if (editTask) {
      await fetch(`/api/tasks/${editTask.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    await load();
    setSaving(false);
    setShowAdd(false);
  };

  const remove = async () => {
    if (!editTask) return;
    setSaving(true);
    await fetch(`/api/tasks/${editTask.id}`, { method: 'DELETE' });
    await load();
    setSaving(false);
    setShowAdd(false);
  };

  const pending   = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t => t.completed).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">タスク管理</h1>
        <button onClick={openAdd} className="btn-primary">＋ 追加</button>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: '未完了', value: pending,   color: 'text-blue-600', filter: 'pending'  as const },
          { label: '完了',   value: completed, color: 'text-green-600', filter: 'completed' as const },
          { label: '合計',   value: tasks.length, color: 'text-gray-600', filter: 'all' as const },
        ].map(s => (
          <button key={s.filter} onClick={() => setFilter(s.filter)} className={`card text-center transition-all ${filter === s.filter ? 'ring-2 ring-blue-400' : ''}`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* タスク一覧 */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="card text-center text-gray-400 text-sm py-8">タスクはありません</div>
        )}
        {filtered.map(t => {
          const dl = deadlineLabel(t.deadline ?? undefined);
          return (
            <div key={t.id} className={`card flex items-start gap-3 ${t.completed ? 'opacity-60' : ''}`}>
              <button
                onClick={() => toggle(t)}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  t.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                {t.completed && <span className="text-xs">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${t.completed ? 'line-through text-gray-400' : ''}`}>{t.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLOR[t.priority]}`}>
                    {PRIORITY_LABEL[t.priority]}
                  </span>
                </div>
                {dl && <div className={`text-xs mt-0.5 ${dl.cls}`}>📅 {dl.text}</div>}
                {t.description && <div className="text-xs text-gray-400 mt-0.5 truncate">{t.description}</div>}
              </div>
              <button onClick={() => openEdit(t)} className="text-gray-300 hover:text-blue-400 shrink-0">✏️</button>
            </div>
          );
        })}
      </div>

      {/* モーダル */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <h3 className="font-bold text-lg mb-4">{editTask ? 'タスクを編集' : 'タスクを追加'}</h3>
              <div className="space-y-3">
                <div>
                  <label className="label">タイトル *</label>
                  <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="例：資料を作成する" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label">優先度</label>
                    <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}>
                      {[5, 4, 3, 2, 1].map(p => (
                        <option key={p} value={p}>{p} — {PRIORITY_LABEL[p]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">締め切り</label>
                    <input type="date" className="input" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">メモ</label>
                  <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="備考など" />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                {editTask && <button onClick={remove} disabled={saving} className="btn-danger">削除</button>}
                <div className="flex-1" />
                <button onClick={() => setShowAdd(false)} className="btn-secondary">キャンセル</button>
                <button onClick={save} disabled={saving || !form.title} className="btn-primary">
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
