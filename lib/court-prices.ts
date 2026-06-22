import { backendJson } from '@/lib/backend-api'
import type { TimeSlot } from '@/lib/booking-pricing'

export type CourtPriceDayType = 'WEEKDAY' | 'WEEKEND' | 'SPECIAL_DAY'

export type CourtPrice = {
  id: number
  startTime: string
  endTime: string
  dayType: CourtPriceDayType
  priceVnd: number
}

export function toCourtPriceDayType(dayType: string): CourtPriceDayType {
  if (dayType === 'weekend') return 'WEEKEND'
  if (dayType === 'special_day' || dayType === 'holiday') return 'SPECIAL_DAY'
  return 'WEEKDAY'
}

export function normalizeTime(value: string) {
  return value.length === 5 ? `${value}:00` : value
}

export function findCourtPrice(
  prices: CourtPrice[],
  slot: TimeSlot,
  dayType: string
) {
  const startTime = `${String(slot.start).padStart(2, '0')}:00:00`
  const endTime = `${String(slot.end).padStart(2, '0')}:00:00`
  const priceDayType = toCourtPriceDayType(dayType)

  return prices.find((price) =>
    normalizeTime(price.startTime) === startTime &&
    normalizeTime(price.endTime) === endTime &&
    price.dayType === priceDayType
  )
}

export function getCourtPriceValue(
  prices: CourtPrice[],
  slot: TimeSlot,
  dayType: string,
  fallback = 0
) {
  return findCourtPrice(prices, slot, dayType)?.priceVnd ?? fallback
}

export async function fetchCourtPrices() {
  return backendJson<CourtPrice[]>('/court-prices')
}
