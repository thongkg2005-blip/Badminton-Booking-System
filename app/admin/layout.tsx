'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  role?: string
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const [isAllowed, setIsAllowed] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
      router.replace('/auth')
      return
    }

    try {
      const user = JSON.parse(storedUser) as User
      if (user.role?.toUpperCase() !== 'ADMIN') {
        router.replace('/')
        return
      }

      setIsAllowed(true)
    } catch {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      router.replace('/auth')
    }
  }, [router])

  if (!isAllowed) {
    return null
  }

  return <>{children}</>
}