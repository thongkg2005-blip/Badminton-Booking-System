'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import {
  Loader2,
  Package2,
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  Clock3,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { fetchAdminOrders, formatOrderCode, updateAdminOrderStatus, type Order } from '@/lib/order-api'
import { formatCurrency } from '@/lib/booking-pricing'

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setOrdersError(null)
    setOrdersLoading(true)
    try {
      const data = await fetchAdminOrders()
      setOrders(data)
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : 'Không thể tải danh sách đơn hàng')
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleOrderStatusChange = async (orderId: number, status: Order['orderStatus']) => {
    setUpdatingOrderId(orderId)
    setOrdersError(null)
    try {
      const updated = await updateAdminOrderStatus(orderId, status)
      setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)))
    } catch (err) {
      setOrdersError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái đơn hàng')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const completedOrders = orders.filter((order) => order.orderStatus === 'COMPLETED')
  const completedOrderRevenue = completedOrders.reduce(
    (sum, order) => sum + order.totalAmount + order.shippingAmount,
    0,
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Đơn đặt hàng</h1>
              <p className="text-muted-foreground">
                Xem danh sách đơn hàng sản phẩm và cập nhật trạng thái xử lý.
              </p>
            </div>
            <button
              type="button"
              onClick={loadOrders}
              className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-neutral-50 cursor-pointer"
            >
              <RefreshCw size={16} /> Làm mới
            </button>
          </div>

          {ordersError && (
            <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {ordersError}
            </div>
          )}

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <p className="mb-2 text-sm text-muted-foreground">Đơn hàng hoàn tất</p>
              <p className="text-3xl font-bold">
                {ordersLoading ? '...' : completedOrders.length}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <p className="mb-2 text-sm text-muted-foreground">Tổng doanh thu</p>
              <p className="text-3xl font-bold text-accent">
                {ordersLoading ? '...' : formatCurrency(completedOrderRevenue)}
              </p>
            </div>
          </div>

          {ordersLoading ? (
            <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="animate-spin" size={16} />
              Đang tải danh sách đơn hàng...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
              Chưa có đơn hàng nào.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const total = order.totalAmount + order.shippingAmount
                const statusOptions: { value: Order['orderStatus']; label: string }[] = [
                  { value: 'PENDING', label: 'Chờ xác nhận' },
                  { value: 'CONFIRMED', label: 'Đã xác nhận' },
                  { value: 'SHIPPING', label: 'Đang vận chuyển' },
                  { value: 'COMPLETED', label: 'Hoàn Tất' },
                ]

                return (
                  <div key={order.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Package2 size={16} className="text-accent" />
                          <span className="font-semibold">{formatOrderCode(order.id)}</span>
                        </div>

                        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {new Date(order.purchaseDate).toLocaleString('vi-VN')}
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard size={14} />
                            {order.paymentMethod === 'COD'
                              ? 'Thanh toán khi nhận hàng'
                              : 'Thanh toán ngay'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} />
                            {order.customerPhone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Truck size={14} />
                            {order.shippingAmount === 0
                              ? 'Miễn phí vận chuyển'
                              : formatCurrency(order.shippingAmount)}
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin size={14} className="mt-0.5 shrink-0" />
                          <span>{order.shippingAddress}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs font-medium">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${order.orderStatus === 'COMPLETED'
                                ? 'bg-green-100 text-green-700'
                                : order.orderStatus === 'SHIPPING'
                                  ? 'bg-blue-100 text-blue-700'
                                  : order.orderStatus === 'CONFIRMED'
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-yellow-100 text-yellow-700'
                              }`}
                          >
                            {statusOptions.find((s) => s.value === order.orderStatus)?.label ?? order.orderStatus}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-[220px] rounded-lg border border-border bg-background p-4">
                        <p className="text-sm font-medium text-foreground">Cập nhật trạng thái</p>
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleOrderStatusChange(
                              order.id,
                              e.target.value as Order['orderStatus'],
                            )
                          }
                          disabled={updatingOrderId === order.id}
                          className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
                        >
                          {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>

                        <p className="mt-3 text-xs text-muted-foreground">
                          Tổng thanh toán:{' '}
                          <span className="font-medium text-foreground">
                            {formatCurrency(total)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-border pt-4">
                      <p className="mb-2 text-sm font-medium text-foreground">Sản phẩm</p>
                      <div className="space-y-2 text-sm">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">
                              {item.product.name} x{item.quantity}
                            </span>
                            <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main >

      <Footer />
    </div >
  )
}
