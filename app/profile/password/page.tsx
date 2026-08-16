'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

type Notice = {
  type: 'success' | 'error'
  message: string
}

const emptyForm = {
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: '',
}

const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'

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

export default function ChangePasswordPage() {
  const router = useRouter()
  const [formData, setFormData] = useState(emptyForm)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}

    if (!formData.oldPassword.trim()) {
      nextErrors.oldPassword = 'Vui lòng nhập mật khẩu cũ'
    }

    if (!formData.newPassword.trim()) {
      nextErrors.newPassword = 'Vui lòng nhập mật khẩu mới'
    } else {
      if (formData.newPassword.length < 6) {
        nextErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự'
      } else if (!/[A-Za-z]/.test(formData.newPassword) || !/\d/.test(formData.newPassword)) {
        nextErrors.newPassword = 'Mật khẩu mới phải có ít nhất 1 chữ cái và 1 chữ số'
      }
    }

    if (!formData.confirmNewPassword.trim()) {
      nextErrors.confirmNewPassword = 'Vui lòng xác nhận mật khẩu mới'
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      nextErrors.confirmNewPassword = 'Xác nhận mật khẩu mới không khớp'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotice(null)

    if (!validateForm()) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      setNotice({ type: 'error', message: 'Vui lòng đăng nhập lại để đổi mật khẩu' })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${backendBaseUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      setNotice({ type: 'success', message: 'Đổi mật khẩu thành công' })
      setFormData(emptyForm)

      setTimeout(() => {
        router.push('/profile')
      }, 1200)
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Đổi mật khẩu thất bại',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Đổi mật khẩu</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Chỉ cập nhật mật khẩu cho tài khoản hiện tại.
            </p>
          </div>
        </div>

        {notice && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-lg p-4 ${
              notice.type === 'success'
                ? 'bg-[rgb(225,245,238)]'
                : 'bg-[rgb(252,235,235)]'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle size={20} className="text-accent" />
            ) : (
              <AlertCircle size={20} className="text-destructive" />
            )}
            <p className={`text-sm ${notice.type === 'success' ? 'text-accent' : 'text-destructive'}`}>
              {notice.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <div className="mb-6">
            <label htmlFor="oldPassword" className="block text-sm font-medium text-foreground">
              Mật khẩu cũ
            </label>
            <input
              type="password"
              id="oldPassword"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu cũ"
              className={`mt-2 w-full rounded-lg border px-4 py-3 text-foreground placeholder-muted-foreground transition-colors ${
                errors.oldPassword
                  ? 'border-destructive bg-destructive/5'
                  : 'border-border bg-card hover:border-border/80 focus:border-accent focus:outline-none'
              }`}
            />
            {errors.oldPassword && <p className="mt-1 text-xs text-destructive">{errors.oldPassword}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="newPassword" className="block text-sm font-medium text-foreground">
              Mật khẩu mới
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Nhập mật khẩu mới"
              className={`mt-2 w-full rounded-lg border px-4 py-3 text-foreground placeholder-muted-foreground transition-colors ${
                errors.newPassword
                  ? 'border-destructive bg-destructive/5'
                  : 'border-border bg-card hover:border-border/80 focus:border-accent focus:outline-none'
              }`}
            />
            {errors.newPassword && <p className="mt-1 text-xs text-destructive">{errors.newPassword}</p>}
          </div>

          <div className="mb-8">
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-foreground">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu mới"
              className={`mt-2 w-full rounded-lg border px-4 py-3 text-foreground placeholder-muted-foreground transition-colors ${
                errors.confirmNewPassword
                  ? 'border-destructive bg-destructive/5'
                  : 'border-border bg-card hover:border-border/80 focus:border-accent focus:outline-none'
              }`}
            />
            {errors.confirmNewPassword && (
              <p className="mt-1 text-xs text-destructive">{errors.confirmNewPassword}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-accent px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {isLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
            </button>
            <Link
              href="/profile"
              className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Hủy
            </Link>
          </div>
        </form>

        <div className="mt-8 rounded-lg bg-muted/30 p-6">
          <h3 className="mb-2 font-medium text-foreground">Lưu ý</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Mật khẩu mới phải có ít nhất 6 ký tự</li>
            <li>• Mật khẩu mới phải chứa ít nhất 1 chữ cái và 1 chữ số</li>
            <li>• Bạn cần nhập đúng mật khẩu cũ để cập nhật thành công</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  )
}