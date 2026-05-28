'use client';

import { useState, useEffect, useCallback } from 'react';
import type { App } from '@/lib/supabase';

export default function PortalPage() {
  const [apps, setApps]       = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/apps');
    if (res.ok) setApps(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-800 mb-1">📱 アプリポータル</h1>
      <p className="text-sm text-gray-400 mb-6">LINEで登録したアプリをまとめて開けます</p>

      {loading ? (
        <p className="text-center text-gray-400 py-12">読み込み中...</p>
      ) : apps.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-5xl">📱</p>
          <p className="font-medium text-gray-600 mt-3">まだアプリが登録されていません</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            LINEで「〇〇を登録して。<br />URLはhttps://...」と話しかけてください
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {apps.map((app) => (
            <a
              key={app.id}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-blue-300 active:scale-95 transition-all"
            >
              <div className="flex items-start justify-between gap-1">
                <span className="font-semibold text-gray-800 leading-snug group-hover:text-blue-600 transition-colors">
                  {app.name}
                </span>
                <span className="text-gray-300 group-hover:text-blue-400 transition-colors mt-0.5 shrink-0 text-lg leading-none">
                  ↗
                </span>
              </div>

              {app.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {app.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="bg-blue-50 text-blue-500 text-xs px-2 py-0.5 rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </a>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-gray-300 mt-10">
        アプリの追加・削除はLINEで行えます
      </p>
    </main>
  );
}
