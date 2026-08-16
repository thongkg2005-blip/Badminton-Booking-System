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
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  totalAmount: number
  shippingAmount: number
  paymentMethod: 'ONLINE' | 'COD' | string
  paymentStatus: 'PAID' | 'PENDING' | string
  orderStatus: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | string
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
    customerEmail: String(raw.customerEmail ?? ''),
    customerPhone: String(raw.customerPhone ?? ''),
    shippingAddress: String(raw.shippingAddress ?? ''),
    totalAmount: toNumber(raw.totalAmount),
    shippingAmount: toNumber(raw.shippingAmount),
    paymentMethod: String(raw.paymentMethod ?? 'ONLINE'),
    paymentStatus: String(raw.paymentStatus ?? 'PAID'),
    orderStatus: String(raw.orderStatus ?? 'PENDING'),
    purchaseDate: String(raw.purchaseDate ?? ''),
    items: items.map((item) => normalizeOrderItem(item as Record<string, unknown>)),
  }
}

export type CreateOrderItem = {
  productId: number
  quantity: number
}

export type CreateOrderInput = {
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  paymentMethod: 'ONLINE' | 'COD'
  items: CreateOrderItem[]
}

export async function createOrder(
  input: CreateOrderInput): Promise<Order> {
  const data = await backendJson<Record<string, unknown>>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return normalizeOrder(data)
}

export async function fetchOrder(orderId: number): Promise<Order> {
  const data = await backendJson<Record<string, unknown>>(`/orders/${orderId}`)
  return normalizeOrder(data)
}

export async function fetchMyOrders(): Promise<Order[]> {
  const data = await backendJson<Record<string, unknown>[]>(`/orders/my`)
  return data.map((item) => normalizeOrder(item))
}

export async function fetchAdminOrders(): Promise<Order[]> {
  const data = await backendJson<Record<string, unknown>[]>(`/admin/orders`)
  return data.map((item) => normalizeOrder(item))
}

export async function updateAdminOrderStatus(orderId: number, status: Order['orderStatus']): Promise<Order> {
  const data = await backendJson<Record<string, unknown>>(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  return normalizeOrder(data)
}

export function formatOrderCode(orderId: number): string {
  return `#ORD-${String(orderId).padStart(6, '0')}`
}
