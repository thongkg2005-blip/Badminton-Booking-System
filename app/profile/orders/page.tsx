'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Package2, Calendar, MapPin, Phone, CreditCard, Truck, CheckCircle2, Clock3 } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { fetchMyOrders, formatOrderCode, type Order } from '@/lib/order-api'
import { formatPrice } from '@/lib/product-api'

function getPaymentMethodLabel(method: string) {
  return method === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thanh toán ngay'
}

function getPaymentStatusBadge(status: string) {
  if (status === 'PAID') {
    return 'bg-green-100 text-green-700'
  }
  return 'bg-yellow-100 text-yellow-700'
}

function getOrderStatusBadge(status: string) {
  if (status === 'COMPLETED') return 'bg-green-100 text-green-700'
  if (status === 'SHIPPING')  return 'bg-blue-100 text-blue-700'
  if (status === 'CONFIRMED') return 'bg-indigo-100 text-indigo-700'
  return 'bg-yellow-100 text-yellow-700' // PENDING
}

function getOrderStatusLabel(status: string) {
  if (status === 'COMPLETED') return 'Hoàn Tất'
  if (status === 'SHIPPING')  return 'Đang vận chuyển'
  if (status === 'CONFIRMED') return 'Đã xác nhận'
  return 'Chờ xác nhận'
}

function getPaymentStatusLabel(status: string) {
  return status === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'
}

function formatDate(value: string) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString('vi-VN')
}

export default function OrderHistoryPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!storedUser || !token) {
      router.replace('/auth')
      return
    }

    fetchMyOrders()
      .then(setOrders)
      .catch((err: Error) => {
        setError(err.message || 'Không thể tải lịch sử đơn hàng')
      })
      .finally(() => setIsLoading(false))
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Đơn đặt hàng</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Lịch sử các đơn hàng sản phẩm của bạn.
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
            <Package2 size={32} className="mx-auto mb-2 opacity-60" />
            <p className="font-medium">{error}</p>
            <Link
              href="/shop"
              className="mt-4 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <Package2 size={48} className="mx-auto mb-4 text-muted-foreground opacity-40" />
            <h3 className="text-lg font-semibold text-foreground">Chưa có đơn hàng nào</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Hãy mua một vài sản phẩm để xem lịch sử đơn hàng tại đây.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
            >
              Mua hàng ngay
            </Link>
          </div>
        )}

        {!isLoading && !error && orders.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tổng cộng <strong>{orders.length}</strong> đơn hàng
            </p>

            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Package2 size={16} className="text-accent" />
                      <span className="font-semibold text-foreground">
                        {formatOrderCode(order.id)}
                      </span>
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {formatDate(order.purchaseDate)}
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard size={14} />
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} />
                        {order.customerPhone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck size={14} />
                        {order.shippingAmount === 0 ? 'Miễn phí vận chuyển' : formatPrice(order.shippingAmount)}
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin size={14} className="mt-0.5 shrink-0" />
                      <span>{order.shippingAddress}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs font-medium">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${getOrderStatusBadge(order.orderStatus)}`}>
                        {getOrderStatusLabel(order.orderStatus)}
                      </span>
                    </div>
                  </div>
                  
                </div>

                <div className="mt-4 rounded-lg bg-muted/30 p-4">
                  <p className="mb-3 text-sm font-medium text-foreground">Sản phẩm</p>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                        <div>
                          <p className="font-medium text-foreground">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                        </div>
                        <p className="font-medium text-foreground">{formatPrice(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-muted-foreground">Tổng thanh toán</span>
                    <span className="text-lg font-bold text-accent">
                      {formatPrice(order.totalAmount + order.shippingAmount)}
                    </span>
                  </div>
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