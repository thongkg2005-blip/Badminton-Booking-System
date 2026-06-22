'use client'

import { useEffect, useState } from 'react'
import { fetchProducts, type Product } from '@/lib/product-api'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchProducts()
      .then((data) => {
        if (!cancelled) {
          setProducts(data)
          setError(null)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setProducts([])
          setError(err.message || 'Không thể tải danh sách sản phẩm')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { products, loading, error }
}
