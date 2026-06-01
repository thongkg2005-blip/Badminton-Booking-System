'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function BookingConfirmPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    notes: '',
    hasAccount: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    router.push('/booking/success')
    setIsLoading(false)
  }

  // Mock booking data - in real app, this would come from previous page
  const bookingData = {
    date: new Date().toLocaleDateString('vi-VN'),
    time: '17:00-19:00',
    courts: ['Sân 1', 'Sân 2'],
    pricePerCourt: 69000,
    total: 276000,
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-8 text-3xl font-bold">Xác nhận đặt sân</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="mb-4 text-lg font-semibold">Thông tin cá nhân</h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                        Họ tên <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder="Nhập họ tên của bạn"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Số điện thoại <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="0912 345 678"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium mb-2">
                        Ghi chú
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Ghi chú thêm (nếu có)"
                        rows={3}
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Option */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasAccount"
                      checked={formData.hasAccount}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-border accent-accent cursor-pointer"
                    />
                    <span className="font-medium">Tôi có tài khoản</span>
                  </label>

                  {formData.hasAccount && (
                    <div className="mt-4 space-y-4">
                      <input
                        type="text"
                        placeholder="Tên đăng nhập"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <input
                        type="password"
                        placeholder="Mật khẩu"
                        className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !formData.fullName || !formData.phone}
                  className="w-full rounded-lg bg-accent text-white py-3 font-medium transition-colors hover:bg-[rgb(15_110_86)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Đang xử lý...' : 'Xác nhận đặt sân'}
                </button>
              </form>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                <h3 className="mb-6 text-lg font-semibold">Tóm tắt đơn hàng</h3>

                <div className="mb-6 space-y-3 text-sm">
                  <div className="pb-3 border-b border-border">
                    <p className="text-muted-foreground">Ngày đặt sân</p>
                    <p className="font-medium">{bookingData.date}</p>
                  </div>

                  <div className="pb-3 border-b border-border">
                    <p className="text-muted-foreground">Khung giờ</p>
                    <p className="font-medium">{bookingData.time}</p>
                  </div>

                  <div className="pb-3 border-b border-border">
                    <p className="text-muted-foreground">Sân</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {bookingData.courts.map((court) => (
                        <span
                          key={court}
                          className="inline-block bg-[rgb(225_245_238)] px-2 py-1 rounded text-[rgb(15_110_86)] text-xs font-medium"
                        >
                          {court}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Giá/sân</span>
                      <span className="font-medium">{bookingData.pricePerCourt.toLocaleString()} đ</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-accent border-t border-border pt-3">
                      <span>Tổng cộng</span>
                      <span>{bookingData.total.toLocaleString()} đ</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/booking"
                  className="block w-full text-center text-sm text-accent hover:underline mb-3"
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
