'use client';

// This page exists solely as a WebBrowser dismiss target.
// Supabase redirects here with tokens in the URL hash.
// WebBrowser.openAuthSessionAsync detects this URL, auto-closes,
// and passes the full URL (with hash) back to the app.
// Do NOT redirect — let WebBrowser capture the URL natively.

export default function AuthCallbackPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <p className="text-white/40 text-sm">Signing in…</p>
    </main>
  );
}