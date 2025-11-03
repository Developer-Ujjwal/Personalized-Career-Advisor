import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Profile - CareerPath',
  description: 'View and manage your career profile',
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}