'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { fetchOrder, formatOrderCode, type Order } from '@/lib/order-api'
import { formatPrice } from '@/lib/product-api'

function getPaymentMethodLabel(method: string) {
  return method === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thanh toán ngay'
}

function getPaymentStatusLabel(status: string) {
  return status === 'PENDING' ? 'Chờ thanh toán khi nhận hàng' : 'Đã thanh toán'
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const orderIdParam = searchParams.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const orderId = Number(orderIdParam)
    if (!orderIdParam || Number.isNaN(orderId)) {
      setError('Không tìm thấy mã đơn hàng.')
      return
    }

    fetchOrder(orderId)
      .then(setOrder)
      .catch((err: Error) => {
        setError(err.message || 'Không thể tải thông tin đơn hàng.')
      })
  }, [orderIdParam])

  const displayTotal = order
    ? order.totalAmount + order.shippingAmount
    : 0

  const paymentLabel = order ? getPaymentMethodLabel(order.paymentMethod) : ''
  const statusLabel = order ? getPaymentStatusLabel(order.paymentStatus) : ''
  const successMessage = order?.paymentMethod === 'COD'
    ? 'Đặt hàng thành công. Đơn hàng của bạn đã được ghi nhận.'
    : 'Thanh toán thành công. Đơn hàng của bạn đã được ghi nhận.'

  return (
    <div className="w-full max-w-md space-y-4">
      {order && !error && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-accent/30 bg-[rgb(225_245_238)] p-4 text-left text-sm text-[rgb(15_110_86)]"
        >
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{successMessage}</p>
            <p className="mt-1 text-[rgb(42_123_101)]">
              Mã đơn hàng: {formatOrderCode(order.id)}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-accent" />
        <h1 className="mb-2 text-2xl font-bold">
          {order?.paymentMethod === 'COD' ? 'Đặt hàng thành công!' : 'Thanh toán thành công!'}
        </h1>
        <p className="mb-6 text-muted-foreground">
          {order?.paymentMethod === 'COD'
            ? 'Đơn hàng đã được ghi nhận. Bạn thanh toán khi nhận hàng.'
            : 'Cảm ơn bạn đã mua hàng. Đơn hàng đã được ghi nhận và tồn kho đã được cập nhật.'}
        </p>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {order && (
          <>
            <div className="mb-6 rounded-lg bg-[rgb(225_245_238)] p-4 text-left">
              <p className="text-sm font-medium text-[rgb(15_110_86)] mb-3">Chi tiết đơn hàng</p>
              <div className="space-y-2 text-sm text-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã đơn hàng:</span>
                  <span className="font-medium">{formatOrderCode(order.id)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Người nhận:</span>
                  <span className="font-medium">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày:</span>
                  <span className="font-medium">
                    {new Date(order.purchaseDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sản phẩm:</span>
                  <span className="font-medium">{order.items.length} mặt hàng</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phương thức thanh toán:</span>
                  <span className="font-medium">{paymentLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trạng thái thanh toán:</span>
                  <span className="font-medium text-accent">{statusLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Địa chỉ giao hàng:</span>
                  <span className="font-medium text-right max-w-[60%]">{order.shippingAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng tiền sản phẩm:</span>
                  <span className="font-medium text-accent">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vận chuyển:</span>
                  <span className="font-medium">{order.shippingAmount === 0 ? 'Miễn phí' : formatPrice(order.shippingAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="text-muted-foreground">Tổng thanh toán:</span>
                  <span className="font-medium text-accent">{formatPrice(displayTotal)}</span>
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-border p-4 text-left text-sm">
              <p className="mb-3 font-medium">Sản phẩm đã mua</p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span className="font-medium">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

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
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Suspense fallback={<p className="text-muted-foreground">Đang tải...</p>}>
          <PaymentSuccessContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
