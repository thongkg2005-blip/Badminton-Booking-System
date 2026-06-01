'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

type Product = {
  id: number
  name: string
  category: string
  brand: string
  price: number
}

export default function AdminToolsPage() {
  const [items, setItems] = useState<Product[]>([])

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]))
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Quản trị dụng cụ</h1>
            <Link href="/admin/tools/create" className="rounded bg-accent text-white px-4 py-2">Tạo dụng cụ</Link>
          </div>

          <div className="space-y-3">
            {items.map((p) => (
              <div key={p.id} className="rounded border p-4 bg-card flex justify-between">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.brand} · {p.category}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{p.price.toLocaleString()} đ</div>
                  <Link href={`/admin/tools/${p.id}/edit`} className="text-sm text-accent mt-2 block">Sửa</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
