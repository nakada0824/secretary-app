'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Memo } from '@/lib/supabase';

function parseTags(raw: string): string[] {
  return raw
    .split(/[,、\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  if (isToday) {
    return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
}

export default function MemoPage() {
  const [memos, setMemos]               = useState<Memo[]>([]);
  const [newContent, setNewContent]     = useState('');
  const [newTags, setNewTags]           = useState('');
  const [adding, setAdding]             = useState(false);
  const [editMemo, setEditMemo]         = useState<Memo | null>(null);
  const [editContent, setEditContent]   = useState('');
  const [editTags, setEditTags]         = useState('');
  const [saving, setSaving]             = useState(false);
  const [search, setSearch]             = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/memos');
    if (res.ok) setMemos(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    const content = newContent.trim();
    if (!content || adding) return;
    setAdding(true);
    await fetch('/api/memos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, tags: parseTags(newTags) }),
    });
    setNewContent('');
    setNewTags('');
    await load();
    setAdding(false);
    textareaRef.current?.focus();
  };

  const openEdit = (m: Memo) => {
    setEditMemo(m);
    setEditContent(m.content);
    setEditTags((m.tags ?? []).join('、'));
  };

  const save = async () => {
    if (!editMemo || !editContent.trim() || saving) return;
    setSaving(true);
    await fetch(`/api/memos/${editMemo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent.trim(), tags: parseTags(editTags) }),
    });
    await load();
    setSaving(false);
    setEditMemo(null);
  };

  const remove = async () => {
    if (!editMemo || saving) return;
    setSaving(true);
    await fetch(`/api/memos/${editMemo.id}`, { method: 'DELETE' });
    await load();
    setSaving(false);
    setEditMemo(null);
  };

  const filtered = memos.filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      m.content.toLowerCase().includes(q) ||
      (m.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">メモ</h1>
        <span className="text-sm text-gray-400">{memos.length}件</span>
      </div>

      {/* 追加フォーム */}
      <div className="card mb-4">
        <textarea
          ref={textareaRef}
          className="input resize-none mb-2"
          rows={3}
          placeholder="メモを入力… (Cmd+Enter で追加)"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) add();
          }}
        />
        <div className="flex gap-2 items-center">
          <input
            className="input flex-1 text-sm"
            placeholder="タグ（カンマ区切り・任意）"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          />
          <button
            onClick={add}
            disabled={adding || !newContent.trim()}
            className="btn-primary shrink-0"
          >
            {adding ? '追加中…' : '追加'}
          </button>
        </div>
      </div>

      {/* 検索バー */}
      {memos.length > 5 && (
        <div className="mb-3">
          <input
            className="input text-sm"
            placeholder="🔍 メモを検索…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* 検索ヒント */}
      {search && (
        <div className="text-xs text-gray-400 mb-2">
          {filtered.length}件ヒット
          <button onClick={() => setSearch('')} className="ml-2 text-blue-400 hover:text-blue-600">
            クリア
          </button>
        </div>
      )}

      {/* メモ一覧 */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="card text-center text-gray-400 text-sm py-10">
            {search ? `「${search}」に一致するメモはありません` : 'メモはまだありません\n上のフォームから追加してください'}
          </div>
        )}
        {filtered.map((m) => (
          <div key={m.id} className="card">
            <div className="flex items-start gap-2">
              <p className="flex-1 text-sm whitespace-pre-wrap leading-relaxed break-words">
                {m.content}
              </p>
              <button
                onClick={() => openEdit(m)}
                className="text-gray-300 hover:text-blue-400 shrink-0 p-1 -m-1 rounded transition-colors"
                aria-label="編集"
              >
                ✏️
              </button>
            </div>
            {((m.tags ?? []).length > 0 || true) && (
              <div className="flex items-center justify-between mt-2 gap-2">
                <div className="flex flex-wrap gap-1">
                  {(m.tags ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-300 shrink-0">{formatDate(m.created_at)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 編集モーダル */}
      {editMemo && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => !saving && setEditMemo(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              {/* ハンドル（スマホ用） */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />
              <h3 className="font-bold text-lg mb-4">メモを編集</h3>
              <div className="space-y-3">
                <div>
                  <label className="label">内容</label>
                  <textarea
                    className="input resize-none"
                    rows={6}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label">タグ（カンマ・読点区切り）</label>
                  <input
                    className="input"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="例：仕事、アイデア、買い物"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={remove} disabled={saving} className="btn-danger">
                  削除
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setEditMemo(null)}
                  disabled={saving}
                  className="btn-secondary"
                >
                  キャンセル
                </button>
                <button
                  onClick={save}
                  disabled={saving || !editContent.trim()}
                  className="btn-primary"
                >
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
