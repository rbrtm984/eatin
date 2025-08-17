'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to auth page if not authenticated
    if (!loading && !user) {
      router.push('/auth')
    }
    // Redirect to dashboard if authenticated
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Don't render the authenticated UI if there's no user
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              eatin
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.email}
              </span>
              <Button onClick={signOut} variant="outline">
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Your Restaurant Diary
          </h2>
          <p className="text-gray-600 mb-8">
            Start tracking your dining experiences and discover new favorites.
          </p>
          <div className="bg-gray-50 rounded-lg p-8">
            <p className="text-gray-500">
              Ready to add your first restaurant experience? Components coming soon!
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}