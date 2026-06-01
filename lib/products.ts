export type Product = {
  id: number
  name: string
  category: string
  brand: string
  price: number
  discount: number
  image: string
  rating?: number
}

export const PRODUCTS: Product[] = [
  { id: 1, name: 'Vợt cầu lông Yonex', category: 'Vợt cầu lông', brand: 'Yonex', price: 2500000, discount: 10, image: '🏸', rating: 4.8 },
  { id: 2, name: 'Vợt Victor Thruster K', category: 'Vợt cầu lông', brand: 'Victor', price: 1800000, discount: 5, image: '🏸', rating: 4.5 },
  { id: 3, name: 'Giày cầu lông Li Ning', category: 'Giày cầu lông', brand: 'Li Ning', price: 1200000, discount: 15, image: '👟', rating: 4.6 },
  { id: 4, name: 'Túi đựng vợt Yonex', category: 'Phụ kiện', brand: 'Yonex', price: 450000, discount: 0, image: '🎒', rating: 4.3 },
  { id: 5, name: 'Dây cầu lông Apacs', category: 'Phụ kiện', brand: 'Apacs', price: 180000, discount: 20, image: '🧵', rating: 4.7 },
  { id: 6, name: 'Lưới cầu lông chuyên dụng', category: 'Phụ kiện', brand: 'Dunlop', price: 950000, discount: 8, image: '🕸️', rating: 4.4 },
  { id: 7, name: 'Áo thể thao cầu lông', category: 'Quần áo', brand: 'Victor', price: 350000, discount: 12, image: '👕', rating: 4.6 },
  { id: 8, name: 'Quần cầu lông nam', category: 'Quần áo', brand: 'Yonex', price: 450000, discount: 10, image: '🩳', rating: 4.5 },
  { id: 9, name: 'Tất thể thao chuyên dụng', category: 'Phụ kiện', brand: 'Apacs', price: 120000, discount: 0, image: '🧦', rating: 4.2 },
]

export default PRODUCTS
