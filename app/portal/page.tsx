'use client';

import { useState, useEffect, useCallback } from 'react';
import type { App } from '@/lib/supabase';

function parseTags(raw: string): string[] {
  return raw.split(/[,、\s]+/).map((t) => t.trim()).filter(Boolean);
}

export default function PortalPage() {
  const [apps, setApps]         = useState<App[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editApp, setEditApp]   = useState<App | null>(null);

  const [name, setName]         = useState('');
  const [url, setUrl]           = useState('');
  const [keywords, setKeywords] = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/apps');
    if (res.ok) setApps(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditApp(null);
    setName(''); setUrl(''); setKeywords('');
    setError('');
    setShowForm(true);
  }

  function openEdit(app: App) {
    setEditApp(app);
    setName(app.name);
    setUrl(app.url);
    setKeywords(app.keywords.join('、'));
    setError('');
    setShowForm(true);
  }

  async function handleSave() {
    if (!name.trim() || !url.trim()) { setError('アプリ名とURLは必須です。'); return; }
    if (!/^https?:\/\//.test(url.trim())) { setError('URLは https:// または http:// で始めてください。'); return; }
    setSaving(true);
    setError('');

    const body = { name: name.trim(), url: url.trim(), keywords: parseTags(keywords) };

    let res: Response;
    if (editApp) {
      res = await fetch(`/api/apps/${editApp.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
    } else {
      res = await fetch('/api/apps', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
    }

    if (!res.ok) { setError('保存に失敗しました。もう一度お試しください。'); setSaving(false); return; }
    setSaving(false);
    setShowForm(false);
    load();
  }

  async function handleDelete(app: App) {
    if (!confirm(`「${app.name}」を削除しますか？`)) return;
    await fetch(`/api/apps/${app.id}`, { method: 'DELETE' });
    load();
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">📱 アプリポータル</h1>
        <button
          onClick={openAdd}
          className="bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-600 active:scale-95 transition-all"
        >
          ＋ 追加
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-12">読み込み中...</p>
      ) : apps.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <p className="text-4xl mb-3">📱</p>
          <p className="font-medium">まだアプリが登録されていません</p>
          <p className="text-sm mt-1">LINEで「〇〇を登録して。URLはhttps://...」と送ると追加できます</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {apps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 shadow-sm"
            >
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:underline leading-tight break-all"
              >
                {app.name}
              </a>
              <p className="text-xs text-gray-400 break-all line-clamp-2">{app.url}</p>
              {app.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {app.keywords.map((kw) => (
                    <span key={kw} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-auto pt-1">
                <button
                  onClick={() => openEdit(app)}
                  className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(app)}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-auto"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* モーダル */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-gray-800 text-lg">
              {editApp ? 'アプリを編集' : 'アプリを追加'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">アプリ名 *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: 筋トレアプリ"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  キーワード <span className="text-gray-400 font-normal text-xs">（カンマ・スペース区切り）</span>
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="例: 筋トレ、運動、ジム"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-500 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
