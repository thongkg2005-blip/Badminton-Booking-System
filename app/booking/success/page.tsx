'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function BookingSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-accent" />
            <h1 className="mb-2 text-2xl font-bold">Đặt sân thành công!</h1>
            <p className="mb-6 text-muted-foreground">
              Đơn đặt sân của bạn đã được xác nhận. Vui lòng kiểm tra email để nhận chi tiết.
            </p>

            <div className="mb-6 rounded-lg bg-[rgb(225_245_238)] p-4 text-left">
              <p className="text-sm font-medium text-[rgb(15_110_86)] mb-3">Chi tiết đơn đặt</p>
              <div className="space-y-2 text-sm text-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã đơn hàng:</span>
                  <span className="font-medium">#2026051201</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày sân:</span>
                  <span className="font-medium">{new Date().toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Khung giờ:</span>
                  <span className="font-medium">17:00 - 19:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng tiền:</span>
                  <span className="font-medium text-accent">276.000 đ</span>
                </div>
              </div>
            </div>

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
                Mua dụng cụ
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
