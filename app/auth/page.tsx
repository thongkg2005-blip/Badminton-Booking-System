'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    router.push('/')
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
          {/* Tabs */}
          <div className="mb-8 flex gap-2 border-b border-border">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                isLogin ? 'border-accent text-accent' : 'border-transparent text-muted-foreground'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                !isLogin ? 'border-accent text-accent' : 'border-transparent text-muted-foreground'
              }`}
            >
              Đăng ký
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login Form */}
            {isLogin ? (
              <>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Nhập tên đăng nhập"
                    className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Nhập mật khẩu"
                    className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !formData.username || !formData.password}
                  className="w-full rounded-lg bg-primary text-white py-2 font-medium transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                    Họ tên
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Nhập họ tên"
                    className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Số điện thoại
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
                  <label htmlFor="reg-username" className="block text-sm font-medium mb-2">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    id="reg-username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Chọn tên đăng nhập"
                    className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium mb-2">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    id="reg-password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Nhập mật khẩu"
                    className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Xác nhận mật khẩu"
                    className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !formData.fullName ||
                    !formData.phone ||
                    !formData.username ||
                    !formData.password ||
                    !formData.confirmPassword ||
                    formData.password !== formData.confirmPassword
                  }
                  className="w-full rounded-lg bg-accent text-white py-2 font-medium transition-colors hover:bg-[rgb(15_110_86)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                </button>
              </>
            )}
          </form>

          {/* Footer Text */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Chưa có tài khoản?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-accent hover:underline font-medium"
                >
                  Đăng ký ngay
                </button>
              </>
            ) : (
              <>
                Đã có tài khoản?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-accent hover:underline font-medium"
                >
                  Đăng nhập
                </button>
              </>
            )}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
