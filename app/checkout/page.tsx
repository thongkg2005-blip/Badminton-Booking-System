'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Lock } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { useProducts } from '@/hooks/use-products'
import { createOrder } from '@/lib/order-api'
import {
  formatPrice,
  getDiscountedPrice,
} from '@/lib/product-api'
import {
  calculateOrderTotal,
  calculateShipping,
} from '@/lib/cart-pricing'

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, clearCart } = useCart()
  const { products, loading, error } = useProducts()
  const [isProcessing, setIsProcessing] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    customerName: '',
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    email: '',
  })

  useEffect(() => {
    if (!loading && cartItems.length === 0) {
      router.replace('/cart')
    }
  }, [cartItems.length, loading, router])

  const cartLines = useMemo(() => {
    return cartItems
      .map((item) => {
        const product = products.find((p) => p.id === item.id)
        if (!product) return null
        const unitPrice = getDiscountedPrice(product)
        return {
          product,
          quantity: item.quantity,
          unitPrice,
          lineTotal: unitPrice * item.quantity,
        }
      })
      .filter((line): line is NonNullable<typeof line> => line !== null)
  }, [cartItems, products])

  const subtotal = cartLines.reduce((total, line) => total + line.lineTotal, 0)
  const shipping = calculateShipping(subtotal)
  const total = calculateOrderTotal(subtotal)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const customerName = formData.customerName.trim()
    if (customerName.length < 2) {
      setSubmitError('Vui lòng nhập họ tên hợp lệ.')
      return
    }

    if (cartLines.length === 0) {
      setSubmitError('Giỏ hàng không còn sản phẩm hợp lệ.')
      return
    }

    setIsProcessing(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200))

      const order = await createOrder(
        customerName,
        cartLines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),
      )

      clearCart()
      router.push(`/payment/success?orderId=${order.id}&shipping=${shipping}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể hoàn tất thanh toán'
      setSubmitError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <p className="text-muted-foreground">Đang tải thông tin thanh toán...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <p className="font-medium text-destructive">Không thể tải thông tin sản phẩm</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-8 text-3xl font-bold">Thanh toán</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-4 text-lg font-semibold">Thông tin người nhận</h2>
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      required
                      placeholder="Họ và tên"
                      className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="email@example.com"
                      className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock size={20} className="text-accent" />
                    <h2 className="text-lg font-semibold">Thông tin thẻ</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg bg-gradient-to-br from-primary to-secondary text-white p-6 mb-6">
                      <p className="text-sm opacity-75 mb-4">Số thẻ</p>
                      <p className="font-mono text-xl tracking-widest mb-8">
                        {formData.cardNumber || '•••• •••• •••• ••••'}
                      </p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs opacity-75">Chủ thẻ</p>
                          <p className="text-sm font-medium">
                            {formData.cardName || 'Tên chủ thẻ'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs opacity-75">HSD</p>
                          <p className="text-sm font-mono">{formData.expiryDate || 'MM/YY'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Tên chủ thẻ</label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        required
                        placeholder="Tên như trên thẻ"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Số thẻ</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 16)
                          setFormData((prev) => ({
                            ...prev,
                            cardNumber: value.replace(/(\d{4})/g, '$1 ').trim(),
                          }))
                        }}
                        required
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full rounded-lg border border-border px-4 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Hạn sử dụng</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '').slice(0, 4)
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2)
                            }
                            setFormData((prev) => ({ ...prev, expiryDate: value }))
                          }}
                          required
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full rounded-lg border border-border px-4 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 3)
                            setFormData((prev) => ({ ...prev, cvv: value }))
                          }}
                          required
                          placeholder="123"
                          maxLength={3}
                          className="w-full rounded-lg border border-border px-4 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing || cartLines.length === 0}
                  className="w-full rounded-lg bg-accent text-white py-3 font-medium transition-colors hover:bg-[rgb(15_110_86)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Đang xử lý thanh toán...' : 'Thanh toán ngay'}
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  Thanh toán thẻ hiện được mô phỏng cho demo. Đơn hàng thật sẽ được lưu và trừ tồn kho sau khi xác nhận.
                </p>
              </form>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                <h3 className="mb-6 text-lg font-semibold">Tóm tắt đơn hàng</h3>

                <div className="mb-6 space-y-3 max-h-64 overflow-y-auto">
                  {cartLines.map((line) => (
                    <div
                      key={line.product.id}
                      className="flex justify-between text-sm pb-3 border-b border-border"
                    >
                      <div>
                        <p className="font-medium">{line.product.name}</p>
                        <p className="text-xs text-muted-foreground">x{line.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice(line.lineTotal)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vận chuyển</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-accent">{formatPrice(total)}</span>
                </div>

                <Link
                  href="/cart"
                  className="mt-6 block text-center text-sm text-accent hover:underline"
                >
                  Quay lại chỉnh sửa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
