import { NavBar } from '@/components/NavBar'
import { CalendarClient } from './CalendarClient'

export const metadata = { title: 'Calendrier — Cascade AI' }

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-cascade-bg">
      <NavBar />
      <CalendarClient />
    </div>
  )
}
