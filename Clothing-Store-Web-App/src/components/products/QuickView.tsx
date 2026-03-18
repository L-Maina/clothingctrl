'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, useUIStore, useCurrencyStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// Helper function to get color hex codes
function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    'white': '#ffffff',
    'black': '#000000',
    'cream': '#f5f5dc',
    'olive': '#708238',
    'charcoal': '#36454f',
    'sand': '#c2b280',
    'burgundy': '#800020',
    'navy': '#1e3a5f',
    'tan': '#d2b48c',
    'khaki': '#c3b091',
    'grey': '#808080',
    'gray': '#808080',
    'gold': '#ffd700',
    'silver': '#c0c0c0',
    'red': '#ef4444',
    'blue': '#3b82f6',
    'green': '#22c55e',
    'yellow': '#eab308',
    'orange': '#f97316',
    'brown': '#78350f',
    'beige': '#d4a574',
    'pink': '#ec4899',
    'purple': '#a855f7',
    'green camo': '#4a5d23',
    'blue camo': '#3d5a80',
    'white/green': '#f0f5f0',
    'red/black': '#8b0000',
    'white/black': '#e8e8e8',
    'various': '#808080',
    'one size': '#808080',
    'multicolor': '#808080',
  };
  
  const lowerColor = color.toLowerCase();
  return colorMap[lowerColor] || '#888888';
}

function isLightColor(color: string): boolean {
  const lightColors = ['white', 'cream', 'beige', 'sand', 'tan', 'khaki', 'silver', 'yellow', 'gold', 'multicolor', 'white/green', 'white/black'];
  return lightColors.includes(color.toLowerCase());
}

export function QuickView() {
  const { isQuickViewOpen, quickViewProductId, closeQuickView } = useUIStore();
  const { addItem } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (quickViewProductId) {
      fetch(`/api/products?id=${quickViewProductId}`)
        .then(res => res.json())
        .then(data => {
          setProduct(data);
        });
    }
  }, [quickViewProductId]);

  const handleClose = () => {
    closeQuickView();
    setProduct(null);
    setSelectedImage(0);
    setSelectedColor(0);
    setSelectedSize(0);
    setQuantity(1);
  };

  if (!product) return null;

  const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images || [];
  const colors = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors || [];
  const sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes || [];

  const handleAddToCart = () => {
    addItem({
      productId: product.id as string,
      name: product.name as string,
      price: product.price as number,
      image: images[0] || '',
      color: colors[selectedColor] || 'Default',
      size: sizes[selectedSize] || 'One Size',
      quantity,
    });
    handleClose();
  };

  return (
    <AnimatePresence>
      {isQuickViewOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-zinc-950 border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button - More Visible */}
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 z-10 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm rounded-full flex items-center gap-2 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="grid md:grid-cols-2">
              {/* Images */}
              <div className="relative aspect-square bg-zinc-900">
                <img
                  src={images[selectedImage] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop'}
                  alt={product.name as string}
                  className="w-full h-full object-cover"
                />
                
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                    {images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={cn(
                          "w-16 h-16 border-2 overflow-hidden transition-all",
                          selectedImage === idx ? "border-amber-400" : "border-transparent opacity-60"
                        )}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-6 lg:p-8">
                {/* Brand */}
                {product.brand && (
                  <p className="text-amber-400 font-medium tracking-wide text-sm mb-2">
                    {product.brand as string}
                  </p>
                )}

                {/* Name */}
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  {product.name as string}
                </h2>

                {/* Condition Badge */}
                {product.condition && (
                  <span className={cn(
                    "inline-block text-xs font-bold px-3 py-1 tracking-wider mb-4",
                    product.condition === 'NEW' ? "bg-amber-400 text-black" :
                    product.condition === 'THRIFTED' ? "bg-purple-500 text-white" :
                    "bg-blue-500 text-white"
                  )}>
                    {product.condition as string}
                  </span>
                )}

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl font-bold text-white">{formatPrice(product.price as number)}</span>
                  {product.compareAt && (
                    <span className="text-lg text-white/40 line-through">{formatPrice(product.compareAt as number)}</span>
                  )}
                </div>

                {/* Description */}
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  {product.description as string}
                </p>

                {/* Color */}
                {colors.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-3">
                      Color: <span className="text-amber-400">{colors[selectedColor]}</span>
                    </label>
                    <div className="flex gap-2">
                      {colors.map((color: string, idx: number) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(idx)}
                          className={cn(
                            "w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center",
                            selectedColor === idx 
                              ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-black" 
                              : "hover:scale-110"
                          )}
                          style={{
                            backgroundColor: getColorHex(color),
                            border: isLightColor(color) ? '1px solid rgba(255,255,255,0.2)' : 'none',
                          }}
                          title={color}
                        >
                          {selectedColor === idx && (
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              isLightColor(color) ? "bg-black" : "bg-white"
                            )} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size */}
                {sizes.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-white text-sm font-medium mb-3">
                      Size: <span className="text-amber-400">{sizes[selectedSize]}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size: string, idx: number) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(idx)}
                          className={cn(
                            "min-w-12 h-10 px-3 border text-sm font-medium transition-all",
                            selectedSize === idx 
                              ? "bg-amber-400 text-black border-amber-400" 
                              : "bg-transparent text-white border-white/30 hover:border-white"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <label className="block text-white text-sm font-medium mb-3">Quantity</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-white/30">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center text-white font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 bg-amber-400 hover:!bg-amber-300 text-black font-bold py-4 text-lg rounded-none transition-colors"
                  >
                    ADD TO CART — {formatPrice((product.price as number) * quantity)}
                  </Button>
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={cn(
                      "w-12 h-12 flex items-center justify-center border transition-colors",
                      isLiked 
                        ? "bg-red-500 border-red-500 text-white" 
                        : "border-white/30 text-white hover:border-amber-400 hover:text-amber-400"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                  </button>
                  <button className="w-12 h-12 border border-white/30 text-white hover:border-amber-400 hover:text-amber-400 flex items-center justify-center transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Limited Badge */}
                {product.isLimited && (
                  <p className="text-center text-red-400 text-sm mt-4">
                    🔥 Only {product.limitedQty as number} left — Limited Edition
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
