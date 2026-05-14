'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ShoppingItem } from '@/lib/supabase';

export default function ShoppingPage() {
  const [items, setItems]     = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState('');
  const [newQty, setNewQty]   = useState('');
  const [adding, setAdding]   = useState(false);
  const [showChecked, setShowChecked] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/shopping');
    if (res.ok) setItems(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    const item = newItem.trim();
    if (!item) return;
    setAdding(true);
    await fetch('/api/shopping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, quantity: newQty.trim() || null }),
    });
    setNewItem('');
    setNewQty('');
    await load();
    setAdding(false);
  };

  const toggle = async (i: ShoppingItem) => {
    await fetch(`/api/shopping/${i.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checked: !i.checked }),
    });
    await load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/shopping/${id}`, { method: 'DELETE' });
    await load();
  };

  const clearChecked = async () => {
    const checked = items.filter(i => i.checked);
    await Promise.all(checked.map(i => fetch(`/api/shopping/${i.id}`, { method: 'DELETE' })));
    await load();
  };

  const unchecked = items.filter(i => !i.checked);
  const checked   = items.filter(i => i.checked);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">買い物リスト</h1>
        {checked.length > 0 && (
          <button onClick={clearChecked} className="text-sm text-red-400 hover:text-red-600">
            購入済みを削除
          </button>
        )}
      </div>

      {/* 追加フォーム */}
      <div className="card mb-4">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="アイテム名"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
          <input
            className="input w-20"
            placeholder="数量"
            value={newQty}
            onChange={e => setNewQty(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
          <button onClick={add} disabled={adding || !newItem.trim()} className="btn-primary shrink-0">
            追加
          </button>
        </div>
      </div>

      {/* サマリー */}
      <div className="flex gap-3 text-sm text-gray-500 mb-3">
        <span>未購入 <strong className="text-blue-600">{unchecked.length}</strong>件</span>
        <span>購入済み <strong className="text-green-600">{checked.length}</strong>件</span>
      </div>

      {/* 未購入リスト */}
      <div className="space-y-2 mb-4">
        {unchecked.length === 0 && (
          <div className="card text-center text-gray-400 text-sm py-6">買い物リストは空です</div>
        )}
        {unchecked.map(i => (
          <div key={i.id} className="card flex items-center gap-3">
            <button
              onClick={() => toggle(i)}
              className="w-5 h-5 rounded border-2 border-gray-300 hover:border-blue-400 flex-shrink-0 transition-colors"
            />
            <div className="flex-1">
              <span className="text-sm font-medium">{i.item}</span>
              {i.quantity && <span className="text-xs text-gray-400 ml-2">{i.quantity}</span>}
            </div>
            <button onClick={() => remove(i.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
          </div>
        ))}
      </div>

      {/* 購入済みリスト */}
      {checked.length > 0 && (
        <div>
          <button
            onClick={() => setShowChecked(v => !v)}
            className="text-sm text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1"
          >
            {showChecked ? '▾' : '▸'} 購入済み ({checked.length}件)
          </button>
          {showChecked && (
            <div className="space-y-2">
              {checked.map(i => (
                <div key={i.id} className="card flex items-center gap-3 opacity-60">
                  <button
                    onClick={() => toggle(i)}
                    className="w-5 h-5 rounded border-2 border-green-400 bg-green-400 flex-shrink-0 flex items-center justify-center"
                  >
                    <span className="text-white text-xs">✓</span>
                  </button>
                  <div className="flex-1">
                    <span className="text-sm line-through text-gray-400">{i.item}</span>
                    {i.quantity && <span className="text-xs text-gray-300 ml-2">{i.quantity}</span>}
                  </div>
                  <button onClick={() => remove(i.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
