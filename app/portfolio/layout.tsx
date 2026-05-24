import type { Metadata } from 'next'
import { JetBrains_Mono, Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Mazen Elsaka | Web Developer & AI Engineer',
  description: 'Personal portfolio of Mazen Elsaka — Web Developer and AI Engineer specializing in modern web technologies and computer vision.',
}

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      lang="en"
      dir="ltr"
      className={`${jetbrains.variable} ${inter.variable} portfolio-root`}
    >
      {children}
    </div>
  )
}
