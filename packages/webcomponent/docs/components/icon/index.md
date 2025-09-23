# Icon 图标

<script>
// 自动将 /components/icon/ 重定向到 /components/icon，避免与主文档冲突
if (typeof window !== 'undefined') {
  var url = new URL(window.location.href);
  if (url.pathname.match(/\/components\/icon\/$/)) {
    url.pathname = url.pathname.replace(/\/$/, '');
    window.location.replace(url.toString());
  }
}
</script>

<div style="padding:12px;border:1px solid #eee;border-radius:8px;background:#fafafa;">
  <p>正在跳转到 <a href="/components/icon">/components/icon</a> …… 如果没有自动跳转，请点击链接。</p>
</div>
