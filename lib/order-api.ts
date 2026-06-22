import { backendJson } from '@/lib/backend-api'
import type { Product } from '@/lib/product-api'
import { normalizeProduct } from '@/lib/product-api'

export type OrderItem = {
  id: number
  quantity: number
  unitPrice: number
  subtotal: number
  product: Product
}

export type Order = {
  id: number
  customerName: string
  totalAmount: number
  purchaseDate: string
  items: OrderItem[]
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  return 0
}

function normalizeOrderItem(raw: Record<string, unknown>): OrderItem {
  const product = raw.product as Record<string, unknown>
  return {
    id: toNumber(raw.id),
    quantity: toNumber(raw.quantity),
    unitPrice: toNumber(raw.unitPrice),
    subtotal: toNumber(raw.subtotal),
    product: normalizeProduct(product),
  }
}

export function normalizeOrder(raw: Record<string, unknown>): Order {
  const items = Array.isArray(raw.items) ? raw.items : []
  return {
    id: toNumber(raw.id),
    customerName: String(raw.customerName ?? ''),
    totalAmount: toNumber(raw.totalAmount),
    purchaseDate: String(raw.purchaseDate ?? ''),
    items: items.map((item) => normalizeOrderItem(item as Record<string, unknown>)),
  }
}

export type CreateOrderItem = {
  productId: number
  quantity: number
}

export async function createOrder(
  customerName: string,
  items: CreateOrderItem[],
): Promise<Order> {
  const data = await backendJson<Record<string, unknown>>('/orders', {
    method: 'POST',
    body: JSON.stringify({ customerName, items }),
  })
  return normalizeOrder(data)
}

export async function fetchOrder(orderId: number): Promise<Order> {
  const data = await backendJson<Record<string, unknown>>(`/orders/${orderId}`)
  return normalizeOrder(data)
}

export function formatOrderCode(orderId: number): string {
  return `#ORD-${String(orderId).padStart(6, '0')}`
}
