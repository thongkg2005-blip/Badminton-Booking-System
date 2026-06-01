'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { ChevronDown } from 'lucide-react'

const TIME_SLOTS = [
  '5:00-7:00',
  '7:00-9:00',
  '9:00-11:00',
  '11:00-13:00',
  '13:00-15:00',
  '15:00-17:00',
  '17:00-19:00',
  '19:00-21:00',
  '21:00-23:00',
]

const DAY_TYPES = ['Ngày thường', 'Cuối tuần', 'Ngày lễ']

// Mock pricing data
const INITIAL_PRICES = {
  weekday: [40, 40, 40, 40, 40, 40, 69, 69, 69],
  weekend: [50, 50, 50, 50, 50, 50, 85, 85, 85],
  holiday: [60, 60, 60, 60, 60, 60, 100, 100, 100],
}

export default function AdminPricingPage() {
  const [prices, setPrices] = useState(INITIAL_PRICES)
  const [isSaved, setIsSaved] = useState(false)

  const handlePriceChange = (
    dayType: 'weekday' | 'weekend' | 'holiday',
    timeIndex: number,
    value: string
  ) => {
    const newPrice = parseInt(value) || 0
    setPrices((prev) => ({
      ...prev,
      [dayType]: prev[dayType].map((p, i) => (i === timeIndex ? newPrice : p)),
    }))
    setIsSaved(false)
  }

  const handleSave = () => {
    // Simulate API call
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleReset = () => {
    setPrices(INITIAL_PRICES)
  }

  const getDayTypeKey = (index: number): 'weekday' | 'weekend' | 'holiday' =>
    ['weekday', 'weekend', 'holiday'][index] as 'weekday' | 'weekend' | 'holiday'

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Quản lý giá sân</h1>
            <p className="text-muted-foreground">Điều chỉnh giá sân theo khung giờ và loại ngày</p>
          </div>

          {/* Info Alert */}
          <div className="mb-6 rounded-lg bg-[rgb(225_245_238)] border border-[rgb(15_110_86)]/20 p-4">
            <p className="text-sm text-[rgb(15_110_86)]">
              <span className="font-semibold">💡 Ghi chú:</span> Giá được hiển thị dưới dạng 1,000 đ (tức 1.000.000 đ thực tế). 
              Ví dụ: 40 = 40.000 đ/giờ
            </p>
          </div>

          {/* Pricing Table */}
          <div className="mb-8 rounded-xl border border-border bg-card p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold">Khung giờ</th>
                  {DAY_TYPES.map((dayType, i) => (
                    <th key={i} className="px-4 py-3 text-center font-semibold">
                      {dayType}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {TIME_SLOTS.map((time, timeIndex) => (
                  <tr key={time} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">{time}</td>
                    {DAY_TYPES.map((_, dayTypeIndex) => {
                      const dayTypeKey = getDayTypeKey(dayTypeIndex)
                      const currentPrice = prices[dayTypeKey][timeIndex]

                      return (
                        <td key={dayTypeIndex} className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              value={currentPrice}
                              onChange={(e) =>
                                handlePriceChange(dayTypeKey, timeIndex, e.target.value)
                              }
                              className="w-20 rounded border border-border px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            <span className="text-xs text-muted-foreground">k</span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Giá cao điểm (buổi tối)</p>
              <p className="text-2xl font-bold">
                {prices.weekday[6]}k - {prices.holiday[6]}k đ/giờ
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Giá bình thường</p>
              <p className="text-2xl font-bold">
                {prices.weekday[0]}k - {prices.holiday[0]}k đ/giờ
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-2">Chênh lệch cuối tuần</p>
              <p className="text-2xl font-bold">
                +{((prices.weekend[0] - prices.weekday[0]) / prices.weekday[0] * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-border p-4 flex justify-end gap-4">
            <button
              onClick={handleReset}
              className="rounded-lg border-2 border-border px-6 py-2 font-medium transition-colors hover:border-accent hover:text-accent"
            >
              Đặt lại
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-accent text-white px-6 py-2 font-medium transition-colors hover:bg-[rgb(15_110_86)]"
            >
              {isSaved ? '✓ Đã lưu' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
