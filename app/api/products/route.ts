import PRODUCTS from '@/lib/products'

export async function GET() {
  return new Response(JSON.stringify(PRODUCTS), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
