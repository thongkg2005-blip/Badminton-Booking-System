export const FREE_SHIPPING_THRESHOLD = 5_000_000
export const STANDARD_SHIPPING_FEE = 50_000

export function calculateShipping(subtotal: number): number {
  if (subtotal <= 0) return 0
  return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE
}

export function calculateOrderTotal(subtotal: number): number {
  return subtotal + calculateShipping(subtotal)
}
