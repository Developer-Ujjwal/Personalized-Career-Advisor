import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Career Roadmap - CareerPath',
  description: 'Visualize your path to your dream career with our AI-generated roadmap',
}

export default function CareerRoadmapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}