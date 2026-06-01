'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-primary text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-medium transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-white text-primary">
              🏸
            </div>
            <span className="hidden sm:inline">Sân Cầu Lông</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/booking" className="text-sm transition-colors hover:text-accent">
              Đặt sân
            </Link>
            <Link href="/shop" className="text-sm transition-colors hover:text-accent">
              Cửa hàng
            </Link>
            <Link href="#contact" className="text-sm transition-colors hover:text-accent">
              Liên hệ
            </Link>
          </div>

          {/* Desktop Auth Button */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/auth"
              className="rounded-md bg-white px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-neutral-100"
            >
              Đăng nhập
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="flex items-center justify-center p-2 text-white hover:bg-white/10 md:hidden rounded transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="border-t border-white/10 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <Link href="/booking" className="text-sm transition-colors hover:text-accent">
                Đặt sân
              </Link>
              <Link href="/shop" className="text-sm transition-colors hover:text-accent">
                Cửa hàng
              </Link>
              <Link href="#contact" className="text-sm transition-colors hover:text-accent">
                Liên hệ
              </Link>
              <Link
                href="/auth"
                className="mt-2 rounded-md bg-white px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-neutral-100"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
