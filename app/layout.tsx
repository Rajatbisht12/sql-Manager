import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ConnectionProvider } from './context/ConnectionContext'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MySQL Database Manager',
  description: 'A web-based MySQL database management tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ConnectionProvider>
            {children}
          </ConnectionProvider>
        </Providers>
      </body>
    </html>
  )
}
