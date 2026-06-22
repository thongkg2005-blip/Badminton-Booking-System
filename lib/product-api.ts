import { backendJson } from '@/lib/backend-api'

export type ProductCategory = {
  id: number
  name: string
}

export type Product = {
  id: number
  name: string
  brand: string
  price: number
  discount: number
  image: string
  rating?: number
  stock: number
  description?: string
  category: ProductCategory
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  return 0
}

export function normalizeProduct(raw: Record<string, unknown>): Product {
  const category = raw.category as Record<string, unknown> | undefined
  return {
    id: toNumber(raw.id),
    name: String(raw.name ?? ''),
    brand: String(raw.brand ?? ''),
    price: toNumber(raw.price),
    discount: toNumber(raw.discount),
    image: String(raw.image ?? '🏸'),
    rating: raw.rating != null ? toNumber(raw.rating) : undefined,
    stock: toNumber(raw.stock),
    description: raw.description != null ? String(raw.description) : undefined,
    category: {
      id: toNumber(category?.id),
      name: String(category?.name ?? ''),
    },
  }
}

export function getCategoryName(product: Product): string {
  return product.category.name
}

export function getDiscountedPrice(product: Product): number {
  return Math.round(product.price * (1 - product.discount / 100))
}

export function formatPrice(value: number): string {
  return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ`
}

export async function fetchProducts(category?: string): Promise<Product[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : ''
  const data = await backendJson<Record<string, unknown>[]>(`/products${query}`)
  return data.map(normalizeProduct)
}

export async function fetchProductCategories(): Promise<ProductCategory[]> {
  return backendJson<ProductCategory[]>('/product-categories')
}
