'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Mail, Phone, User } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { fetchProfile, requireAuthSession, removeAuthSession, saveUserToStorage } from '@/lib/auth-api'

export default function ProfilePage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{
    id: string
    name: string
    email: string
    phone: string
    role: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const session = requireAuthSession()
    if (!session) {
      router.replace('/auth')
      return
    }

    fetchProfile()
      .then((user) => {
        saveUserToStorage(user)
        setUserInfo({
          id: String(user.id),
          name: user.fullName,
          email: user.email || 'Chưa cập nhật',
          phone: user.phone || 'Chưa cập nhật',
          role: user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng',
        })
      })
      .catch((err: Error) => {
        if (err.message.toLowerCase().includes('unauthorized')) {
          removeAuthSession()
          router.replace('/auth')
          return
        }
        const message = err.message.toLowerCase().includes('not found')
          ? 'Không thể tải thông tin tài khoản. Hãy đảm bảo backend đang chạy và thử đăng nhập lại.'
          : (err.message || 'Không thể tải thông tin tài khoản')
        setError(message)
      })
      .finally(() => setIsLoading(false))
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-8 text-center text-muted-foreground">
          Đang tải thông tin...
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-8 text-center text-destructive">
          {error}
        </main>
        <Footer />
      </div>
    )
  }

  if (!userInfo) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-colors hover:bg-muted"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Thông tin cá nhân</h1>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
          <div className="mb-8 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent text-white">
              <User size={48} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-b border-border pb-4">
              <label className="text-sm font-medium text-muted-foreground">Họ tên</label>
              <p className="mt-2 text-lg text-foreground">{userInfo.name}</p>
            </div>

            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-accent" />
                <label className="text-sm font-medium text-muted-foreground">Email</label>
              </div>
              <p className="mt-2 text-lg text-foreground">{userInfo.email}</p>
            </div>

            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-accent" />
                <label className="text-sm font-medium text-muted-foreground">Số điện thoại</label>
              </div>
              <p className="mt-2 text-lg text-foreground">{userInfo.phone}</p>
            </div>

            <div className="pb-4">
              <label className="text-sm font-medium text-muted-foreground">Vai trò</label>
              <p className="mt-2 text-lg font-semibold text-accent">{userInfo.role}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/profile/edit"
              className="flex-1 rounded-lg bg-accent px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-accent/90"
            >
              Thay đổi thông tin
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Quay lại
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-muted/30 p-6">
          <h3 className="mb-2 font-medium text-foreground">Bảo vệ tài khoản</h3>
          <p className="text-sm text-muted-foreground">
            Để bảo vệ tài khoản của bạn, vui lòng cập nhật thông tin khi cần thiết.
            Chúng tôi không bao giờ chia sẻ thông tin của bạn với bên thứ ba.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
