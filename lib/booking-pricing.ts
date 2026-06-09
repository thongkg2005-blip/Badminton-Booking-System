export const TIME_SLOTS = [
  { label: '5:00-7:00', start: 5, end: 7 },
  { label: '7:00-9:00', start: 7, end: 9 },
  { label: '9:00-11:00', start: 9, end: 11 },
  { label: '11:00-13:00', start: 11, end: 13 },
  { label: '13:00-15:00', start: 13, end: 15 },
  { label: '15:00-17:00', start: 15, end: 17 },
  { label: '17:00-19:00', start: 17, end: 19 },
  { label: '19:00-21:00', start: 19, end: 21 },
  { label: '21:00-23:00', start: 21, end: 23 },
] as const

export type TimeSlot = (typeof TIME_SLOTS)[number]

export const COURTS = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Sân ${i + 1}` }))

export function getDayType(date: Date) {
  const day = date.getDay()
  if ([0, 6].includes(day)) return 'weekend'
  return 'weekday'
}

export function getPrice(slot: TimeSlot, dayType: string) {
  const basePrice = slot.start >= 17 ? 69000 : 40000
  const multiplier = dayType === 'weekend' ? 1.2 : 1
  return Math.round(basePrice * multiplier)
}

export function getTimeRange(slot: TimeSlot) {
  return {
    startTime: `${String(slot.start).padStart(2, '0')}:00`,
    endTime: `${String(slot.end).padStart(2, '0')}:00`,
  }
}

export function formatCurrency(value: number) {
  return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ`
}
