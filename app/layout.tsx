import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Shap10r App Online Game',
  description: 'Shap10r is an iOS game that has been all the rage on TikTok. Shap10r.info is its HTML5 version, and you can play this game for free directly in your browser.',
//   viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
//   themeColor: '#ffffff',
//   appleWebApp: {
//     capable: true,
//     statusBarStyle: 'black-translucent',
//   },
//   formatDetection: {
//     telephone: false
//   }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 