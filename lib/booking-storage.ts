export type BookingDraft = {
  date: string
  timeSlotIndex: number
  courtIds: number[]
}

export type BookingResult = {
  bookingIds: number[]
  courtIds: number[]
  date: string
  timeSlotIndex: number
  total: number
  pricePerCourt: number
}

const DRAFT_KEY = 'bookingDraft'
const RESULT_KEY = 'bookingResult'

export function saveBookingDraft(draft: BookingDraft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
}

export function loadBookingDraft(): BookingDraft | null {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as BookingDraft
  } catch {
    return null
  }
}

export function clearBookingDraft() {
  localStorage.removeItem(DRAFT_KEY)
}

export function saveBookingResult(result: BookingResult) {
  localStorage.setItem(RESULT_KEY, JSON.stringify(result))
}

export function loadBookingResult(): BookingResult | null {
  const raw = localStorage.getItem(RESULT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as BookingResult
  } catch {
    return null
  }
}

export function clearBookingResult() {
  localStorage.removeItem(RESULT_KEY)
}
