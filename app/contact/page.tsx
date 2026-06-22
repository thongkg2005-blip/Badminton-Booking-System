'use client'

import { Mail, Phone, MapPin, Facebook, Instagram, TrendingUp } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Liên Hệ Với Chúng Tôi
          </h1>
          <p className="mt-4 text-muted-foreground">
            Hãy liên hệ với chúng tôi để biết thêm thông tin hoặc có bất kỳ câu hỏi nào
          </p>
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Address Card */}
          <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <MapPin className="text-accent" size={24} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Địa Chỉ
            </h3>
            <p className="text-sm text-muted-foreground">
              123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh, Việt Nam
            </p>
          </div>

          {/* Phone Card */}
          <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Phone className="text-accent" size={24} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Số Điện Thoại
            </h3>
            <p className="text-sm text-muted-foreground">
              (84+) 028 3822 8888
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Giờ hành chính: 8:00 - 22:00 hàng ngày
            </p>
          </div>

          {/* Email Card */}
          <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Mail className="text-accent" size={24} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Email
            </h3>
            <p className="text-sm text-muted-foreground">
              support@sancaulong.com
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Chúng tôi sẽ trả lời trong 24 giờ
            </p>
          </div>
        </div>

        {/* Court Information Section */}
        <div className="mt-16 rounded-lg border border-border bg-card p-8 shadow-sm md:p-12">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Thông Tin Cơ Sở
          </h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Court Details */}
            <div>
              <h3 className="mb-4 font-semibold text-foreground">
                Sân Cầu Lông Quốc Tế
              </h3>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground min-w-fit">Tổng sân:</span>
                  <span>10 sân tiêu chuẩn quốc tế</span>
                </li>
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground min-w-fit">Giờ mở cửa:</span>
                  <span>5:00 - 23:00 (hằng ngày)</span>
                </li>
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground min-w-fit">Loại sân:</span>
                  <span>Sân thảm, đạt chuẩn thi đấu</span>
                </li>
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground min-w-fit">Trang thiết bị:</span>
                  <span>Tủ locker, nhà vệ sinh, khu ăn uống</span>
                </li>
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground min-w-fit">Bãi đậu xe:</span>
                  <span>Miễn phí cho khách hàng</span>
                </li>
              </ul>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="mb-4 font-semibold text-foreground">
                Tiện Ích
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Điều hòa trung tâm</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Ánh sáng LED hiện đại</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-muted-foreground">WiFi miễn phí tốc độ cao</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Cửa hàng bán dụng cụ</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Quán nước giải khát</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  <span className="text-muted-foreground">Dịch vụ huấn luyện</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="mt-16 rounded-lg border border-border bg-card p-8 shadow-sm md:p-12">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
            Kết Nối Với Chúng Tôi
          </h2>

          <p className="mb-8 text-center text-sm text-muted-foreground">
            Theo dõi chúng tôi trên các nền tảng mạng xã hội để cập nhật tin tức mới nhất
          </p>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            {/* Facebook */}
            <div className="text-center">
              <button
                className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 transition-all hover:bg-accent hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="text-accent hover:text-white" size={32} />
              </button>
              <p className="text-xs font-medium text-foreground">Facebook</p>
            </div>

            {/* Instagram */}
            <div className="text-center">
              <button
                className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 transition-all hover:bg-accent hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="text-accent hover:text-white" size={32} />
              </button>
              <p className="text-xs font-medium text-foreground">Instagram</p>
            </div>

            {/* TikTok */}
            <div className="text-center">
              <button
                className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 transition-all hover:bg-accent hover:scale-110"
                aria-label="TikTok"
              >
                <TrendingUp className="text-accent hover:text-white" size={32} />
              </button>
              <p className="text-xs font-medium text-foreground">TikTok</p>
            </div>
          </div>
            
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Liên hệ hợp tác: sancaulongquocte@gmail.com
          </p>
          
        </div>

        {/* CTA Section */}
        <div className="mt-16 rounded-lg bg-primary p-8 text-center text-white md:p-12">
          <h2 className="mb-4 text-2xl font-bold">Sẵn Sàng Đặt Sân?</h2>
          <p className="mb-6 text-white/80">
            Đặt sân cầu lông của bạn ngay hôm nay và tận hưởng trải nghiệm chơi đầu tiên
          </p>
          <a
            href="/booking"
            className="inline-block rounded-lg bg-accent px-6 py-3 font-medium text-white transition-all hover:scale-105"
          >
            Đặt Sân Ngay
          </a>
        </div>
      </main>

      <Footer />
    </div>
  )
}
