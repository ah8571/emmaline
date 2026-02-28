'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email');
      setStatus('error');
      return;
    }

    if (!marketingConsent) {
      setMessage('Please confirm consent to receive email updates');
      setStatus('error');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      // Store email in backend (creates a waitlist entry)
      const response = await axios.post('/api/newsletter', {
        email,
        source: 'landing-page',
        marketingConsent,
        consentSource: 'landing-page',
        policyVersion: '2026-02-27'
      });

      setMessage('✓ Thanks for signing up! Check your email for updates.');
      setStatus('success');
      setEmail('');
      setMarketingConsent(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to subscribe';
      setMessage(errorMsg);
      setStatus('error');
      console.error('Newsletter signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/50 focus:bg-white/15 transition"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Signing up...' : 'Join Waitlist'}
        </button>
        <label className="flex items-start gap-3 text-sm text-white/70">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-1"
            disabled={loading}
          />
          <span>
            I agree to receive product updates and launch emails from Emmaline. I can unsubscribe at any time.
          </span>
        </label>
        {message && (
          <p className={`text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
