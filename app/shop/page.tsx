'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { ShoppingCart, Star } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { useProducts } from '@/hooks/use-products'
import {
  formatPrice,
  getCategoryName,
  getDiscountedPrice,
} from '@/lib/product-api'

export default function ShopPage() {
  const { cartCount, addToCart } = useCart()
  const { products, loading, error } = useProducts()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest'>('newest')

  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => getCategoryName(product)))),
    [products],
  )

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = selectedCategory
      ? products.filter((product) => getCategoryName(product) === selectedCategory)
      : [...products]

    filtered.sort((a, b) => {
      if (sortBy === 'price-asc') return getDiscountedPrice(a) - getDiscountedPrice(b)
      if (sortBy === 'price-desc') return getDiscountedPrice(b) - getDiscountedPrice(a)
      return b.id - a.id
    })

    return filtered
  }, [products, selectedCategory, sortBy])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Cửa hàng dụng cụ</h1>
            <Link
              href="/cart"
              className="relative inline-flex items-center gap-2 rounded-lg bg-accent text-white px-4 py-2 font-medium transition-colors hover:bg-[rgb(15_110_86)]"
            >
              <ShoppingCart size={20} />
              Giỏ hàng
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {loading && (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              Đang tải sản phẩm...
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="font-medium text-destructive">Không thể tải sản phẩm</p>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Hãy đảm bảo backend Spring Boot đang chạy tại cổng 8080.
              </p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                  <div>
                    <h3 className="mb-4 font-semibold">Loại dụng cụ</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                          selectedCategory === null ? 'bg-accent text-white' : 'hover:bg-neutral-100'
                        }`}
                      >
                        Tất cả
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                            selectedCategory === category ? 'bg-accent text-white' : 'hover:bg-neutral-100'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 font-semibold">Sắp xếp</h3>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'price-asc' | 'price-desc' | 'newest')}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="price-asc">Giá tăng dần</option>
                      <option value="price-desc">Giá giảm dần</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                {filteredAndSortedProducts.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                    Không có sản phẩm trong danh mục này.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredAndSortedProducts.map((product) => {
                      const discountedPrice = getDiscountedPrice(product)
                      const outOfStock = product.stock <= 0

                      return (
                        <div
                          key={product.id}
                          className="flex h-full min-h-[440px] flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-accent"
                        >
                          <div className="flex aspect-[4/3] items-center justify-center bg-neutral-100">
                            <span className="text-7xl leading-none">{product.image}</span>
                          </div>

                          <div className="flex flex-1 flex-col p-4">
                            <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                            <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>

                            <div className="flex items-center gap-1 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i < Math.floor(product.rating ?? 0)
                                      ? 'fill-accent text-accent'
                                      : 'text-muted-foreground'
                                  }
                                />
                              ))}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({product.rating ?? 0})
                              </span>
                            </div>

                            <p className="mb-2 text-xs text-muted-foreground">
                              Còn {product.stock} sản phẩm
                            </p>

                            <div className="mb-4">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-accent">
                                  {formatPrice(discountedPrice)}
                                </span>
                                {product.discount > 0 && (
                                  <>
                                    <span className="text-xs text-muted-foreground line-through">
                                      {formatPrice(product.price)}
                                    </span>
                                    <span className="inline-block bg-destructive text-white text-xs font-bold px-2 py-1 rounded">
                                      -{product.discount}%
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => addToCart(product.id, product.stock)}
                              disabled={outOfStock}
                              className="mt-auto w-full rounded-lg bg-primary py-2 font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {outOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
