'use client'

import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Trash2, Plus, Minus } from 'lucide-react'
import PRODUCTS from '@/lib/products'
import { useCart } from '@/contexts/cart-context'

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart()

  const cartItemsWithProducts = cartItems
    .map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id)
      if (!product) return null
      const discountedPrice = product.price * (1 - product.discount / 100)
      return {
        ...item,
        product,
        discountedPrice,
        itemTotal: discountedPrice * item.quantity,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  const groupedCartItems = cartItemsWithProducts.reduce<Record<string, typeof cartItemsWithProducts>>(
    (groups, item) => {
      const category = item.product.category
      if (!groups[category]) groups[category] = []
      groups[category].push(item)
      return groups
    },
    {}
  )

  const categoryOrder = Object.keys(groupedCartItems)

  const subtotal = cartItemsWithProducts.reduce((total, item) => total + item.itemTotal, 0)
  const shipping = subtotal > 0 ? (subtotal > 5000000 ? 0 : 50000) : 0
  const total = subtotal + shipping

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="mb-2 text-2xl font-bold">Giỏ hàng trống</h1>
            <p className="text-muted-foreground mb-6">Chưa có sản phẩm nào trong giỏ hàng</p>
            <Link
              href="/shop"
              className="inline-block rounded-lg bg-accent text-white px-6 py-3 font-medium transition-colors hover:bg-[rgb(15_110_86)]"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-8 text-3xl font-bold">Giỏ hàng</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {categoryOrder.map((category) => {
                  const items = groupedCartItems[category]
                  const categoryTotal = items.reduce((sum, item) => sum + item.itemTotal, 0)

                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-semibold">{category}</h2>
                          <p className="text-sm text-muted-foreground">
                            {items.length} sản phẩm trong nhóm này
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Tạm tính nhóm</p>
                          <p className="font-semibold text-accent">
                            {categoryTotal.toLocaleString()} đ
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {items.map((item) => {
                          const { product } = item
                          return (
                            <div
                              key={product.id}
                              className="rounded-xl border border-border bg-card p-4 flex gap-4"
                            >
                              {/* Image */}
                              <div className="flex h-24 w-24 items-center justify-center rounded bg-neutral-100 flex-shrink-0">
                                <span className="text-4xl">{product.image}</span>
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">
                                  {product.brand} · {product.category}
                                </p>
                                <h3 className="font-semibold mb-1 line-clamp-2">{product.name}</h3>
                                <div className="flex items-baseline gap-2">
                                  <span className="font-bold text-accent">
                                    {item.discountedPrice.toLocaleString()} đ
                                  </span>
                                  {product.discount > 0 && (
                                    <span className="text-xs text-muted-foreground line-through">
                                      {product.price.toLocaleString()} đ
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Quantity & Total */}
                              <div className="flex flex-col items-end justify-between">
                                <button
                                  onClick={() => removeFromCart(product.id)}
                                  className="text-destructive hover:bg-destructive/10 p-2 rounded transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>

                                <div className="flex items-center gap-2 border border-border rounded-lg">
                                  <button
                                    onClick={() => updateQuantity(product.id, item.quantity - 1)}
                                    className="p-1 hover:bg-neutral-100 transition-colors"
                                  >
                                    <Minus size={16} />
                                  </button>
                                  <span className="w-8 text-center font-medium">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(product.id, item.quantity + 1)}
                                    className="p-1 hover:bg-neutral-100 transition-colors"
                                  >
                                    <Plus size={16} />
                                  </button>
                                </div>

                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Tổng</p>
                                  <p className="font-bold text-accent">
                                    {item.itemTotal.toLocaleString()} đ
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <Link
                href="/shop"
                className="mt-6 inline-flex text-accent hover:underline font-medium"
              >
                ← Tiếp tục mua sắm
              </Link>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
                <h3 className="mb-6 text-lg font-semibold">Tóm tắt đơn hàng</h3>

                <div className="space-y-3 mb-6 pb-6 border-b border-border text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium">{subtotal.toLocaleString()} đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vận chuyển</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString()} đ`}
                    </span>
                  </div>
                </div>

                <div className="mb-6 flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-accent">{total.toLocaleString()} đ</span>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full text-center rounded-lg bg-accent text-white py-3 font-medium transition-colors hover:bg-[rgb(15_110_86)]"
                >
                  Thanh toán ngay
                </Link>

                {subtotal > 5000000 && (
                  <p className="mt-4 text-xs text-accent bg-[rgb(225_245_238)] p-3 rounded text-center">
                    ✓ Bạn được miễn phí vận chuyển!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
