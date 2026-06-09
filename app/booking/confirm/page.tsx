'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { TIME_SLOTS, getPrice, getDayType, formatCurrency } from '@/lib/booking-pricing'
import { loadBookingDraft, saveBookingResult, clearBookingDraft } from '@/lib/booking-storage'
import { backendJson } from '@/lib/backend-api'

export default function BookingConfirmPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    notes: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load draft from localStorage
  const draft = typeof window !== 'undefined' ? loadBookingDraft() : null

  useEffect(() => {
    if (!loadBookingDraft()) {
      router.replace('/booking')
    }
  }, [router])

  if (!draft) {
    return null // will redirect
  }

  const date = (() => {
    const [y, m, d] = draft.date.split('-').map(Number)
    return new Date(y, m - 1, d)
  })()

  const slot = TIME_SLOTS[draft.timeSlotIndex]
  const dayType = getDayType(date)
  const pricePerCourt = getPrice(slot, dayType)
  const total = pricePerCourt * draft.courtIds.length

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const bookingIds: number[] = []

      // Create one booking per court
      for (const courtId of draft.courtIds) {
        const result = await backendJson<{ id: number; status: string }>('/bookings', {
          method: 'POST',
          body: JSON.stringify({
            courtId,
            date: draft.date,
            startTime: `${String(slot.start).padStart(2, '0')}:00`,
            endTime: `${String(slot.end).padStart(2, '0')}:00`,
            userName: formData.fullName,
            userPhone: formData.phone || null,
            notes: formData.notes || null,
          }),
        })
        bookingIds.push(result.id)
      }

      saveBookingResult({
        bookingIds,
        courtIds: draft.courtIds,
        date: draft.date,
        timeSlotIndex: draft.timeSlotIndex,
        total,
        pricePerCourt,
      })
      clearBookingDraft()
      router.push('/booking/success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đặt sân thất bại. Vui lòng thử lại.'
      setError(message)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-8 text-3xl font-bold">Xác nhận đặt sân</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              {error && (
                <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                  ⚠ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-4 text-lg font-semibold">Thông tin cá nhân</h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                        Họ tên <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder="Nhập họ tên của bạn"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Số điện thoại <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="0912 345 678"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium mb-2">
                        Ghi chú
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Ghi chú thêm (nếu có)"
                        rows={3}
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !formData.fullName || !formData.phone}
                  className="w-full rounded-lg bg-accent text-white py-3 font-medium transition-colors hover:bg-[rgb(15_110_86)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Đang đặt sân...' : 'Xác nhận đặt sân'}
                </button>
              </form>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                <h3 className="mb-6 text-lg font-semibold">Tóm tắt đơn hàng</h3>

                <div className="mb-6 space-y-3 text-sm">
                  <div className="pb-3 border-b border-border">
                    <p className="text-muted-foreground">Ngày đặt sân</p>
                    <p className="font-medium">
                      {date.toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="pb-3 border-b border-border">
                    <p className="text-muted-foreground">Khung giờ</p>
                    <p className="font-medium">{slot.label}</p>
                  </div>

                  <div className="pb-3 border-b border-border">
                    <p className="text-muted-foreground">Sân ({draft.courtIds.length} sân)</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {draft.courtIds.sort((a, b) => a - b).map((id) => (
                        <span
                          key={id}
                          className="inline-block bg-[rgb(225_245_238)] px-2 py-1 rounded text-[rgb(15_110_86)] text-xs font-medium"
                        >
                          Sân {id}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Giá/sân</span>
                      <span className="font-medium">{formatCurrency(pricePerCourt)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-accent border-t border-border pt-3">
                      <span>Tổng cộng</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="block w-full text-center text-sm text-accent hover:underline mb-3"
                >
                  ← Quay lại chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
