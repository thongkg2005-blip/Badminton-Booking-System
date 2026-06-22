'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

type User = {
  id: number
  username: string
  fullName: string
  role: string
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('user')
      }
    }
  }, [])

  useEffect(() => {
    if (!showDropdown) return
    const close = () => setShowDropdown(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [showDropdown])

  const toggleMenu = () => setIsOpen(!isOpen)
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setUser(null)

    // Refresh page after logout
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-medium transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-primary">
              🏸
            </div>
            <span className="hidden sm:inline">Sân Cầu Lông</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/booking"
              className="text-sm transition-colors hover:text-accent"
            >
              Đặt sân
            </Link>

            <Link
              href="/shop"
              className="text-sm transition-colors hover:text-accent"
            >
              Cửa hàng
            </Link>

            <Link
              href="/contact"
              className="text-sm transition-colors hover:text-accent"
            >
              Liên hệ
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDropdown(!showDropdown)
                  }}
                  className="flex items-center gap-1.5 text-sm font-medium text-white hover:text-accent focus:outline-none cursor-pointer"
                >
                  Xin chào, <strong>{user.fullName}</strong>
                  <span className="text-[10px] opacity-80">▼</span>
                </button>

                {showDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-lg border border-border bg-white py-1 shadow-lg text-neutral-800"
                    onMouseLeave={() => setShowDropdown(false)}
                  >
                    <Link
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm hover:bg-neutral-100 transition-colors"
                    >
                      Thông tin tài khoản
                    </Link>
                    <Link
                      href="/profile/history"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm hover:bg-neutral-100 transition-colors"
                    >
                      Lịch sử đặt sân
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setShowDropdown(false)}
                        className="block px-4 py-2 text-sm font-medium text-accent hover:bg-neutral-100 transition-colors"
                      >
                        Quản lý
                      </Link>
                    )}
                    <hr className="border-t border-neutral-100 my-1" />
                    <button
                      onClick={() => {
                        setShowDropdown(false)
                        handleLogout()
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="rounded-md bg-white px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-neutral-100"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="flex items-center justify-center rounded p-2 text-white transition-colors hover:bg-white/10 md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t border-white/10 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link
                href="/booking"
                className="text-sm transition-colors hover:text-accent"
              >
                Đặt sân
              </Link>

              <Link
                href="/shop"
                className="text-sm transition-colors hover:text-accent"
              >
                Cửa hàng
              </Link>

              <Link
                href="#contact"
                className="text-sm transition-colors hover:text-accent"
              >
                Liên hệ
              </Link>

              {user ? (
                <>
                  <div className="pb-2 border-b border-white/10">
                    <span className="text-sm">
                      Xin chào, <strong>{user.fullName}</strong>
                    </span>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-white/90 hover:text-accent py-1"
                  >
                    Thông tin tài khoản
                  </Link>

                  <Link
                    href="/profile/history"
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-white/90 hover:text-accent py-1"
                  >
                    Lịch sử đặt sân
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-medium text-accent py-1"
                    >
                      Quản lý
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setIsOpen(false)
                      handleLogout()
                    }}
                    className="mt-2 text-left text-sm text-red-400 hover:text-red-500 font-medium py-1 cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="mt-2 rounded-md bg-white px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-neutral-100"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
