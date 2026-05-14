import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '拾光日程',
  description: '有条理但不焦虑的手帐日程',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '拾光日程',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <head>
        {/* 所有字体通过 CDN 加载，避免 Turbopack next/font 兼容性问题 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Ma+Shan+Zheng&family=Noto+Sans+SC:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full">{children}</body>
    </html>
  )
}
