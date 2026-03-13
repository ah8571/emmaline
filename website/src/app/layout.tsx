import '../globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your AI phone assistant - Emmaline',
  description: 'An intelligent companion for phone conversations. Get smarter with every call.',
  icons: {
    icon: '/black outline favicon.png',
    apple: '/apple-touch-icon.png',
    shortcut: '/black outline favicon.png'
  },
  openGraph: {
    title: 'Your AI phone assistant - Emmaline',
    description: 'An intelligent companion for phone conversations. Get smarter with every call.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  )
}
