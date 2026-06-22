'use client'

import { useEffect, useMemo, useState } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Loader2, RefreshCw, Save } from 'lucide-react'
import { TIME_SLOTS, getTimeRange } from '@/lib/booking-pricing'
import { backendJson } from '@/lib/backend-api'
import { type CourtPrice, type CourtPriceDayType, fetchCourtPrices, normalizeTime } from '@/lib/court-prices'

const DAY_TYPES: Array<{ key: CourtPriceDayType; label: string }> = [
  { key: 'WEEKDAY', label: 'Ngay thuong' },
  { key: 'WEEKEND', label: 'Cuoi tuan' },
  { key: 'SPECIAL_DAY', label: 'Ngay le' },
]

type PriceDraft = Record<CourtPriceDayType, number[]>

const emptyDraft = (): PriceDraft => ({
  WEEKDAY: Array(TIME_SLOTS.length).fill(0),
  WEEKEND: Array(TIME_SLOTS.length).fill(0),
  SPECIAL_DAY: Array(TIME_SLOTS.length).fill(0),
})

function priceKey(startTime: string, endTime: string, dayType: CourtPriceDayType) {
  return `${normalizeTime(startTime)}|${normalizeTime(endTime)}|${dayType}`
}

export default function AdminPricingPage() {
  const [courtPrices, setCourtPrices] = useState<CourtPrice[]>([])
  const [draftPrices, setDraftPrices] = useState<PriceDraft>(emptyDraft)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pricesBySlot = useMemo(() => {
    const map = new Map<string, CourtPrice>()
    courtPrices.forEach((price) => {
      map.set(priceKey(price.startTime, price.endTime, price.dayType), price)
    })
    return map
  }, [courtPrices])

  const loadPrices = async () => {
    try {
      setLoading(true)
      setError(null)
      const prices = await fetchCourtPrices()
      setCourtPrices(prices)

      const nextDraft = emptyDraft()
      TIME_SLOTS.forEach((slot, slotIndex) => {
        const { startTime, endTime } = getTimeRange(slot)
        DAY_TYPES.forEach(({ key }) => {
          const price = prices.find((item) =>
            normalizeTime(item.startTime) === `${startTime}:00` &&
            normalizeTime(item.endTime) === `${endTime}:00` &&
            item.dayType === key
          )
          nextDraft[key][slotIndex] = price ? Math.round(price.priceVnd / 1000) : 0
        })
      })
      setDraftPrices(nextDraft)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Khong the tai bang gia san.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPrices()
  }, [])

  const handlePriceChange = (dayType: CourtPriceDayType, timeIndex: number, value: string) => {
    const newPrice = Math.max(0, parseInt(value, 10) || 0)
    setDraftPrices((prev) => ({
      ...prev,
      [dayType]: prev[dayType].map((price, index) => index === timeIndex ? newPrice : price),
    }))
    setMessage(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setMessage(null)

      const updates: Promise<CourtPrice>[] = []
      TIME_SLOTS.forEach((slot, slotIndex) => {
        const { startTime, endTime } = getTimeRange(slot)
        DAY_TYPES.forEach(({ key }) => {
          const existing = pricesBySlot.get(priceKey(`${startTime}:00`, `${endTime}:00`, key))
          const priceVnd = draftPrices[key][slotIndex] * 1000

          if (!existing || existing.priceVnd === priceVnd) return

          updates.push(backendJson<CourtPrice>(`/admin/court-prices/${existing.id}`, {
            method: 'PUT',
            body: JSON.stringify({ priceVnd }),
          }))
        })
      })

      await Promise.all(updates)
      await loadPrices()
      setMessage(updates.length === 0 ? 'Khong co thay doi moi.' : 'Da luu bang gia san.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Luu bang gia that bai.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    const nextDraft = emptyDraft()
    TIME_SLOTS.forEach((slot, slotIndex) => {
      const { startTime, endTime } = getTimeRange(slot)
      DAY_TYPES.forEach(({ key }) => {
        const price = pricesBySlot.get(priceKey(`${startTime}:00`, `${endTime}:00`, key))
        nextDraft[key][slotIndex] = price ? Math.round(price.priceVnd / 1000) : 0
      })
    })
    setDraftPrices(nextDraft)
    setMessage(null)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Quan ly gia san</h1>
              <p className="text-muted-foreground">Dieu chinh gia san theo khung gio va loai ngay</p>
            </div>
            <button
              onClick={loadPrices}
              disabled={loading || saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-50 disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Tai lai
            </button>
          </div>

          <div className="mb-6 rounded-lg bg-[rgb(225_245_238)] border border-[rgb(15_110_86)]/20 p-4">
            <p className="text-sm text-[rgb(15_110_86)]">
              <span className="font-semibold">Ghi chu:</span> Gia duoc nhap theo don vi nghin dong. Vi du: 69 = 69.000 d.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-lg border border-[rgb(15_110_86)]/20 bg-[rgb(225_245_238)] p-4 text-sm text-[rgb(15_110_86)]">
              {message}
            </div>
          )}

          <div className="mb-8 rounded-xl border border-border bg-card p-6 overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="animate-spin" size={18} />
                Dang tai bang gia san...
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-semibold">Khung gio</th>
                    {DAY_TYPES.map((dayType) => (
                      <th key={dayType.key} className="px-4 py-3 text-center font-semibold">
                        {dayType.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {TIME_SLOTS.map((time, timeIndex) => (
                    <tr key={time.label} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-medium">{time.label}</td>
                      {DAY_TYPES.map(({ key }) => (
                        <td key={key} className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min={0}
                              value={draftPrices[key][timeIndex]}
                              onChange={(event) => handlePriceChange(key, timeIndex, event.target.value)}
                              className="w-24 rounded border border-border px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            <span className="text-xs text-muted-foreground">k</span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Gia cao diem</p>
              <p className="text-2xl font-bold">
                {draftPrices.WEEKDAY[6]}k - {draftPrices.SPECIAL_DAY[6]}k
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Gia binh thuong</p>
              <p className="text-2xl font-bold">
                {draftPrices.WEEKDAY[0]}k - {draftPrices.SPECIAL_DAY[0]}k
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Chenh lech cuoi tuan</p>
              <p className="text-2xl font-bold">
                {draftPrices.WEEKDAY[0] > 0
                  ? `+${(((draftPrices.WEEKEND[0] - draftPrices.WEEKDAY[0]) / draftPrices.WEEKDAY[0]) * 100).toFixed(0)}%`
                  : '0%'}
              </p>
            </div>
          </div>

          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-border p-4 flex justify-end gap-4">
            <button
              onClick={handleReset}
              disabled={loading || saving}
              className="rounded-lg border-2 border-border px-6 py-2 font-medium transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
            >
              Dat lai
            </button>
            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="inline-flex items-center gap-2 rounded-lg bg-accent text-white px-6 py-2 font-medium transition-colors hover:bg-[rgb(15_110_86)] disabled:opacity-60"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? 'Dang luu...' : 'Luu thay doi'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
