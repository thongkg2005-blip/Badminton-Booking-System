'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

type Notice = {
  type: 'success' | 'error'
  message: string
}

const emptyForm = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
}

function validateRegister(formData: typeof emptyForm) {
  const fullName = formData.fullName.trim()
  const email = formData.email.trim()
  const phone = formData.phone.replace(/[\s\-\.\(\)]/g, '')

  if (fullName.split(/\s+/).filter(Boolean).length < 2) {
    return 'Họ tên phải có ít nhất 2 từ'
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Email không đúng định dạng'
  }
  if (!/^0\d{9}$/.test(phone)) {
    return 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0'
  }
  if (formData.password.length < 6) {
    return 'Mật khẩu phải có ít nhất 6 ký tự'
  }
  if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
    return 'Mật khẩu phải có ít nhất 1 chữ cái và 1 chữ số'
  }
  if (formData.password !== formData.confirmPassword) {
    return 'Xác nhận mật khẩu không khớp'
  }

  return null
}

async function readErrorMessage(response: Response) {
  const rawMessage = await response.text()
  if (!rawMessage) return 'Request failed'

  try {
    const parsed = JSON.parse(rawMessage)
    return parsed.message || parsed.error || rawMessage
  } catch {
    return rawMessage
  }
}

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [formData, setFormData] = useState(emptyForm)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const switchMode = (nextIsLogin: boolean) => {
    setIsLogin(nextIsLogin)
    setNotice(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setNotice(null)

    try {
      const username = formData.username.trim()
      const fullName = formData.fullName.trim()
      const email = formData.email.trim()
      const phone = formData.phone.replace(/[\s\-\.\(\)]/g, '')

      if (!isLogin) {
        const validationMessage = validateRegister(formData)
        if (validationMessage) {
          throw new Error(validationMessage)
        }
      }

      const response = await fetch(`/backend-api/auth/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          isLogin
            ? {
              username,
              password: formData.password,
            }
            : {
              fullName,
              username,
              password: formData.password,
              email,
              phone,
            },
        ),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      const data = await response.json()

      if (isLogin) {
        if (data?.token) {
          localStorage.setItem('token', data.token)

          // Save user information too
          if (data?.user) {
            localStorage.setItem('user', JSON.stringify(data.user))
          }
        }

        window.location.href = '/'
        return
      }
      setNotice({ type: 'success', message: data?.message || 'Đăng ký tài khoản thành công' })
      setIsLogin(true)
      setFormData((prev) => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }))
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Đăng nhập/đăng ký thất bại',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Only disable the button when required fields are empty (not on live validation)
  const registerFieldsEmpty =
    !formData.fullName ||
    !formData.phone ||
    !formData.username ||
    !formData.password ||
    !formData.confirmPassword

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
          <div className="mb-8 flex gap-2 border-b border-border">
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${isLogin ? 'border-accent text-accent' : 'border-transparent text-muted-foreground'
                }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${!isLogin ? 'border-accent text-accent' : 'border-transparent text-muted-foreground'
                }`}
            >
              Đăng ký
            </button>
          </div>

          {notice && (
            <div
              className={`mb-4 rounded-lg border px-4 py-3 text-sm ${notice.type === 'success'
                ? 'border-[rgb(15_110_86)]/20 bg-[rgb(225_245_238)] text-[rgb(15_110_86)]'
                : 'border-destructive/20 bg-destructive/10 text-destructive'
                }`}
            >
              {notice.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!isLogin && (
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
                    placeholder="Nguyễn Văn A"
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
                    placeholder="name@example.com"
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
                    placeholder="0912345678"
                    className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </>
            )}

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
                placeholder={isLogin ? 'Nhập mật khẩu' : 'Ít nhất 6 ký tự, gồm chữ và số'}
                className="w-full rounded-lg border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {!isLogin && (
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
            )}

            <button
              type="submit"
              disabled={
                isLoading ||
                !formData.username ||
                !formData.password ||
                (!isLogin && registerFieldsEmpty)
              }
              className={`w-full rounded-lg py-2 font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isLogin ? 'bg-primary hover:bg-primary/90' : 'bg-accent hover:bg-[rgb(15_110_86)]'
                }`}
            >
              {isLoading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => switchMode(false)}
                  className="text-accent hover:underline font-medium"
                >
                  Đăng ký ngay
                </button>
              </>
            ) : (
              <>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => switchMode(true)}
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
