import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Career Agent - AI Career Advisor',
  description: 'Your AI-powered career discovery assistant',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function CareerAgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}