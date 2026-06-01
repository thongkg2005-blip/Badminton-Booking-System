'use client'

import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { BarChart3, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react'

export default function AdminPage() {
  const stats = [
    {
      label: 'Tổng doanh thu',
      value: '15.2M',
      icon: DollarSign,
      color: 'text-accent',
    },
    {
      label: 'Đơn đặt sân',
      value: '124',
      icon: ShoppingCart,
      color: 'text-primary',
    },
    {
      label: 'Tăng trưởng',
      value: '+23%',
      icon: TrendingUp,
      color: 'text-accent',
    },
    {
      label: 'Sân đã sử dụng',
      value: '85%',
      icon: BarChart3,
      color: 'text-primary',
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Bảng điều khiển quản lý</h1>
            <p className="text-muted-foreground">Quản lý sân cầu lông, giá, và đơn đặt sân</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`${stat.color} h-8 w-8 opacity-80`} />
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
                className="rounded-xl border-2 border-border bg-card p-6 hover:border-accent transition-colors"
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
                className="rounded-xl border-2 border-border bg-card p-6 hover:border-accent transition-colors"
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
                className="rounded-xl border-2 border-border bg-card p-6 hover:border-accent transition-colors"
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
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Hoạt động gần đây</h2>
            <div className="space-y-4">
              {[
                {
                  action: 'Đơn đặt sân mới',
                  details: 'Nguyễn Văn A đã đặt 2 sân',
                  time: '2 giờ trước',
                },
                {
                  action: 'Thanh toán thành công',
                  details: 'Trần Thị B thanh toán 276.000 đ',
                  time: '4 giờ trước',
                },
                {
                  action: 'Cập nhật giá',
                  details: 'Giá buổi tối được tăng lên 69.000 đ',
                  time: '1 ngày trước',
                },
                {
                  action: 'Đơn hủy',
                  details: 'Lê Văn C hủy đơn #2026051204',
                  time: '1 ngày trước',
                },
              ].map((activity, i) => (
                <div key={i} className="flex items-start justify-between pb-4 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
