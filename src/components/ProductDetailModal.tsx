import { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, ArrowRight, Check, Star, Flame, Clock, ChevronRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

// ✅ Helper to format price with comma and proper Naira symbol
const formatPrice = (price: number): string => {
  return `₦${price.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

interface Addon {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface ProductDetailModalProps {
  product: any;
  open: boolean;
  onClose: () => void;
  proteinAddons?: Addon[];
  packagingOptions?: Addon[];
  soupIds?: Set<string>;
}

export default function ProductDetailModal({
  product,
  open,
  onClose,
  proteinAddons = [],
  packagingOptions = [],
  soupIds = new Set(),
}: ProductDetailModalProps) {
  const navigate = useNavigate();
  const addToCart = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedProteins, setSelectedProteins] = useState<Addon[]>([]);
  const [selectedPackaging, setSelectedPackaging] = useState<Addon | null>(null);
  const [added, setAdded] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const isBeauty = product?.category === 'beauty';
  const isSoup = product ? soupIds.has(product.id) : false;
  
  const hasSizeOptions = product?.options && product.options.length > 0;
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const isAmalaOriki = product?.vendor === 'Amala Oriki';

  useEffect(() => {
    if (!open) {
      setQuantity(1);
      setSelectedProteins([]);
      setSelectedPackaging(null);
      setAdded(false);
      setActiveSection(null);
      if (hasSizeOptions && product?.options) {
        const defaultOption = product.options.find((opt: any) => opt.is_default) || product.options[0];
        setSelectedSize(defaultOption);
      } else {
        setSelectedSize(null);
      }
    }
  }, [open, product?.id, hasSizeOptions, product?.options]);

  if (!product) return null;

  const baseItemPrice = selectedSize?.price || product.price;
  const proteinTotal = selectedProteins.reduce((sum, p) => sum + p.price, 0);
  const packagingTotal = selectedPackaging?.price || 0;
  const basePrice = baseItemPrice * quantity;
  const totalPrice = basePrice + proteinTotal + packagingTotal;

  const handleAddToCart = () => {
    const productWithCorrectPrice = {
      ...product,
      price: selectedSize?.price || product.price,
    };
    addToCart(
      productWithCorrectPrice,
      quantity,
      selectedSize?.name || '',
      selectedSize?.id || '',
      {
        proteins: selectedProteins,
        packaging: selectedPackaging,
      }
    );
    setAdded(true);
    toast.success(`${product.name} added to cart`, {
      duration: 2000,
      action: {
        label: 'View Cart',
        onClick: () => navigate('/cart'),
      },
    });
    setTimeout(() => setAdded(false), 3000);
  };

  const handleGoToCart = () => {
    onClose();
    navigate('/cart');
  };

  const toggleProtein = (protein: Addon) => {
    setSelectedProteins(prev =>
      prev.some(p => p.id === protein.id)
        ? prev.filter(p => p.id !== protein.id)
        : [...prev, protein]
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto"
          >
            {/* Header - Brand Green */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[#D1FAE5] px-4 py-3 flex justify-between items-center rounded-t-2xl">
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F0FDF4] flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-4 h-4 text-[#10B981]" />
              </button>
              <span className="text-xs font-medium text-[#10B981]">{product.vendor}</span>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-8 h-8 rounded-full bg-[#F0FDF4] flex items-center justify-center active:scale-95 transition-transform"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#EF4444] text-[#EF4444]' : 'text-[#10B981]'}`} />
              </button>
            </div>

            {/* Circular Image */}
            <div className="flex justify-center -mt-8 mb-3">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#F0FDF4] to-[#D1FAE5] shadow-lg flex items-center justify-center overflow-hidden ring-4 ring-white">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl">
                      {product.category === 'food' ? '🍽️' : '💇‍♀️'}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white rounded-full px-2 py-0.5 shadow-sm">
                  <div className="flex items-center gap-1 text-[9px] text-gray-500">
                    <Clock className="w-2.5 h-2.5 text-[#10B981]" />
                    <span>20-30 min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-5 pb-28">
              {/* Name + Price */}
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-bold text-gray-900 flex-1 pr-3">{product.name}</h2>
                <p className="text-lg font-bold text-[#10B981]">{formatPrice(baseItemPrice)}</p>
              </div>
              
              {/* Description */}
              {product.description && (
                <p className="text-gray-500 text-xs leading-relaxed mb-4">{product.description}</p>
              )}

              {/* Size Options - Pill style with brand colors */}
              {hasSizeOptions && product.options && product.options.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-xs font-semibold text-gray-700 mb-2">Select Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.options.map((option: any) => {
                      const isSelected = selectedSize?.id === option.id;
                      const isBestValue = option.is_best_value;
                      const isMostPopular = option.is_most_popular;
                      
                      return (
                        <motion.button
                          key={option.id}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => {
                            setSelectedSize(option);
                            setQuantity(1);
                          }}
                          className={`
                            relative px-4 py-1.5 rounded-full border transition-all text-sm
                            ${isSelected 
                              ? 'border-[#10B981] bg-[#10B981] text-white shadow-md' 
                              : 'border-gray-200 bg-white text-gray-700 hover:border-[#10B981] hover:text-[#10B981]'
                            }
                          `}
                        >
                          <span className="font-medium">{option.name}</span>
                          <span className={`ml-1.5 font-semibold ${isSelected ? 'text-white' : 'text-[#10B981]'}`}>
                            {formatPrice(option.price)}
                          </span>
                          {(isBestValue || isMostPopular) && !isSelected && (
                            <span className="absolute -top-2 -right-2 bg-[#FBBF24] text-[#78350F] text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                              {isBestValue ? 'Best' : '🔥'}
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity - Pill style with brand colors */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">Quantity</h3>
                <div className="inline-flex items-center gap-4 bg-[#F0FDF4] rounded-full px-4 py-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-3 h-3 text-[#10B981]" />
                  </button>
                  <span className="text-base font-semibold text-gray-900 w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Plus className="w-3 h-3 text-[#10B981]" />
                  </button>
                </div>
              </div>

              {/* Protein Add-ons - Green theme */}
              {!isBeauty && isAmalaOriki && proteinAddons.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setActiveSection(activeSection === 'proteins' ? null : 'proteins')}
                    className="w-full flex items-center justify-between p-3 bg-[#F0FDF4] rounded-xl border border-[#D1FAE5]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🍖</span>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-800 text-sm">Add Proteins</h3>
                        {selectedProteins.length > 0 && (
                          <p className="text-[10px] text-[#10B981]">
                            {selectedProteins.length} selected · +{formatPrice(proteinTotal)}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-[#10B981] transition-transform ${activeSection === 'proteins' ? 'rotate-90' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {activeSection === 'proteins' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 space-y-1.5">
                          {proteinAddons.map(protein => {
                            const isSelected = selectedProteins.some(p => p.id === protein.id);
                            return (
                              <motion.button
                                key={protein.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => toggleProtein(protein)}
                                className={`
                                  w-full flex items-center justify-between p-2.5 rounded-xl transition-all
                                  ${isSelected 
                                    ? 'bg-[#D1FAE5] border border-[#10B981]' 
                                    : 'bg-gray-50 border border-gray-100'
                                  }
                                `}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`
                                    w-4 h-4 rounded-full border flex items-center justify-center
                                    ${isSelected ? 'border-[#10B981] bg-[#10B981]' : 'border-gray-300'}
                                  `}>
                                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                  </div>
                                  <div className="text-left">
                                    <p className="font-medium text-sm text-gray-800">{protein.name}</p>
                                    {protein.description && (
                                      <p className="text-[9px] text-gray-400">{protein.description}</p>
                                    )}
                                  </div>
                                </div>
                                <span className="font-semibold text-sm text-[#10B981]">{formatPrice(protein.price)}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Packaging Options - Green theme */}
              {packagingOptions.length > 0 && (isSoup || !isBeauty) && (
                <div className="mb-4">
                  <button
                    onClick={() => setActiveSection(activeSection === 'packaging' ? null : 'packaging')}
                    className="w-full flex items-center justify-between p-3 bg-[#F0FDF4] rounded-xl border border-[#D1FAE5]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📦</span>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-800 text-sm">Packaging</h3>
                        {selectedPackaging && (
                          <p className="text-[10px] text-[#10B981]">
                            {selectedPackaging.name} · +{formatPrice(selectedPackaging.price)}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-[#10B981] transition-transform ${activeSection === 'packaging' ? 'rotate-90' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {activeSection === 'packaging' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 space-y-1.5">
                          {packagingOptions.map(opt => {
                            const isSelected = selectedPackaging?.id === opt.id;
                            return (
                              <motion.button
                                key={opt.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedPackaging(isSelected ? null : opt)}
                                className={`
                                  w-full flex items-center justify-between p-2.5 rounded-xl transition-all
                                  ${isSelected 
                                    ? 'bg-[#D1FAE5] border border-[#10B981]' 
                                    : 'bg-gray-50 border border-gray-100'
                                  }
                                `}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`
                                    w-4 h-4 rounded-full border flex items-center justify-center
                                    ${isSelected ? 'border-[#10B981] bg-[#10B981]' : 'border-gray-300'}
                                  `}>
                                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                  </div>
                                  <div className="text-left">
                                    <p className="font-medium text-sm text-gray-800">{opt.name}</p>
                                    {opt.description && (
                                      <p className="text-[9px] text-gray-400">{opt.description}</p>
                                    )}
                                  </div>
                                </div>
                                <span className="font-semibold text-sm text-[#10B981]">{formatPrice(opt.price)}</span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Bottom Bar - Brand Colors (Green + Yellow) */}
              <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-[#D1FAE5] shadow-xl">
                <div className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total</p>
                      <p className="text-lg font-bold text-[#10B981]">{formatPrice(totalPrice)}</p>
                      {selectedSize && (
                        <p className="text-[9px] text-gray-400">
                          {selectedSize.name} · {quantity} {quantity === 1 ? 'item' : 'items'}
                        </p>
                      )}
                    </div>
                    
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={added ? handleGoToCart : handleAddToCart}
                      className={`
                        px-5 py-2.5 rounded-full font-semibold text-sm text-white transition-all flex items-center gap-2 shadow-md
                        ${added 
                          ? 'bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-[#78350F]' 
                          : 'bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857]'
                        }
                      `}
                    >
                      {added ? (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          View Cart
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add to Cart
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Price breakdown */}
                  <div className="text-[9px] text-gray-400 space-y-0.5 mt-2 pt-1 border-t border-[#D1FAE5]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(basePrice)}</span>
                    </div>
                    {proteinTotal > 0 && (
                      <div className="flex justify-between">
                        <span>Proteins</span>
                        <span>{formatPrice(proteinTotal)}</span>
                      </div>
                    )}
                    {packagingTotal > 0 && (
                      <div className="flex justify-between">
                        <span>Packaging</span>
                        <span>{formatPrice(packagingTotal)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}