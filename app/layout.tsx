import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Competitor Agent',
  description: 'Competitor Analysis UI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-gray-950 text-gray-100">
        <header className="border-b border-gray-800 px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight">🔍 Competitor Agent</h1>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  )
}
