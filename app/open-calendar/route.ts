// LINE の秘書 Bot から開く「iPhone のカレンダーアプリを開く」ページ。
// calshow:<2001-01-01 からの秒数> で、その日のカレンダーを開く（?d=YYYY-MM-DD、省略時は今日）
export function GET(req: Request) {
  const d = new URL(req.url).searchParams.get('d');
  const date = d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(`${d}T12:00:00+09:00`) : new Date();
  const seconds = Math.floor((date.getTime() - Date.UTC(2001, 0, 1)) / 1000);
  const target = `calshow:${seconds}`;

  const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>カレンダーを開く</title>
<style>
  body { font-family: -apple-system, sans-serif; display: flex; min-height: 100vh; margin: 0;
         align-items: center; justify-content: center; background: #f5f5f7; color: #1d1d1f; }
  a { display: inline-block; padding: 16px 32px; border-radius: 14px; background: #007aff;
      color: #fff; font-size: 18px; font-weight: 600; text-decoration: none; }
  p { color: #6e6e73; font-size: 14px; margin-top: 16px; }
</style>
</head>
<body>
<div style="text-align:center">
  <a href="${target}">📅 カレンダーを開く</a>
  <p>自動で開かないときはボタンを押してください</p>
</div>
<script>location.href = ${JSON.stringify(target)};</script>
</body>
</html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
