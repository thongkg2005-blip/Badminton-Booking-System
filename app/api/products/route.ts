const BACKEND_ORIGIN = process.env.BACKEND_URL ?? 'http://localhost:8080/api'

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_ORIGIN}/products`, { cache: 'no-store' })
    const body = await response.text()

    return new Response(body, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Backend unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
