import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Emmaline - Your AI Phone Call Buddy',
  description: 'An intelligent companion for phone conversations. Get smarter with every call.',
  openGraph: {
    title: 'Emmaline - Your AI Phone Call Buddy',
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
