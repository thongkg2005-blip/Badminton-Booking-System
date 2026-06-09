'use client'

import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-primary text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-white/80 font-bold sm:text-5xl text-balance">
            Đặt sân cầu lông online
          </h1>
           <h1 className="mb-4 text-white/80 font-bold sm:text-5xl text-balance">
           Nhanh, dễ, tiện
          </h1>
          <p className="mb-8 text-lg text-white/80">
            Chọn khung giờ, chọn sân, xác nhận trong 30 giây
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="inline-block rounded-lg bg-white text-primary px-8 py-3 font-medium transition-colors hover:bg-neutral-100"
            >
              Đặt sân ngay
            </Link>
            <Link
              href="/shop"
              className="inline-block rounded-lg border-2 border-white text-white px-8 py-3 font-medium transition-colors hover:bg-white/10"
            >
              Mua Sắm
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stat Card 1 */}
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="text-4xl font-bold text-accent mb-2">10</div>
              <p className="text-foreground font-medium">Sân cầu lông</p>
              <p className="text-sm text-muted-foreground">Đạt chuẩn quốc tế</p>
            </div>

            {/* Stat Card 2 */}
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="text-4xl font-bold text-accent mb-2">18h</div>
              <p className="text-foreground font-medium">Khung giờ hoạt động</p>
              <p className="text-sm text-muted-foreground">5:00 - 23:00</p>
            </div>

            {/* Stat Card 3 */}
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="text-4xl font-bold text-accent mb-2">1</div>
              <p className="text-foreground font-medium">Chi nhánh</p>
              <p className="text-sm text-muted-foreground">Tp. Hồ Chí Minh</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">
            Quy trình đặt sân
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white text-2xl font-bold">
                1
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Chọn ngày & giờ</h3>
              <p className="text-muted-foreground">
                Chọn ngày bạn muốn chơi và khung giờ phù hợp với lịch của mình
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white text-2xl font-bold">
                2
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Chọn sân</h3>
              <p className="text-muted-foreground">
                Xem các sân còn trống và lựa chọn sân yêu thích của bạn
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white text-2xl font-bold">
                3
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Thanh toán & xác nhận</h3>
              <p className="text-muted-foreground">
                Nhập thông tin và hoàn tất thanh toán để nhận xác nhận đặt sân
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Bắt đầu ngay hôm nay</h2>
          <p className="mb-8 text-lg text-white/80">
            Không cần dài dòng, chỉ cần 30 giây để đặt sân cầu lông yêu thích
          </p>
          <Link
            href="/booking"
            className="inline-block rounded-lg bg-white text-primary px-8 py-3 font-medium transition-colors hover:bg-neutral-100"
          >
            Đặt sân ngay
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
