'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { BarChart3, DollarSign, ShoppingCart, TrendingUp, Loader2 } from 'lucide-react'
import { backendJson } from '@/lib/backend-api'
import { TIME_SLOTS, getDayType, getPrice, formatCurrency } from '@/lib/booking-pricing'

type Booking = {
  id: number
  court: {
    id: number
    name: string
    code: string
  }
  bookingDate: string
  startTime: string
  endTime: string
  userName: string
  userPhone: string | null
  notes: string | null
  status: 'CONFIRMED' | 'CANCELLED' | 'BLOCKED'
  createdAt: string
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [statsData, setStatsData] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    activeBookings: 0,
    blockedSlots: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      backendJson<Booking[]>('/admin/bookings'),
      backendJson<{ total: number; confirmed: number; cancelled: number; blocked: number }>('/admin/bookings/stats')
    ])
      .then(([bookingsData, stats]) => {
        setBookings(bookingsData)
        
        // Calculate revenue
        const revenue = bookingsData
          .filter(b => b.status === 'CONFIRMED')
          .reduce((sum, b) => {
            const startHour = parseInt(b.startTime.split(':')[0], 10)
            const slot = TIME_SLOTS.find(s => s.start === startHour)
            const dateObj = new Date(b.bookingDate)
            const dayType = getDayType(dateObj)
            const price = slot ? getPrice(slot, dayType) : 0
            return sum + price
          }, 0)

        setStatsData({
          totalRevenue: revenue,
          totalBookings: stats.total,
          activeBookings: stats.confirmed,
          blockedSlots: stats.blocked,
        })
      })
      .catch((err) => {
        console.error('Error fetching admin statistics:', err)
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu trang quản trị.')
      })
      .finally(() => setLoading(false))
  }, [])

  const statsList = [
    {
      label: 'Tổng doanh thu',
      value: loading ? '...' : formatCurrency(statsData.totalRevenue),
      icon: DollarSign,
      color: 'text-accent',
    },
    {
      label: 'Đơn đặt sân (Tổng)',
      value: loading ? '...' : statsData.totalBookings.toString(),
      icon: ShoppingCart,
      color: 'text-primary',
    },
    {
      label: 'Đơn đã xác nhận',
      value: loading ? '...' : statsData.activeBookings.toString(),
      icon: TrendingUp,
      color: 'text-accent',
    },
    {
      label: 'Sân đang bị khóa',
      value: loading ? '...' : statsData.blockedSlots.toString(),
      icon: BarChart3,
      color: 'text-primary',
    },
  ]

  // Calculate dynamic recent activities
  const recentActivities = bookings
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .map((b) => {
      let action = 'Đơn đặt sân mới'
      if (b.status === 'CANCELLED') action = 'Đơn đã hủy'
      if (b.status === 'BLOCKED') action = 'Khóa sân'

      const dateStr = new Date(b.bookingDate).toLocaleDateString('vi-VN')
      let details = `${b.userName} đã đặt Sân ${b.court.id} (${dateStr})`
      if (b.status === 'BLOCKED') {
        details = `Admin khóa Sân ${b.court.id} ngày ${dateStr} (${b.notes || 'Không có lý do'})`
      } else if (b.status === 'CANCELLED') {
        details = `Hủy đặt sân ${b.court.id} ngày ${dateStr} cho ${b.userName}`
      }

      // Calculate time ago or display date
      const createdDate = new Date(b.createdAt)
      const diffMs = new Date().getTime() - createdDate.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      let timeStr = 'Vừa xong'
      if (diffDays > 0) {
        timeStr = `${diffDays} ngày trước`
      } else if (diffHours > 0) {
        timeStr = `${diffHours} giờ trước`
      } else if (diffMins > 0) {
        timeStr = `${diffMins} phút trước`
      }

      return {
        action,
        details,
        time: timeStr,
      }
    })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Bảng điều khiển quản lý</h1>
            <p className="text-muted-foreground">Quản lý sân cầu lông, giá, và đơn đặt sân</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {error.includes('401') || error.includes('403')
                ? 'Bạn cần đăng nhập để xem dữ liệu quản trị.'
                : error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsList.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`${stat.color} h-8 w-8 opacity-85`} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Quản lý nhanh</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/admin/bookings"
                className="rounded-xl border-2 border-border bg-card p-6 hover:border-accent transition-all hover:shadow-sm"
              >
                <h3 className="font-semibold mb-2">Quản lý đặt sân</h3>
                <p className="text-sm text-muted-foreground">
                  Xem và quản lý các hoá đơn đặt sân
                </p>
                <div className="mt-4 inline-flex items-center text-accent font-medium">
                  Mở →
                </div>
              </Link>

              <Link
                href="/admin/pricing"
                className="rounded-xl border-2 border-border bg-card p-6 hover:border-accent transition-all hover:shadow-sm"
              >
                <h3 className="font-semibold mb-2">Điều chỉnh giá sân</h3>
                <p className="text-sm text-muted-foreground">
                  Cập nhật giá theo khung giờ và loại ngày
                </p>
                <div className="mt-4 inline-flex items-center text-accent font-medium">
                  Mở →
                </div>
              </Link>

              <Link
                href="/shop"
                className="rounded-xl border-2 border-border bg-card p-6 hover:border-accent transition-all hover:shadow-sm"
              >
                <h3 className="font-semibold mb-2">Quản lý cửa hàng</h3>
                <p className="text-sm text-muted-foreground">
                  Cập nhật sản phẩm và giá dụng cụ
                </p>
                <div className="mt-4 inline-flex items-center text-accent font-medium">
                  Mở →
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Hoạt động gần đây</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-sm text-muted-foreground flex items-center gap-1.5 py-4">
                  <Loader2 className="animate-spin" size={16} />
                  Đang tải hoạt động...
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4">
                  Không có hoạt động nào gần đây.
                </div>
              ) : (
                recentActivities.map((activity, i) => (
                  <div key={i} className="flex items-start justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-neutral-850">{activity.action}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{activity.details}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4 mt-0.5">
                      {activity.time}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
