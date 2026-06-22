'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser)
        setFormData({
          name: u.fullName || '',
          email: u.email || '',
          phone: u.phone || '',
        })
      } catch (err) {
        console.error('Failed to parse user profile', err)
      }
    }
  }, [])

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Họ tên không được để trống'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống'
    } else if (!/^0\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (phải bắt đầu bằng 0 và có 10 chữ số)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setSuccessMessage('')

    try {
      // Update localStorage user info
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const u = JSON.parse(storedUser)
        const updated = {
          ...u,
          fullName: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.replace(/[\s\-\.\(\)]/g, ''),
        }
        localStorage.setItem('user', JSON.stringify(updated))
      }

      // Simulated API delay
      await new Promise(resolve => setTimeout(resolve, 800))

      setSuccessMessage('Cập nhật thông tin thành công!')

      // Redirect to profile page after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/profile'
      }, 1500)
    } catch (error) {
      console.error('[v0] Error updating profile:', error)
      setErrors(prev => ({
        ...prev,
        submit: 'Có lỗi xảy ra. Vui lòng thử lại.',
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Chỉnh sửa thông tin</h1>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-[rgb(225,245,238)] p-4">
            <CheckCircle size={20} className="text-accent" />
            <p className="text-sm text-accent">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-[rgb(252,235,235)] p-4">
            <AlertCircle size={20} className="text-destructive" />
            <p className="text-sm text-destructive">{errors.submit}</p>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 sm:p-8">
          {/* Name Field */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              Họ tên
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-2 w-full rounded-lg border px-4 py-3 text-foreground placeholder-muted-foreground transition-colors ${
                errors.name ? 'border-destructive bg-destructive/5' : 'border-border bg-card hover:border-border/80 focus:border-accent focus:outline-none'
              }`}
              placeholder="Nhập họ tên"
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-2 w-full rounded-lg border px-4 py-3 text-foreground placeholder-muted-foreground transition-colors ${
                errors.email ? 'border-destructive bg-destructive/5' : 'border-border bg-card hover:border-border/80 focus:border-accent focus:outline-none'
              }`}
              placeholder="Nhập email"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>

          {/* Phone Field */}
          <div className="mb-8">
            <label htmlFor="phone" className="block text-sm font-medium text-foreground">
              Số điện thoại
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`mt-2 w-full rounded-lg border px-4 py-3 text-foreground placeholder-muted-foreground transition-colors ${
                errors.phone ? 'border-destructive bg-destructive/5' : 'border-border bg-card hover:border-border/80 focus:border-accent focus:outline-none'
              }`}
              placeholder="Nhập số điện thoại"
            />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-accent px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <Link
              href="/profile"
              className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Hủy
            </Link>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 rounded-lg bg-muted/30 p-6">
          <h3 className="mb-2 font-medium text-foreground">Lưu ý</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số</li>
            <li>• Email phải là định dạng hợp lệ (ví dụ: user@example.com)</li>
            <li>• Tất cả các thông tin đều bắt buộc phải cập nhật</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  )
}
