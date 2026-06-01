'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function AdminToolTypesPage() {
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((items: Array<{ category: string }>) => {
        const cats = Array.from(new Set(items.map((i) => i.category)))
        setCategories(cats)
      })
      .catch(() => setCategories([]))
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold mb-4">Loại dụng cụ</h1>
          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c} className="rounded border p-3 bg-card">{c}</div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
