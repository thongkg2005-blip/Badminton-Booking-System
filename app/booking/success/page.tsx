'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { TIME_SLOTS, formatCurrency } from '@/lib/booking-pricing'
import { loadBookingResult, clearBookingResult } from '@/lib/booking-storage'
import type { BookingResult } from '@/lib/booking-storage'

export default function BookingSuccessPage() {
  const router = useRouter()
  const [result, setResult] = useState<BookingResult | null>(null)

  useEffect(() => {
    const r = loadBookingResult()
    if (!r) {
      router.replace('/')
      return
    }
    setResult(r)
    // Clear so the data doesn't persist after leaving this page
    clearBookingResult()
  }, [router])

  if (!result) return null

  const slot = TIME_SLOTS[result.timeSlotIndex]
  const date = (() => {
    const [y, m, d] = result.date.split('-').map(Number)
    return new Date(y, m - 1, d)
  })()

  // Display a booking reference (first booking ID)
  const bookingRef = `#${String(result.bookingIds[0]).padStart(10, '0')}`

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-accent" />
            <h1 className="mb-2 text-2xl font-bold">Đặt sân thành công!</h1>
            <p className="mb-6 text-muted-foreground">
              Đơn đặt sân của bạn đã được xác nhận. Vui lòng đến đúng giờ.
            </p>

            <div className="mb-6 rounded-lg bg-[rgb(225_245_238)] p-4 text-left">
              <p className="text-sm font-medium text-[rgb(15_110_86)] mb-3">Chi tiết đơn đặt</p>
              <div className="space-y-2 text-sm text-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã đơn:</span>
                  <span className="font-medium">{bookingRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày sân:</span>
                  <span className="font-medium">
                    {date.toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Khung giờ:</span>
                  <span className="font-medium">{slot.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sân:</span>
                  <span className="font-medium">
                    {result.courtIds.sort((a, b) => a - b).map((id) => `Sân ${id}`).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[rgb(15_110_86)]/20 pt-2 mt-2">
                  <span className="text-muted-foreground">Tổng tiền:</span>
                  <span className="font-bold text-accent">{formatCurrency(result.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="flex-1 rounded-lg border-2 border-border px-4 py-3 font-medium transition-colors hover:border-accent hover:text-accent"
              >
                Về trang chủ
              </Link>
              <Link
                href="/shop"
                className="flex-1 rounded-lg bg-accent text-white px-4 py-3 font-medium transition-colors hover:bg-[rgb(15_110_86)]"
              >
                Mua dụng cụ
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
