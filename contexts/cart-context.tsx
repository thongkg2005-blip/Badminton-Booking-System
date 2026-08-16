'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react'
import { AUTH_SESSION_CHANGED_EVENT } from '@/lib/auth-api'

export type CartItem = {
  id: number
  quantity: number
}

type CartContextType = {
  cartItems: CartItem[]
  cartCount: number
  addToCart: (productId: number, maxStock?: number) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number, maxStock?: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

const CART_STORAGE_BASE = 'badminton_cart'

function getCartStorageKey() {
  if (typeof window === 'undefined') {
    return CART_STORAGE_BASE
  }

  const rawUser = localStorage.getItem('user')
  if (!rawUser) {
    return `${CART_STORAGE_BASE}_guest`
  }

  try {
    const parsedUser = JSON.parse(rawUser) as { id?: number }
    if (parsedUser?.id != null) {
      return `${CART_STORAGE_BASE}_user_${parsedUser.id}`
    }
  } catch {
    // ignore parse errors
  }

  return `${CART_STORAGE_BASE}_guest`
}

function loadCartFromStorage(key: string): CartItem[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = localStorage.getItem(key)
  if (!raw) return []

  try {
    return JSON.parse(raw) as CartItem[]
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const storageKeyRef = useRef<string>(CART_STORAGE_BASE)

  useEffect(() => {
    const key = getCartStorageKey()
    storageKeyRef.current = key
    setCartItems(loadCartFromStorage(key))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(storageKeyRef.current, JSON.stringify(cartItems))
  }, [cartItems, hydrated])

  useEffect(() => {
    const handleAuthChange = () => {
      const nextKey = getCartStorageKey()
      if (nextKey === storageKeyRef.current) return

      storageKeyRef.current = nextKey
      setCartItems(loadCartFromStorage(nextKey))
    }

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuthChange)
    window.addEventListener('storage', handleAuthChange)

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

  const addToCart = useCallback((productId: number, maxStock?: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productId)
      if (existing) {
        const nextQuantity = existing.quantity + 1
        const cappedQuantity = maxStock != null ? Math.min(nextQuantity, maxStock) : nextQuantity
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: cappedQuantity } : item
        )
      }
      return [...prev, { id: productId, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: number, quantity: number, maxStock?: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== productId))
      return
    }

    const cappedQuantity = maxStock != null ? Math.min(quantity, maxStock) : quantity
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: cappedQuantity } : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ cartItems, cartCount, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
