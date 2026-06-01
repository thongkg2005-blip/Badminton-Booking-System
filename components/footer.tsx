'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-primary text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Địa chỉ: 123 Đường Nguyễn Huệ, Q.1, TP.HCM</li>
              <li>Điện thoại: (028) 1234 5678</li>
              <li>Email: info@sancaulong.com</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/booking" className="text-white/80 transition-colors hover:text-white">
                  Đặt sân
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-white/80 transition-colors hover:text-white">
                  Cửa hàng
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-white/80 transition-colors hover:text-white">
                  Quản lý
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-semibold mb-4">Giờ hoạt động</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Thứ 2 - Thứ 6: 5:00 - 23:00</li>
              <li>Thứ 7: 6:00 - 23:00</li>
              <li>Chủ nhật: 7:00 - 22:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
          <p>© {currentYear} Sân Cầu Lông. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
