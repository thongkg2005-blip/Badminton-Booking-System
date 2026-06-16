'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Search, Loader2, ArrowLeftRight, Check, AlertTriangle, RefreshCw } from 'lucide-react'
import { TIME_SLOTS, getDayType, getPrice, formatCurrency, COURTS } from '@/lib/booking-pricing'
import { backendJson } from '@/lib/backend-api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

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

const STATUS_COLORS = {
  CONFIRMED: { bg: 'bg-green-50 text-green-800 border-green-200', label: 'Đã xác nhận' },
  CANCELLED: { bg: 'bg-red-50 text-red-800 border-red-200', label: 'Đã hủy' },
  BLOCKED: { bg: 'bg-yellow-50 text-yellow-800 border-yellow-200', label: 'Đã khóa' },
}

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0, blocked: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit Court Modal State
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [selectedCourtId, setSelectedCourtId] = useState<number>(1)
  const [updatingCourt, setUpdatingCourt] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const fetchBookingsAndStats = useCallback(async () => {
    try {
      setLoading(true)
      const data = await backendJson<Booking[]>('/admin/bookings')
      const statsData = await backendJson<{ total: number; confirmed: number; cancelled: number; blocked: number }>('/admin/bookings/stats')
      setBookings(data)
      setStats(statsData)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách đặt sân.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookingsAndStats()
  }, [fetchBookingsAndStats])

  const handleConfirm = async (id: number) => {
    try {
      await backendJson(`/admin/bookings/${id}/confirm`, { method: 'POST' })
      fetchBookingsAndStats()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Xác nhận thất bại')
    }
  }

  const handleCancel = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn đặt sân này không?')) return
    // Optimistic update: flip status immediately so the UI reacts at once
    setBookings((prev) =>
      prev.map((b) => b.id === id ? { ...b, status: 'CANCELLED' as const } : b)
    )
    setStats((prev) => ({
      ...prev,
      confirmed: Math.max(0, prev.confirmed - 1),
      cancelled: prev.cancelled + 1,
    }))
    try {
      await backendJson(`/admin/bookings/${id}/cancel`, { method: 'POST' })
      // Re-fetch to get authoritative state
      fetchBookingsAndStats()
    } catch (err: unknown) {
      // Roll back optimistic update on failure
      fetchBookingsAndStats()
      alert(err instanceof Error ? err.message : 'Hủy đơn thất bại')
    }
  }

  const openEditCourtModal = (booking: Booking) => {
    setEditingBooking(booking)
    setSelectedCourtId(booking.court.id)
    setUpdateError(null)
  }

  const handleUpdateCourt = async () => {
    if (!editingBooking) return
    try {
      setUpdatingCourt(true)
      setUpdateError(null)
      await backendJson(`/admin/bookings/${editingBooking.id}/court`, {
        method: 'PUT',
        body: JSON.stringify({ courtId: selectedCourtId }),
      })
      setEditingBooking(null)
      fetchBookingsAndStats()
    } catch (err: unknown) {
      setUpdateError(err instanceof Error ? err.message : 'Đổi sân thất bại')
    } finally {
      setUpdatingCourt(false)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = !statusFilter || booking.status === statusFilter
    const matchesSearch =
      booking.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(booking.id).includes(searchQuery)
    return matchesStatus && matchesSearch
  })

  // Dynamic Revenue calculation
  const totalRevenue = bookings
    .filter(b => b.status === 'CONFIRMED')
    .reduce((sum, b) => {
      const startHour = parseInt(b.startTime.split(':')[0], 10)
      const slot = TIME_SLOTS.find(s => s.start === startHour)
      const dateObj = new Date(b.bookingDate)
      const dayType = getDayType(dateObj)
      const price = slot ? getPrice(slot, dayType) : 0
      return sum + price
    }, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Quản lý đặt sân</h1>
              <p className="text-muted-foreground">Xem trạng thái sân, hóa đơn và đổi sân linh hoạt</p>
            </div>
            <button
              onClick={fetchBookingsAndStats}
              className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-50 cursor-pointer"
            >
              <RefreshCw size={16} /> Làm mới
            </button>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2">Tổng số đơn</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2">Đã xác nhận</p>
              <p className="text-3xl font-bold text-accent">{stats.confirmed}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-2">Doanh thu tạm tính (Đã xác nhận)</p>
              <p className="text-3xl font-bold text-accent">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>

          {/* Filter & Search */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm theo tên khách hàng hoặc mã hoá đơn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <select
              value={statusFilter || ''}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="BLOCKED">Đã khóa</option>
            </select>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive flex gap-2 items-center">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Mã HĐ</th>
                    <th className="px-6 py-3 text-left font-semibold">Khách hàng</th>
                    <th className="px-6 py-3 text-left font-semibold">Ngày sân</th>
                    <th className="px-6 py-3 text-left font-semibold">Khung giờ</th>
                    <th className="px-6 py-3 text-left font-semibold">Sân</th>
                    <th className="px-6 py-3 text-left font-semibold">Tổng tiền</th>
                    <th className="px-6 py-3 text-left font-semibold">Trạng thái</th>
                    <th className="px-6 py-3 text-left font-semibold">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                        <Loader2 className="animate-spin mx-auto mb-2" />
                        Đang tải danh sách đặt sân...
                      </td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                        Không tìm thấy đơn đặt sân nào
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => {
                      const startHour = parseInt(booking.startTime.split(':')[0], 10)
                      const slot = TIME_SLOTS.find((s) => s.start === startHour)
                      const dateObj = new Date(booking.bookingDate)
                      const dayType = getDayType(dateObj)
                      const price = slot ? getPrice(slot, dayType) : 0

                      const statusColor =
                        STATUS_COLORS[booking.status as keyof typeof STATUS_COLORS] || {
                          bg: 'bg-neutral-50 text-neutral-800 border-neutral-200',
                          label: booking.status,
                        }

                      return (
                        <tr key={booking.id} className="hover:bg-neutral-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-neutral-800">#{booking.id}</td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-neutral-900">{booking.userName}</div>
                            <div className="text-xs text-muted-foreground">{booking.userPhone || 'Không có SĐT'}</div>
                            {booking.notes && (
                              <div className="text-xs italic text-neutral-500 mt-1 max-w-[200px] truncate" title={booking.notes}>
                                Ghi chú: {booking.notes}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-neutral-700">
                            {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 text-neutral-700 font-medium">
                            {booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)}
                          </td>
                          <td className="px-6 py-4 text-neutral-700">
                            <span className="inline-flex items-center gap-1 bg-accent/10 px-2 py-1 rounded text-accent text-xs font-semibold">
                              {booking.court.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-accent">
                            {formatCurrency(price)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${statusColor.bg}`}
                            >
                              {statusColor.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 space-x-2">
                            {booking.status === 'CONFIRMED' && (
                              <>
                                <button
                                  onClick={() => openEditCourtModal(booking)}
                                  className="text-accent hover:text-accent/80 text-xs font-semibold cursor-pointer underline"
                                >
                                  Đổi sân
                                </button>
                                <span className="text-neutral-300">|</span>
                                <button
                                  onClick={() => handleCancel(booking.id)}
                                  className="text-destructive hover:text-destructive/80 text-xs font-semibold cursor-pointer underline"
                                >
                                  Hủy đơn
                                </button>
                              </>
                            )}
                            {booking.status === 'BLOCKED' && (
                              <button
                                onClick={() => handleCancel(booking.id)}
                                className="text-destructive hover:text-destructive/80 text-xs font-semibold cursor-pointer underline"
                              >
                                Bỏ khóa (Hủy)
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Court Dialog */}
      <Dialog open={editingBooking !== null} onOpenChange={(open) => !open && setEditingBooking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <ArrowLeftRight className="text-accent" size={20} />
              Đổi sân đặt chỗ
            </DialogTitle>
          </DialogHeader>

          {editingBooking && (
            <div className="space-y-4 py-4 text-sm text-foreground">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-neutral-50 p-4 border border-border">
                <div>
                  <span className="text-xs text-muted-foreground block">Khách hàng</span>
                  <span className="font-semibold text-neutral-800">{editingBooking.userName}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Mã đơn</span>
                  <span className="font-semibold text-neutral-800">#{editingBooking.id}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Thời gian</span>
                  <span className="font-medium text-neutral-700">
                    {editingBooking.startTime.substring(0, 5)} - {editingBooking.endTime.substring(0, 5)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Ngày sân</span>
                  <span className="font-medium text-neutral-700">
                    {new Date(editingBooking.bookingDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="newCourt" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Chọn sân mới muốn chuyển đến
                </label>
                <select
                  id="newCourt"
                  value={selectedCourtId}
                  onChange={(e) => setSelectedCourtId(Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {COURTS.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name} {court.id === editingBooking.court.id ? '(Hiện tại)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {updateError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex gap-2 items-center">
                  <AlertTriangle size={14} />
                  <span>{updateError}</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="sm:justify-end gap-2">
            <button
              onClick={() => setEditingBooking(null)}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleUpdateCourt}
              disabled={updatingCourt || (editingBooking !== null && selectedCourtId === editingBooking.court.id)}
              className="rounded-lg bg-accent hover:bg-[rgb(15_110_86)] text-white px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {updatingCourt ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Xác nhận chuyển
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
