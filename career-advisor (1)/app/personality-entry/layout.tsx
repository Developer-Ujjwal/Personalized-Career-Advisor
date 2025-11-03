import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Personality Assessment - AI Career Advisor',
  description: 'Take your personality assessment to help discover your ideal career path',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow zooming for better accessibility
  minimumScale: 1,
  userScalable: true, // Enable user scaling for accessibility
}

export default function PersonalityEntryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}