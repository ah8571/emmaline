import '../globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://emmaline.app'),
  title: 'AI Phone Assistant For Real Conversations | Emmaline',
  description: 'Emmaline is an AI phone assistant you can call to ask questions, practice conversations, and talk naturally by voice.',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/black outline favicon.png',
    apple: '/apple-touch-icon.png',
    shortcut: '/black outline favicon.png'
  },
  openGraph: {
    title: 'AI Phone Assistant For Real Conversations | Emmaline',
    description: 'Emmaline is an AI phone assistant you can call to ask questions, practice conversations, and talk naturally by voice.',
    type: 'website',
    url: 'https://emmaline.app',
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
