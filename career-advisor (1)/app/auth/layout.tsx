import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Authentication - CareerPath',
  description: 'Sign in or create an account to start your career discovery journey',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}