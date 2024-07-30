import { Inter } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ['latin'] })

const AppWalletProviderWrapper = dynamic(
  () => import('../components/AppWalletProviderWrapper'),
  { ssr: false }
)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AppWalletProviderWrapper>
          {children}
        </AppWalletProviderWrapper>
      </body>
    </html>
  )
}
