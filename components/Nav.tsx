'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/calendar', label: 'カレンダー', icon: '📅' },
  { href: '/tasks',    label: 'タスク',      icon: '✅' },
  { href: '/shopping', label: '買い物',      icon: '🛒' },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 flex items-center h-14 gap-1">
        <span className="font-bold text-blue-500 mr-4 text-lg">🗂️ 秘書</span>
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              pathname.startsWith(href)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
      </div>
    </header>
  );
}
