import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Holland Assessment Entry - CareerPath',
  description: 'Begin your Holland career interests assessment',
}

export default function HollandEntryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}