'use client';

import { useEffect, useState } from 'react';

const APP_SCHEME = 'oov';
const APP_PACKAGE = 'com.emmaline.app.dev';
const APP_PATH = 'auth/callback';

const buildIntentUrl = (query: string, hash: string) => {
  // Move hash params into query string so # doesn't conflict with Intent syntax
  const hashParams = hash ? '&' + hash.substring(1) : '';
  const params = query + hashParams;
  const encodedParams = encodeURIComponent(params);
  const fallback = encodeURIComponent(`https://oov.digital/auth/callback${query}${hash}`);
  return `intent://${APP_PATH}${params}#Intent;scheme=${APP_SCHEME};package=${APP_PACKAGE};S.browser_fallback_url=${fallback};end`;
};

const buildUniversalUrl = (query: string, hash: string) => {
  return `oov://${APP_PATH}${query}${hash}`;
};

export default function AuthCallbackPage() {
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    const query = window.location.search;
    const hash = window.location.hash;
    const isAndroid = /android/i.test(navigator.userAgent);
    const url = isAndroid ? buildIntentUrl(query, hash) : buildUniversalUrl(query, hash);
    setAppUrl(url);
    window.location.href = url;
  }, []);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 px-6">
      <p className="text-white/60 text-sm text-center">
        Complete your sign-in by opening the app
      </p>
      <a
        href={appUrl}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-95"
      >
        Open Oov
      </a>
    </main>
  );
}