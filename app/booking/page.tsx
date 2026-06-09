'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TIME_SLOTS, getPrice, getDayType } from '@/lib/booking-pricing'
import { saveBookingDraft } from '@/lib/booking-storage'

const COURTS = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Sân ${i + 1}` }))

export default function BookingPage() {
  const router = useRouter()

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  function parseLocalDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString(new Date()))
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null)
  const [selectedCourts, setSelectedCourts] = useState<number[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const date = parseLocalDate(selectedDate)
  const dayType = getDayType(date)
  const slot = selectedTimeSlot !== null ? TIME_SLOTS[selectedTimeSlot] : null
  const pricePerCourt = slot ? getPrice(slot, dayType) : 0
  const totalPrice = pricePerCourt * selectedCourts.length

  const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay()

  const isSameLocalDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const isBeforeLocalDay = (a: Date, b: Date) => {
    if (a.getFullYear() !== b.getFullYear()) return a.getFullYear() < b.getFullYear()
    if (a.getMonth() !== b.getMonth()) return a.getMonth() < b.getMonth()
    return a.getDate() < b.getDate()
  }

  const isSlotDisabled = useCallback((slotIndex: number) => {
    const slotDef = TIME_SLOTS[slotIndex]
    const [y, m, d] = selectedDate.split('-').map(Number)
    const slotStart = new Date(y, m - 1, d, slotDef.start, 0, 0, 0)
    const now = new Date()
    const minAllowed = new Date(now.getTime() + 60 * 60 * 1000)
    const selected = parseLocalDate(selectedDate)
    if (isSameLocalDay(selected, now)) return slotStart < minAllowed
    return false
  }, [selectedDate])

  useEffect(() => {
    if (selectedTimeSlot !== null && isSlotDisabled(selectedTimeSlot)) {
      setSelectedTimeSlot(null)
    }
  }, [selectedDate, selectedTimeSlot, isSlotDisabled])

  const handleContinue = () => {
    if (!slot || selectedCourts.length === 0) return
    saveBookingDraft({
      date: selectedDate,
      timeSlotIndex: selectedTimeSlot!,
      courtIds: selectedCourts,
    })
    router.push('/booking/confirm')
  }

  const days = Array.from({ length: getDaysInMonth(currentMonth) }, (_, i) => i + 1)
  const emptyDays = Array(getFirstDayOfMonth(currentMonth)).fill(null)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-8 text-3xl font-bold">Đặt sân cầu lông</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">

              {/* Step 1: Time Slot */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Bước 1: Chọn khung giờ</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TIME_SLOTS.map((s, index) => {
                    const disabled = isSlotDisabled(index)
                    return (
                      <button
                        key={index}
                        onClick={() => !disabled && setSelectedTimeSlot(index)}
                        disabled={disabled}
                        className={`py-3 px-2 rounded-lg border-2 font-medium text-sm transition-colors ${
                          disabled
                            ? 'text-muted-foreground opacity-50 cursor-not-allowed border-border bg-neutral-50'
                            : selectedTimeSlot === index
                            ? 'border-accent bg-accent text-white'
                            : 'border-border hover:border-accent'
                        }`}
                      >
                        {s.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Step 2: Date */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Bước 2: Chọn ngày</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-2 hover:bg-neutral-100 rounded transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <h3 className="font-semibold">
                      {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-2 hover:bg-neutral-100 rounded transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center text-sm">
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
                      <div key={d} className="font-medium text-muted-foreground py-2">{d}</div>
                    ))}
                    {emptyDays.map((_, i) => <div key={`e-${i}`} />)}
                    {days.map((day) => {
                      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      const isSelected = dateStr === selectedDate
                      const today = new Date()
                      const cellDate = parseLocalDate(dateStr)
                      const isToday = isSameLocalDay(cellDate, today)
                      const isPast = isBeforeLocalDay(cellDate, today)

                      return (
                        <button
                          key={day}
                          onClick={() => !isPast && setSelectedDate(dateStr)}
                          disabled={isPast}
                          className={`py-2 rounded transition-colors ${
                            isPast
                              ? 'text-muted-foreground opacity-50 cursor-not-allowed'
                              : isSelected
                                ? 'bg-accent text-white font-medium'
                                : isToday
                                  ? 'border-2 border-accent text-accent font-medium'
                                  : 'hover:bg-neutral-100'
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Step 3: Courts */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Bước 3: Chọn sân</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {COURTS.map((court) => (
                    <button
                      key={court.id}
                      onClick={() => {
                        setSelectedCourts((prev) =>
                          prev.includes(court.id) ? prev.filter((c) => c !== court.id) : [...prev, court.id]
                        )
                      }}
                      className={`rounded-lg border-2 p-4 text-center font-medium transition-colors ${
                        selectedCourts.includes(court.id)
                          ? 'border-accent bg-[rgb(225_245_238)] text-[rgb(15_110_86)]'
                          : 'border-border hover:border-accent'
                      }`}
                    >
                      {court.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                <h3 className="mb-6 text-lg font-semibold">Chi tiết đặt sân</h3>

                <div className="mb-6 space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Ngày</p>
                    <p className="font-medium">
                      {parseLocalDate(selectedDate).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {slot && (
                    <div>
                      <p className="text-muted-foreground">Khung giờ</p>
                      <p className="font-medium">{slot.label}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-muted-foreground">Loại ngày</p>
                    <p className="font-medium">
                      {dayType === 'weekend' ? 'Cuối tuần' : 'Ngày thường'}
                    </p>
                  </div>

                  {selectedCourts.length > 0 && (
                    <div>
                      <p className="text-muted-foreground">Sân đã chọn</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedCourts.sort((a, b) => a - b).map((court) => (
                          <span key={court} className="inline-flex items-center gap-1 bg-accent/10 px-2 py-1 rounded text-accent text-xs font-medium">
                            Sân {court}
                            <button
                              onClick={() => setSelectedCourts((prev) => prev.filter((c) => c !== court))}
                              className="ml-1 hover:text-accent/80"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-6 mb-6">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Giá/sân/giờ</span>
                    <span className="font-medium">{pricePerCourt.toLocaleString()} đ</span>
                  </div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Số sân × 2h</span>
                    <span className="font-medium">{selectedCourts.length}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-accent">
                    <span>Tổng cộng</span>
                    <span>{totalPrice.toLocaleString()} đ</span>
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={selectedCourts.length === 0 || !slot}
                  className={`block w-full rounded-lg py-3 text-center font-medium text-white transition-colors ${
                    selectedCourts.length > 0 && slot
                      ? 'bg-primary hover:bg-primary/90 cursor-pointer'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  Tiếp tục thanh toán
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
