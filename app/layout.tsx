import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: '秘書アプリ',
  description: 'カレンダー・タスク・買い物リスト管理',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <Nav />
        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
