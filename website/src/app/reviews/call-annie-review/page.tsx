import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Call Annie Review | Emmaline',
  description:
    'This page redirects to the main Call Annie vs Emmaline comparison article.',
  alternates: {
    canonical: '/compare/call-annie-vs-emmaline',
  },
};

export default function CallAnnieReviewPage() {
  permanentRedirect('/compare/call-annie-vs-emmaline');
}