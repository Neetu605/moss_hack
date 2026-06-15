export function ThemeScript() {
  const code = `
    try {
      const stored = document.cookie.match(/(?:^|; )productiq-theme=([^;]+)/)?.[1];
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (stored === 'dark' || (!stored && prefersDark)) document.documentElement.classList.add('dark');
    } catch {}
  `;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
