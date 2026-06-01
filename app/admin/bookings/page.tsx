'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { ChevronDown, Search, Filter } from 'lucide-react'

const MOCK_BOOKINGS = [
  {
    id: '#2026051201',
    customer: 'Nguyễn Văn A',
    date: '2026-05-24',
    time: '17:00-19:00',
    courts: 'Sân 1, Sân 2',
    total: 276000,
    status: 'pending',
  },
  {
    id: '#2026051202',
    customer: 'Trần Thị B',
    date: '2026-05-25',
    time: '09:00-11:00',
    courts: 'Sân 3',
    total: 80000,
    status: 'paid',
  },
  {
    id: '#2026051203',
    customer: 'Lê Văn C',
    date: '2026-05-26',
    time: '19:00-21:00',
    courts: 'Sân 4, Sân 5, Sân 6',
    total: 414000,
    status: 'paid',
  },
  {
    id: '#2026051204',
    customer: 'Phạm Thị D',
    date: '2026-05-23',
    time: '15:00-17:00',
    courts: 'Sân 7',
    total: 80000,
    status: 'cancelled',
  },
]

const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-800', label: 'Chờ xác nhận' },
  paid: { bg: 'bg-green-50', text: 'text-green-800', label: 'Đã thanh toán' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-800', label: 'Đã hủy' },
}

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBookings = MOCK_BOOKINGS.filter((booking) => {
    const matchesStatus = !statusFilter || booking.status === statusFilter
    const matchesSearch = booking.customer
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) || booking.id.includes(searchQuery)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Quản lý đặt sân</h1>
            <p className="text-muted-foreground">Quản lý các hoá đơn đặt sân cầu lông</p>
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
              <option value="pending">Chờ xác nhận</option>
              <option value="paid">Đã thanh toán</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
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
                  {filteredBookings.map((booking) => {
                    const statusColor =
                      STATUS_COLORS[booking.status as keyof typeof STATUS_COLORS]

                    return (
                      <tr key={booking.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 font-medium">{booking.id}</td>
                        <td className="px-6 py-4">{booking.customer}</td>
                        <td className="px-6 py-4">
                          {new Date(booking.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">{booking.time}</td>
                        <td className="px-6 py-4 text-xs">{booking.courts}</td>
                        <td className="px-6 py-4 font-semibold text-accent">
                          {booking.total.toLocaleString()} đ
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}
                          >
                            {statusColor.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-accent hover:underline text-xs font-medium">
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredBookings.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                <p>Không tìm thấy đơn đặt sân nào</p>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Tổng hoá đơn</p>
              <p className="text-3xl font-bold">{MOCK_BOOKINGS.length}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Đã thanh toán</p>
              <p className="text-3xl font-bold text-accent">
                {MOCK_BOOKINGS.filter((b) => b.status === 'paid').length}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Tổng doanh thu</p>
              <p className="text-3xl font-bold text-accent">
                {MOCK_BOOKINGS.filter((b) => b.status === 'paid')
                  .reduce((sum, b) => sum + b.total, 0)
                  .toLocaleString()}{' '}
                đ
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
