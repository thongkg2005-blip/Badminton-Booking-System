'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Calendar, Clock, MapPin, Phone, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'BLOCKED'

type Booking = {
  id: number
  court: {
    id: number
    name: string
  }
  bookingDate: string
  startTime: string
  endTime: string
  userName: string
  userPhone: string
  notes: string | null
  status: BookingStatus
  createdAt: string
}

function StatusBadge({ status }: { status: BookingStatus }) {
  if (status === 'CONFIRMED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
        <CheckCircle size={12} />
        Đã xác nhận
      </span>
    )
  }
  if (status === 'CANCELLED') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600">
        <XCircle size={12} />
        Đã hủy
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
      <AlertCircle size={12} />
      Bị chặn
    </span>
  )
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

function formatTime(timeStr: string) {
  return timeStr.substring(0, 5)
}

export default function BookingHistoryPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userPhone, setUserPhone] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.replace('/auth')
      return
    }

    try {
      const u = JSON.parse(storedUser)
      const phone = u.phone

      if (!phone) {
        setError('Tài khoản của bạn chưa có số điện thoại. Vui lòng cập nhật thông tin cá nhân.')
        setIsLoading(false)
        return
      }

      setUserPhone(phone)

      fetch(`/backend-api/bookings/my?phone=${encodeURIComponent(phone)}`)
        .then((res) => {
          if (!res.ok) throw new Error('Không thể tải lịch sử đặt sân')
          return res.json()
        })
        .then((data: Booking[]) => {
          setBookings(data)
        })
        .catch((err: Error) => {
          setError(err.message || 'Có lỗi xảy ra')
        })
        .finally(() => setIsLoading(false))
    } catch {
      localStorage.removeItem('user')
      router.replace('/auth')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lịch sử đặt sân</h1>
            {userPhone && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone size={14} />
                {userPhone}
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
            <AlertCircle size={32} className="mx-auto mb-2 opacity-60" />
            <p className="font-medium">{error}</p>
            <Link
              href="/profile"
              className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
            >
              Cập nhật thông tin
            </Link>
          </div>
        )}

        {/* No bookings */}
        {!isLoading && !error && bookings.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-muted-foreground opacity-40" />
            <h3 className="text-lg font-semibold text-foreground">Chưa có lịch đặt sân</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Bạn chưa có lịch đặt sân nào. Hãy đặt sân ngay hôm nay!
            </p>
            <Link
              href="/booking"
              className="mt-6 inline-block rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
            >
              Đặt sân ngay
            </Link>
          </div>
        )}

        {/* Bookings List */}
        {!isLoading && !error && bookings.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tổng cộng <strong>{bookings.length}</strong> lần đặt sân
            </p>

            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Court name */}
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-accent shrink-0" />
                      <span className="font-semibold text-foreground">{booking.court?.name ?? `Sân #${booking.court?.id}`}</span>
                    </div>

                    {/* Date & time */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {formatDate(booking.bookingDate)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                      </span>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <FileText size={14} className="mt-0.5 shrink-0" />
                        <span>{booking.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="shrink-0">
                    <StatusBadge status={booking.status} />
                  </div>
                </div>

                {/* Booking ID */}
                <div className="mt-3 border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">Mã đặt sân: #{booking.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
