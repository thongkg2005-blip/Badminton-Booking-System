'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { ProductImage } from '@/components/product-image'
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Tag,
  Package,
  AlertCircle,
  Search,
  Layers,
  ArrowLeft,
  X,
  Check,
  Upload,
  Image as ImageIcon,
} from 'lucide-react'
import {
  fetchProducts,
  fetchProductCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  formatPrice,
  getDiscountedPrice,
  type Product,
  type ProductCategory,
  type ProductInput,
} from '@/lib/product-api'

export default function AdminShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Filter and Search states
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Category Form State
  const [newCatName, setNewCatName] = useState('')
  const [editingCatId, setEditingCatId] = useState<number | null>(null)
  const [editingCatName, setEditingCatName] = useState('')
  const [catActionLoading, setCatActionLoading] = useState(false)
  const [catError, setCatError] = useState<string | null>(null)

  // Product Form State
  const [prodForm, setProdForm] = useState<ProductInput>({
    name: '',
    brand: '',
    price: 0,
    discount: 0,
    image: '🏸',
    stock: 10,
    description: '',
    categoryId: 0,
  })
  const [prodActionLoading, setProdActionLoading] = useState(false)
  const [prodError, setProdError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [prodsData, catsData] = await Promise.all([
        fetchProducts(),
        fetchProductCategories(),
      ])
      setProducts(prodsData)
      setCategories(catsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu cửa hàng')
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  // --- Category Handlers ---
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    setCatActionLoading(true)
    setCatError(null)
    try {
      const created = await createCategory(newCatName.trim())
      setCategories((prev) => [...prev, created])
      setNewCatName('')
      showSuccess(`Đã thêm danh mục "${created.name}"`)
    } catch (err) {
      setCatError(err instanceof Error ? err.message : 'Không thể thêm danh mục')
    } finally {
      setCatActionLoading(false)
    }
  }

  const handleUpdateCategory = async (id: number) => {
    if (!editingCatName.trim()) return
    setCatActionLoading(true)
    setCatError(null)
    try {
      const updated = await updateCategory(id, editingCatName.trim())
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
      setEditingCatId(null)
      setEditingCatName('')
      const prods = await fetchProducts()
      setProducts(prods)
      showSuccess('Đã cập nhật tên danh mục')
    } catch (err) {
      setCatError(err instanceof Error ? err.message : 'Không thể cập nhật danh mục')
    } finally {
      setCatActionLoading(false)
    }
  }

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) return
    setCatActionLoading(true)
    setCatError(null)
    try {
      await deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      if (selectedCategoryId === id) setSelectedCategoryId('ALL')
      showSuccess(`Đã xóa danh mục "${name}"`)
    } catch (err) {
      setCatError(err instanceof Error ? err.message : 'Không thể xóa danh mục')
    } finally {
      setCatActionLoading(false)
    }
  }

  // --- Product Handlers ---
  const openNewProductModal = () => {
    setEditingProduct(null)
    setProdForm({
      name: '',
      brand: 'Yonex',
      price: 100000,
      discount: 0,
      image: '🏸',
      stock: 10,
      description: '',
      categoryId: categories[0]?.id || 0,
    })
    setProdError(null)
    setIsProductModalOpen(true)
  }

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product)
    setProdForm({
      name: product.name,
      brand: product.brand,
      price: product.price,
      discount: product.discount,
      image: product.image,
      stock: product.stock,
      description: product.description || '',
      categoryId: product.category.id,
    })
    setProdError(null)
    setIsProductModalOpen(true)
  }

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setProdError('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP...)')
      return
    }

    // Limit size to ~5MB
    if (file.size > 5 * 1024 * 1024) {
      setProdError('Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        setProdForm((prev) => ({ ...prev, image: dataUrl }))
        setProdError(null)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prodForm.name.trim()) {
      setProdError('Tên sản phẩm không được để trống')
      return
    }
    if (prodForm.price < 0) {
      setProdError('Giá sản phẩm phải lớn hơn hoặc bằng 0')
      return
    }
    if (!prodForm.categoryId) {
      setProdError('Vui lòng chọn danh mục cho sản phẩm')
      return
    }

    setProdActionLoading(true)
    setProdError(null)
    try {
      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, prodForm)
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        showSuccess(`Đã cập nhật sản phẩm "${updated.name}"`)
      } else {
        const created = await createProduct(prodForm)
        setProducts((prev) => [created, ...prev])
        showSuccess(`Đã tạo mới sản phẩm "${created.name}"`)
      }
      setIsProductModalOpen(false)
    } catch (err) {
      setProdError(err instanceof Error ? err.message : 'Không thể lưu sản phẩm')
    } finally {
      setProdActionLoading(false)
    }
  }

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      showSuccess(`Đã xóa sản phẩm "${name}"`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không thể xóa sản phẩm')
    }
  }

  // Filtered Products List
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategoryId === 'ALL' || p.category.id === selectedCategoryId
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Stats calculation
  const totalProducts = products.length
  const totalCategories = categories.length
  const outOfStockCount = products.filter((p) => p.stock <= 0).length

  const isCustomImage =
    prodForm.image &&
    (prodForm.image.startsWith('data:') ||
      prodForm.image.startsWith('http://') ||
      prodForm.image.startsWith('https://') ||
      prodForm.image.startsWith('/'))

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card transition-colors hover:bg-muted"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold mb-1">Quản lý cửa hàng</h1>
                <p className="text-muted-foreground">
                  Quản lý danh mục sản phẩm, hình ảnh, giá bán, giảm giá và tồn kho.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted cursor-pointer"
              >
                <Layers size={16} /> Quản lý danh mục ({categories.length})
              </button>
              <button
                type="button"
                onClick={openNewProductModal}
                className="flex items-center justify-center gap-2 rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium transition-colors hover:bg-accent/90 cursor-pointer"
              >
                <Plus size={16} /> Thêm sản phẩm
              </button>
              <button
                type="button"
                onClick={loadData}
                className="flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted cursor-pointer"
                title="Làm mới"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 flex items-center gap-2">
              <Check size={16} />
              {successMsg}
            </div>
          )}

          {/* Global Error Banner */}
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tổng sản phẩm</p>
                  <p className="text-2xl font-bold">{loading ? '...' : totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-primary opacity-80" />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Danh mục sản phẩm</p>
                  <p className="text-2xl font-bold">{loading ? '...' : totalCategories}</p>
                </div>
                <Tag className="h-8 w-8 text-accent opacity-80" />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sản phẩm hết hàng</p>
                  <p className="text-2xl font-bold text-destructive">
                    {loading ? '...' : outOfStockCount}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-destructive opacity-80" />
              </div>
            </div>
          </div>

          {/* Controls: Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedCategoryId('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategoryId === 'ALL'
                    ? 'bg-accent text-white'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                Tất cả ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category.id === cat.id).length
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      selectedCategoryId === cat.id
                        ? 'bg-accent text-white'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                )
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm sản phẩm, thương hiệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Products Table */}
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
              <Loader2 className="animate-spin" size={16} />
              Đang tải danh sách sản phẩm...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
              Không tìm thấy sản phẩm nào phù hợp.
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                    <tr>
                      <th className="py-3 px-4">Sản phẩm</th>
                      <th className="py-3 px-4">Danh mục</th>
                      <th className="py-3 px-4">Giá gốc (VND)</th>
                      <th className="py-3 px-4">Giảm giá (%)</th>
                      <th className="py-3 px-4">Giá sau giảm</th>
                      <th className="py-3 px-4">Tồn kho</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProducts.map((prod) => {
                      const finalPrice = getDiscountedPrice(prod)
                      return (
                        <tr key={prod.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 border border-border">
                                <ProductImage
                                  image={prod.image}
                                  alt={prod.name}
                                  className="h-full w-full object-cover"
                                  fallbackSizeClass="text-2xl"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{prod.name}</p>
                                <p className="text-xs text-muted-foreground">{prod.brand}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                              {prod.category.name}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {formatPrice(prod.price)}
                          </td>
                          <td className="py-3 px-4">
                            {prod.discount > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                -{prod.discount}%
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">0%</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold text-accent">
                            {formatPrice(finalPrice)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                prod.stock <= 0
                                  ? 'bg-destructive/10 text-destructive'
                                  : prod.stock <= 5
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              {prod.stock <= 0 ? 'Hết hàng' : `${prod.stock} cái`}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditProductModal(prod)}
                                className="p-1.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                className="p-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                title="Xóa"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CATEGORY MANAGEMENT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold">Quản lý danh mục sản phẩm</h2>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            {catError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                {catError}
              </div>
            )}

            {/* Create Category Form */}
            <form onSubmit={handleCreateCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="Tên danh mục mới..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                disabled={catActionLoading || !newCatName.trim()}
                className="rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium hover:bg-accent/90 disabled:opacity-50 cursor-pointer"
              >
                Thêm
              </button>
            </form>

            {/* Existing Categories List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const prodCount = products.filter((p) => p.category.id === cat.id).length
                const isEditing = editingCatId === cat.id

                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-background text-sm"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          className="flex-1 rounded border border-border px-2 py-1 text-xs"
                        />
                        <button
                          onClick={() => handleUpdateCategory(cat.id)}
                          disabled={catActionLoading}
                          className="text-accent hover:underline text-xs font-semibold"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="text-muted-foreground hover:underline text-xs"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="font-medium text-foreground">{cat.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">({prodCount} sản phẩm)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCatId(cat.id)
                              setEditingCatName(cat.name)
                            }}
                            className="p-1 text-muted-foreground hover:text-foreground"
                            title="Đổi tên"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1 text-destructive hover:opacity-80"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT CREATE/EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-xl font-bold">
                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X size={18} />
              </button>
            </div>

            {prodError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                {prodError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">

              {/* IMAGE UPLOAD & PREVIEW SECTION */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold">Hình ảnh sản phẩm</label>

                <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-dashed border-border p-4 bg-muted/20">
                  {/* Image Preview Box */}
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
                    <ProductImage
                      image={prodForm.image}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      fallbackSizeClass="text-5xl"
                    />
                    {isCustomImage && (
                      <button
                        type="button"
                        onClick={() => setProdForm({ ...prodForm, image: '🏸' })}
                        className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-white shadow hover:opacity-90"
                        title="Bỏ ảnh tùy chỉnh"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Upload Actions */}
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted cursor-pointer"
                      >
                        <Upload size={14} /> Tải ảnh từ máy tính
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Hỗ trợ các định dạng PNG, JPG, WEBP (Tối đa 5MB).
                    </p>

                    {/* Emoji Select Fallback */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs text-muted-foreground">Hoặc chọn biểu tượng:</span>
                      <select
                        value={isCustomImage ? '' : prodForm.image}
                        onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                        className="rounded border border-border bg-background px-2 py-1 text-xs"
                      >
                        <option value="🏸">🏸 Vợt</option>
                        <option value="🩲">🩲 Quần áo</option>
                        <option value="🎒">🎒 Balo / Túi</option>
                        <option value="👟">👟 Giày</option>
                        <option value="🧵">🧵 Dây cước</option>
                        <option value="📦">📦 Phụ kiện</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="VD: Vợt cầu lông Yonex Astrox 88D"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Thương hiệu</label>
                  <input
                    type="text"
                    value={prodForm.brand}
                    onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="VD: Yonex, Lining, Victor"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Giá bán (VND) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Giảm giá (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={prodForm.discount}
                    onChange={(e) => setProdForm({ ...prodForm, discount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Số lượng tồn kho *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Danh mục *</label>
                <select
                  value={prodForm.categoryId}
                  onChange={(e) => setProdForm({ ...prodForm, categoryId: Number(e.target.value) })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Mô tả sản phẩm</label>
                <textarea
                  rows={3}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Nhập chi tiết mô tả sản phẩm..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 font-medium hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={prodActionLoading}
                  className="rounded-lg bg-accent text-white px-5 py-2 font-medium hover:bg-accent/90 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {prodActionLoading && <Loader2 className="animate-spin" size={16} />}
                  {editingProduct ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
