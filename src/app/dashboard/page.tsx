'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Visit } from '@/lib/types/database'

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form state
  const [restaurantName, setRestaurantName] = useState('')
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  // Fetch visits
  useEffect(() => {
    if (user) {
      fetchVisits()
    }
  }, [user])

  const fetchVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .order('visited_at', { ascending: false })

      if (error) throw error
      setVisits(data || [])
    } catch (error) {
      console.error('Error fetching visits:', error)
      setMessage('Failed to load visits')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setSubmitting(true)
    setMessage('')

    try {
      if (editingId) {
        // Update existing visit
        const { error } = await supabase
          .from('visits')
          .update({
            restaurant_name: restaurantName,
            visited_at: visitDate,
            notes: notes || null,
          })
          .eq('id', editingId)

        if (error) throw error
        setMessage('Visit updated!')
        setEditingId(null)
      } else {
        // Create new visit
        const { error } = await supabase
          .from('visits')
          .insert({
            user_id: user.id,
            restaurant_name: restaurantName,
            visited_at: visitDate,
            notes: notes || null,
          })

        if (error) throw error
        setMessage('Visit added!')
      }

      // Reset form
      setRestaurantName('')
      setVisitDate(new Date().toISOString().split('T')[0])
      setNotes('')
      
      // Refresh visits
      await fetchVisits()
    } catch (error) {
      console.error('Error saving visit:', error)
      setMessage(error instanceof Error ? error.message : 'Failed to save visit')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (visit: Visit) => {
    setRestaurantName(visit.restaurant_name)
    setVisitDate(visit.visited_at)
    setNotes(visit.notes || '')
    setEditingId(visit.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this visit?')) return
    
    try {
      const { error } = await supabase
        .from('visits')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchVisits()
      setMessage('Visit deleted')
    } catch (error) {
      console.error('Error deleting visit:', error)
      setMessage('Failed to delete visit')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setRestaurantName('')
    setVisitDate(new Date().toISOString().split('T')[0])
    setNotes('')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">eatin</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Add/Edit Visit Form */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? 'Edit Visit' : 'Add Restaurant Visit'}</CardTitle>
                <CardDescription>
                  Log where you ate and when
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="restaurant">Restaurant Name</Label>
                    <Input
                      id="restaurant"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="e.g., Joe's Pizza"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date">Visit Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <textarea
                      id="notes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="What did you eat? How was it?"
                    />
                  </div>

                  {message && (
                    <div className={`text-sm ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
                      {message}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting} className="flex-1">
                      {submitting ? 'Saving...' : (editingId ? 'Update' : 'Add Visit')}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{visits.length}</div>
                <div className="text-sm text-gray-600">restaurants visited</div>
              </CardContent>
            </Card>
          </div>

          {/* Visits List */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Restaurant Visits</CardTitle>
                <CardDescription>
                  {visits.length === 0 ? 'No visits yet. Add your first restaurant!' : `${visits.length} restaurants and counting`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {visits.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No restaurant visits yet.</p>
                    <p className="text-sm mt-2">Add your first visit to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visits.map((visit) => (
                      <div key={visit.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{visit.restaurant_name}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(visit.visited_at + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            {visit.notes && (
                              <p className="mt-2 text-gray-700">{visit.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(visit)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(visit.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}