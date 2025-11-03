import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Personality Assessment - CareerPath',
  description: 'Take your comprehensive personality assessment for career guidance',
}

export default function PersonalityQuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}