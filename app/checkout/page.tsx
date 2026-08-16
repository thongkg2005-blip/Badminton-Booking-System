'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { CreditCard, MapPin, Truck } from 'lucide-react'
import { removeAuthSession } from '@/lib/auth-api'
import { useCart } from '@/contexts/cart-context'
import { useProducts } from '@/hooks/use-products'
import { createOrder } from '@/lib/order-api'
import { formatPrice, getDiscountedPrice } from '@/lib/product-api'
import { FREE_SHIPPING_THRESHOLD, calculateOrderTotal, calculateShipping } from '@/lib/cart-pricing'

type PaymentMethod = 'ONLINE' | 'COD'

type CheckoutForm = {
  customerName: string
  customerEmail: string
  customerPhone: string
  street: string
  ward: string
  district: string
  province: string
  paymentMethod: PaymentMethod
  cardName: string
  cardNumber: string
  expiryDate: string
  cvv: string
}

const emptyForm: CheckoutForm = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  street: '',
  ward: '',
  district: '',
  province: '',
  paymentMethod: 'ONLINE',
  cardName: '',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
}

function readUserFromStorage() {
  const storedUser = localStorage.getItem('user')
  const token = localStorage.getItem('token')

  if (!storedUser || !token) {
    return null
  }

  try {
    return JSON.parse(storedUser) as { fullName?: string; email?: string; phone?: string }
  } catch {
    removeAuthSession()
    return null
  }
}

function composeAddress(formData: CheckoutForm) {
  return [formData.street.trim(), formData.ward.trim(), formData.district.trim(), formData.province.trim()]
    .filter(Boolean)
    .join(', ')
}

async function readErrorMessage(response: Response) {
  const raw = await response.text()
  if (!raw) return 'Không thể hoàn tất đơn hàng'

  try {
    const parsed = JSON.parse(raw)
    return parsed.message || parsed.error || raw
  } catch {
    return raw
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, clearCart } = useCart()
  const { products, loading, error } = useProducts()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOrderCompleted, setIsOrderCompleted] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CheckoutForm>(emptyForm)

  useEffect(() => {
    const user = readUserFromStorage()
    if (!user) {
      router.replace('/auth')
      return
    }

    setFormData((prev) => ({
      ...prev,
      customerName: user.fullName ?? '',
      customerEmail: user.email ?? '',
      customerPhone: user.phone ?? '',
    }))
    setIsCheckingAuth(false)
  }, [router])

  useEffect(() => {
    if (!loading && !isProcessing && !isOrderCompleted && cartItems.length === 0) {
      router.replace('/cart')
    }
  }, [cartItems.length, isOrderCompleted, isProcessing, loading, router])

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!formData.customerName.trim()) nextErrors.customerName = 'Vui lòng nhập họ tên'
    if (!formData.customerEmail.trim()) nextErrors.customerEmail = 'Vui lòng nhập email'
    if (!formData.customerPhone.trim()) nextErrors.customerPhone = 'Vui lòng nhập số điện thoại'
    if (!formData.street.trim()) nextErrors.street = 'Vui lòng nhập số nhà, tên đường'
    if (!formData.ward.trim()) nextErrors.ward = 'Vui lòng nhập phường/xã'
    if (!formData.district.trim()) nextErrors.district = 'Vui lòng nhập quận/huyện'
    if (!formData.province.trim()) nextErrors.province = 'Vui lòng nhập tỉnh/thành phố'

    if (formData.customerName.trim().length < 2) nextErrors.customerName = 'Họ tên không hợp lệ'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail.trim())) {
      nextErrors.customerEmail = 'Email không hợp lệ'
    }
    if (!/^0\d{9}$/.test(formData.customerPhone.replace(/\s/g, ''))) {
      nextErrors.customerPhone = 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0'
    }

    if (formData.paymentMethod === 'ONLINE') {
      if (!formData.cardName.trim()) nextErrors.cardName = 'Vui lòng nhập tên chủ thẻ'
      if (!/^[0-9\s]{19}$/.test(formData.cardNumber.trim())) nextErrors.cardNumber = 'Số thẻ không hợp lệ'
      if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate.trim())) nextErrors.expiryDate = 'Hạn sử dụng không hợp lệ'
      if (!/^\d{3}$/.test(formData.cvv.trim())) nextErrors.cvv = 'CVV không hợp lệ'
    }

    return nextErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setSubmitError(Object.values(validationErrors)[0])
      return
    }

    if (cartLines.length === 0) {
      setSubmitError('Giỏ hàng không còn sản phẩm hợp lệ.')
      return
    }

    setIsProcessing(true)

    try {
      const order = await createOrder({
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.replace(/\s/g, ''),
        shippingAddress: composeAddress(formData),
        paymentMethod: formData.paymentMethod,
        items: cartLines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),
      })

      setIsOrderCompleted(true)
      clearCart()
      router.replace(`/payment/success?orderId=${order.id}`)
    } catch (err) {
      if (err instanceof Response) {
        setSubmitError(await readErrorMessage(err))
      } else {
        setSubmitError(err instanceof Error ? err.message : 'Không thể hoàn tất thanh toán')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading || isCheckingAuth) {
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

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-4 text-lg font-semibold">Thông tin người nhận</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Họ và tên</label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Email</label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Số điện thoại</label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleChange}
                        placeholder="0123456789"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Số nhà, tên đường</label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="123 Nguyễn Trãi"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Phường/Xã</label>
                      <input
                        type="text"
                        name="ward"
                        value={formData.ward}
                        onChange={handleChange}
                        placeholder="Phường 1"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Quận/Huyện</label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        placeholder="Quận 3"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium">Tỉnh/Thành phố</label>
                      <input
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        placeholder="TP. Hồ Chí Minh"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Truck size={20} className="text-accent" />
                    <h2 className="text-lg font-semibold">Phương thức thanh toán</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'ONLINE' }))}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        formData.paymentMethod === 'ONLINE'
                          ? 'border-accent bg-[rgb(225_245_238)]'
                          : 'border-border bg-card hover:border-accent/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-accent" />
                        <span className="font-medium">Thanh toán ngay</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Thanh toán bằng thẻ cho đơn hàng này.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, paymentMethod: 'COD' }))}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        formData.paymentMethod === 'COD'
                          ? 'border-accent bg-[rgb(225_245_238)]'
                          : 'border-border bg-card hover:border-accent/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-accent" />
                        <span className="font-medium">Thanh toán khi nhận hàng</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Trả tiền mặt cho nhân viên giao hàng.
                      </p>
                    </button>
                  </div>
                </div>

                {formData.paymentMethod === 'ONLINE' && (
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="mb-4 text-lg font-semibold">Thông tin thẻ</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Tên chủ thẻ</label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleChange}
                          placeholder="Tên như trên thẻ"
                          className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium">Số thẻ</label>
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
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full rounded-lg border border-border px-4 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium">Hạn sử dụng</label>
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
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full rounded-lg border border-border px-4 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">CVV</label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 3)
                              setFormData((prev) => ({ ...prev, cvv: value }))
                            }}
                            placeholder="123"
                            maxLength={3}
                            className="w-full rounded-lg border border-border px-4 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {submitError && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing || cartLines.length === 0}
                  className="w-full rounded-lg bg-accent py-3 font-medium text-white transition-colors hover:bg-[rgb(15_110_86)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing
                    ? 'Đang xử lý đơn hàng...'
                    : formData.paymentMethod === 'COD'
                      ? 'Đặt hàng'
                      : 'Thanh toán ngay'}
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  {formData.paymentMethod === 'COD'
                    ? 'Đơn hàng sẽ được lưu với trạng thái chờ thanh toán khi nhận hàng.'
                    : 'Thanh toán trực tuyến hiện được mô phỏng cho demo.'}
                </p>
              </form>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                <h3 className="mb-6 text-lg font-semibold">Tóm tắt đơn hàng</h3>

                <div className="mb-6 max-h-64 space-y-3 overflow-y-auto">
                  {cartLines.map((line) => (
                    <div key={line.product.id} className="flex justify-between border-b border-border pb-3 text-sm">
                      <div>
                        <p className="font-medium">{line.product.name}</p>
                        <p className="text-xs text-muted-foreground">x{line.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice(line.lineTotal)}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-6 space-y-2 border-b border-border pb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vận chuyển</span>
                    <span className="font-medium">{shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}</span>
                  </div>
                </div>

                <div className="mb-4 flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-accent">{formatPrice(total)}</span>
                </div>

                {subtotal > FREE_SHIPPING_THRESHOLD && (
                  <p className="mb-4 rounded bg-[rgb(225_245_238)] p-3 text-center text-xs text-accent">
                    ✓ Bạn được miễn phí vận chuyển!
                  </p>
                )}

                <Link href="/cart" className="block text-center text-sm text-accent hover:underline">
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
