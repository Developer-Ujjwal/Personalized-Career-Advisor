import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'HEXACO Assessment - CareerPath',
  description: 'Complete your HEXACO personality assessment for career matching',
}

export default function HexacoEntryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}