'use client'

interface ProductImageProps {
  image?: string
  alt?: string
  className?: string
  fallbackSizeClass?: string
}

export function ProductImage({
  image = '🏸',
  alt = 'Sản phẩm',
  className = 'h-full w-full object-cover',
  fallbackSizeClass = 'text-4xl',
}: ProductImageProps) {
  const isUrlOrBase64 =
    image &&
    (image.startsWith('data:') ||
      image.startsWith('http://') ||
      image.startsWith('https://') ||
      image.startsWith('/'))

  if (isUrlOrBase64) {
    return (
      <img
        src={image}
        alt={alt}
        className={className}
        onError={(e) => {
          // If image fails to load, fallback visually
          ;(e.target as HTMLElement).style.display = 'none'
        }}
      />
    )
  }

  return <span className={fallbackSizeClass}>{image}</span>
}
