// src/lib/types/database.ts

export interface Visit {
  id: string
  user_id: string
  restaurant_name: string
  visited_at: string // Date in YYYY-MM-DD format
  notes: string | null
  created_at: string
  updated_at: string
}

export type NewVisit = Omit<Visit, 'id' | 'created_at' | 'updated_at'>
export type VisitUpdate = Partial<Omit<Visit, 'id' | 'user_id' | 'created_at' | 'updated_at'>>