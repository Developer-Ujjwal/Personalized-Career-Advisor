import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Holland RIASEC Assessment - CareerPath',
  description: 'Complete your Holland RIASEC assessment to understand your career interests',
}

export default function HollandRiasecLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}