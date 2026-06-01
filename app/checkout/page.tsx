'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Lock } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    email: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    // In real implementation, this would call a Stripe API endpoint
    router.push('/payment/success')
    setIsProcessing(false)
  }

  const cartItems = [
    { name: 'Vợt cầu lông Yonex', price: 2500000, qty: 1 },
    { name: 'Giày cầu lông Li Ning', price: 1200000, qty: 2 },
  ]

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.qty, 0)
  const shipping = 50000
  const total = subtotal + shipping

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-8 text-3xl font-bold">Thanh toán</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Email */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-4 text-lg font-semibold">Thông tin liên hệ</h2>
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

                {/* Card Information */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock size={20} className="text-accent" />
                    <h2 className="text-lg font-semibold">Thông tin thẻ</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Card Preview */}
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
                          <p className="text-sm font-mono">
                            {formData.expiryDate || 'MM/YY'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tên chủ thẻ
                      </label>
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

                    {/* Card Number */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Số thẻ
                      </label>
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

                    {/* Expiry & CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Hạn sử dụng
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '').slice(0, 4)
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2)
                            }
                            setFormData((prev) => ({
                              ...prev,
                              expiryDate: value,
                            }))
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full rounded-lg bg-accent text-white py-3 font-medium transition-colors hover:bg-[rgb(15_110_86)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Đang xử lý thanh toán...' : 'Thanh toán ngay'}
                </button>

                {/* Security Note */}
                <p className="text-xs text-muted-foreground text-center">
                  🔒 Thanh toán của bạn được bảo mật bằng Stripe. Chúng tôi không lưu thông tin thẻ.
                </p>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                <h3 className="mb-6 text-lg font-semibold">Tóm tắt đơn hàng</h3>

                <div className="mb-6 space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm pb-3 border-b border-border">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">x{item.qty}</p>
                      </div>
                      <p className="font-medium">
                        {(item.price * item.qty).toLocaleString()} đ
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-sm mb-6 pb-6 border-b border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium">{subtotal.toLocaleString()} đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vận chuyển</span>
                    <span className="font-medium">{shipping.toLocaleString()} đ</span>
                  </div>
                </div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-accent">{total.toLocaleString()} đ</span>
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
