import { create } from 'zustand'
import type { ViewType } from '@/types'

interface ViewStore {
  view: ViewType
  currentDate: Date
  setView: (view: ViewType) => void
  setCurrentDate: (date: Date) => void
  goToPrev: () => void
  goToNext: () => void
  goToToday: () => void
}

export const useViewStore = create<ViewStore>((set, get) => ({
  view: 'month',
  currentDate: new Date(),

  setView: (view) => set({ view }),
  setCurrentDate: (currentDate) => set({ currentDate }),

  goToToday: () => set({ currentDate: new Date() }),

  goToPrev: () => {
    const { view, currentDate } = get()
    const d = new Date(currentDate)
    if (view === 'month') d.setMonth(d.getMonth() - 1)
    else if (view === 'week') d.setDate(d.getDate() - 7)
    else d.setDate(d.getDate() - 1)
    set({ currentDate: d })
  },

  goToNext: () => {
    const { view, currentDate } = get()
    const d = new Date(currentDate)
    if (view === 'month') d.setMonth(d.getMonth() + 1)
    else if (view === 'week') d.setDate(d.getDate() + 7)
    else d.setDate(d.getDate() + 1)
    set({ currentDate: d })
  },
}))
