'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useCartStore, useCurrencyStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt?: number | null;
  images: string | string[];
  brand?: string | null;
  condition?: string;
  category?: {
    name: string;
    type: string;
  };
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { addItem } = useCartStore();
  const { formatPrice } = useCurrencyStore();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('clothing-ctrl-recent-searches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('clothing-ctrl-recent-searches', JSON.stringify(updated));
  }, [recentSearches]);

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(Array.isArray(data) ? data : data.products || []);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    
    if (isOpen) {
      // Use capture phase to ensure we catch the event first
      document.addEventListener('keydown', handleEscape, true);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape, true);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleProductClick = (product: Product) => {
    saveRecentSearch(query);
    onClose();
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0] || '',
      color: 'Default',
      size: 'One Size',
      quantity: 1,
    });
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
  };

  const getFallbackImage = (productName: string) => {
    const seed = productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://images.unsplash.com/photo-${1558618666 + seed % 1000000}?w=200&h=250&fit=crop&auto=format`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl mx-auto mt-20 px-4"
          >
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                autoFocus
                className="w-full bg-zinc-900 border border-white/10 rounded-xl py-4 pl-12 pr-24 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/50 text-lg"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="text-white/50 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm rounded-full transition-colors"
                >
                  Done
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="mt-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              ) : query.trim() ? (
                results.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-white/50 text-sm px-2 mb-4">
                      {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                    </p>
                    {results.map((product) => {
                      const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => handleProductClick(product)}
                          className="flex items-center gap-4 p-3 bg-zinc-900/50 hover:bg-zinc-800 rounded-lg cursor-pointer group transition-colors"
                        >
                          {/* Image */}
                          <div className="w-16 h-20 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                            <img
                              src={images[0] || getFallbackImage(product.name)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = getFallbackImage(product.name);
                              }}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            {product.brand && (
                              <p className="text-amber-400/80 text-xs font-medium">{product.brand}</p>
                            )}
                            <h3 className="text-white font-medium truncate">{product.name}</h3>
                            <p className="text-white/50 text-sm">{product.category?.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-white font-bold">{formatPrice(product.price)}</span>
                              {product.compareAt && (
                                <span className="text-white/40 text-sm line-through">
                                  {formatPrice(product.compareAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Add */}
                          <button
                            onClick={(e) => handleQuickAdd(product, e)}
                            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1"
                          >
                            Add <ArrowRight className="w-4 h-4" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-white/50 text-lg">No products found for "{query}"</p>
                    <p className="text-white/30 text-sm mt-2">Try a different search term</p>
                  </div>
                )
              ) : (
                /* Recent Searches */
                recentSearches.length > 0 && (
                  <div className="px-2">
                    <p className="text-white/50 text-sm mb-3">Recent searches</p>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRecentSearch(search)}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white/70 hover:text-white rounded-full text-sm transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Close hint - Desktop only */}
            <p className="hidden md:block text-center text-white/30 text-sm mt-6">
              Press <kbd className="px-2 py-1 bg-zinc-800 rounded text-xs">ESC</kbd> to close
            </p>
            
            {/* Mobile close hint */}
            <p className="md:hidden text-center text-white/30 text-sm mt-6">
              Tap outside or click Done to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
