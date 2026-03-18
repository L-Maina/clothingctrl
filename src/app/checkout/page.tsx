'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, Truck, Shield, Check, Loader2, MapPin, Gift, Download, X, Sparkles, AlertCircle, Tag, Percent } from 'lucide-react';
import { SiVisa, SiMastercard, SiPaypal } from 'react-icons/si';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCartStore, useCurrencyStore, useAuthStore, useCustomerStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface Location {
  id: string;
  name: string;
  county: string;
  type: string;
}

interface OrderResult {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  discount: {
    code: string;
    amount: number;
  } | null;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
    color: string | null;
    size: string | null;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    country: string;
    postalCode?: string;
    phone: string;
  };
  createdAt: string;
  loyaltyPointsEarned: number;
}

export default function CheckoutPage() {
  const { items, getSubtotal, clearCart } = useCartStore();
  const { formatPrice } = useCurrencyStore();
  const { isLoggedIn, user, openLoginModal } = useAuthStore();
  const { addLoyaltyPoints, deductLoyaltyPoints } = useCustomerStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card' | 'paypal'>('mpesa');
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    type: string;
    value: number;
    discountAmount: number;
  } | null>(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  
  // Loyalty points redemption state
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const POINTS_VALUE = 1; // 1 point = KSh 1
  
  // Shipping settings from API
  const [shippingSettings, setShippingSettings] = useState<{
    shippingNairobi: number;
    shippingKenya: number;
    shippingInternational: number;
    shippingFreeThreshold: number | null;
  }>({
    shippingNairobi: 200,
    shippingKenya: 500,
    shippingInternational: 2000,
    shippingFreeThreshold: null,
  });
  
  // Location autocomplete state
  const [citySearch, setCitySearch] = useState('');
  const [citySuggestions, setCitySuggestions] = useState<Location[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Kenya',
    postalCode: '',
    mpesaNumber: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  // Fetch shipping settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (data.settings) {
          setShippingSettings({
            shippingNairobi: data.settings.shippingNairobi ?? 200,
            shippingKenya: data.settings.shippingKenya ?? 500,
            shippingInternational: data.settings.shippingInternational ?? 2000,
            shippingFreeThreshold: data.settings.shippingFreeThreshold ?? null,
          });
        }
      } catch (error) {
        console.error('Failed to fetch shipping settings:', error);
      }
    };
    fetchSettings();
  }, []);

  // Autofill form if logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      const nameParts = (user.name || '').split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || prev.firstName,
        lastName: nameParts.slice(1).join(' ') || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [isLoggedIn, user]);

  // Location autocomplete search
  useEffect(() => {
    const searchLocations = async () => {
      if (citySearch.length < 2) {
        setCitySuggestions([]);
        return;
      }
      
      setIsLoadingLocations(true);
      try {
        const response = await fetch(`/api/locations?q=${encodeURIComponent(citySearch)}&limit=10`);
        const data = await response.json();
        setCitySuggestions(data.locations || []);
        setShowCitySuggestions(true);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    const debounce = setTimeout(searchLocations, 300);
    return () => clearTimeout(debounce);
  }, [citySearch]);

  const selectCity = (location: Location) => {
    setFormData(prev => ({ ...prev, city: location.name }));
    setCitySearch(location.name);
    setShowCitySuggestions(false);
  };

  // Calculate shipping based on location and settings
  const calculateShipping = () => {
    const cityLower = formData.city.toLowerCase().trim();
    const countryLower = formData.country.toLowerCase().trim();
    
    // Free shipping threshold check - only apply if threshold is set (not null)
    if (shippingSettings.shippingFreeThreshold !== null && subtotal >= shippingSettings.shippingFreeThreshold) {
      return 0;
    }
    
    // International shipping
    if (countryLower !== 'kenya') {
      return shippingSettings.shippingInternational;
    }
    
    // Check if Nairobi (exact match or contains nairobi)
    const nairobiAreas = ['nairobi', 'westlands', 'kilimani', 'karen', 'lavington', 'kileleshwa', 'parklands', 'embakasi', 'kasarani'];
    const isNairobi = nairobiAreas.some(area => cityLower.includes(area)) || cityLower === 'nairobi';
    
    if (isNairobi) {
      return shippingSettings.shippingNairobi;
    }
    
    // Other areas in Kenya
    return shippingSettings.shippingKenya;
  };

  const subtotal = getSubtotal();
  const shipping = calculateShipping();
  const discountAmount = appliedDiscount?.discountAmount || 0;
  
  // Calculate loyalty points redemption
  const availablePoints = user?.loyaltyPoints || 0;
  const maxPointsValue = Math.min(availablePoints, subtotal - discountAmount);
  const pointsDiscount = usePoints ? Math.min(pointsToRedeem, maxPointsValue) : 0;
  
  const taxableAmount = Math.max(0, subtotal - discountAmount - pointsDiscount);
  const tax = taxableAmount * 0.16;
  const total = subtotal - discountAmount - pointsDiscount + shipping + tax;
  const loyaltyPointsEarned = Math.floor(total / 100);
  
  // Apply discount code
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setValidatingDiscount(true);
    setDiscountError(null);
    
    try {
      const response = await fetch(`/api/discounts?code=${encodeURIComponent(discountCode)}&amount=${subtotal}`);
      const data = await response.json();
      
      if (data.valid) {
        setAppliedDiscount({
          code: data.code,
          type: data.type,
          value: data.value,
          discountAmount: data.discountAmount,
        });
        setDiscountCode('');
        setDiscountError(null);
      } else {
        setDiscountError(data.error || 'Invalid discount code');
        setAppliedDiscount(null);
      }
    } catch (error) {
      setDiscountError('Failed to validate code');
    } finally {
      setValidatingDiscount(false);
    }
  };
  
  const removeDiscount = () => {
    setAppliedDiscount(null);
  setDiscountError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const orderData = {
        customerEmail: formData.email,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerPhone: formData.phone,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          postalCode: formData.postalCode,
          phone: formData.phone,
        },
        paymentMethod,
        isGuestOrder: !isLoggedIn,
        discountCode: appliedDiscount?.code || null,
        pointsUsed: pointsDiscount > 0 ? pointsToRedeem : 0,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Update loyalty points in local store if logged in
      if (isLoggedIn && data.order.loyaltyPointsEarned) {
        // First deduct the points used
        if (pointsDiscount > 0) {
          deductLoyaltyPoints(pointsToRedeem);
        }
        // Then add the points earned
        addLoyaltyPoints(data.order.loyaltyPointsEarned);
      }

      setOrderResult(data.order);
      setIsComplete(true);
      clearCart();

      // Show guest prompt if guest checkout
      if (!isLoggedIn) {
        setTimeout(() => setShowGuestPrompt(true), 1000);
      }
    } catch (error) {
      console.error('Order error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityInputRef.current && !cityInputRef.current.contains(e.target as Node)) {
        setShowCitySuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isComplete && orderResult) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white mb-4">Order Confirmed!</h1>
            <p className="text-white/60 mb-2">Thank you for your purchase.</p>
            <p className="text-amber-400 text-xl font-bold mb-6">Order #{orderResult.orderNumber}</p>
            
            {/* Order Summary Card */}
            <div className="bg-zinc-900 border border-white/10 p-6 mb-6 text-left">
              <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Subtotal</span>
                  <span className="text-white">{formatPrice(orderResult.subtotal)}</span>
                </div>
                {orderResult.discount && orderResult.discount.amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-400">Discount ({orderResult.discount.code})</span>
                    <span className="text-green-400">-{formatPrice(orderResult.discount.amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/60">Shipping</span>
                  <span className="text-white">{orderResult.shipping === 0 ? 'FREE' : formatPrice(orderResult.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Tax (16% VAT)</span>
                  <span className="text-white">{formatPrice(orderResult.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                  <span className="text-white">Total</span>
                  <span className="text-amber-400">{formatPrice(orderResult.total)}</span>
                </div>
              </div>
              
              {/* Items */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-white font-medium mb-2">Items</h4>
                {orderResult.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm text-white/60 py-1">
                    <span>{item.productName} x{item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loyalty Points Earned */}
            {orderResult.loyaltyPointsEarned > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-amber-400/10 border border-amber-400/20 p-4 mb-6 flex items-center gap-3 justify-center"
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 font-medium">
                  You earned {orderResult.loyaltyPointsEarned} loyalty points!
                </span>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/api/orders/receipt/${orderResult.id}`} target="_blank">
                <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
              </Link>
              <Link href="/">
                <Button className="w-full sm:w-auto bg-amber-400 hover:!bg-amber-300 text-black font-bold">
                  CONTINUE SHOPPING
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Guest Account Prompt Modal */}
        <AnimatePresence>
          {showGuestPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowGuestPrompt(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-zinc-950 border border-white/10 rounded-lg p-6 max-w-md w-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-full flex items-center justify-center">
                    <Gift className="w-6 h-6 text-amber-400" />
                  </div>
                  <button onClick={() => setShowGuestPrompt(false)} className="text-white/60 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Create an Account?</h3>
                <p className="text-white/60 mb-6">
                  Create an account to track your orders, earn loyalty points, and get exclusive offers!
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowGuestPrompt(false)}
                    className="flex-1 border-white/20 text-white hover:bg-white/5"
                  >
                    No Thanks
                  </Button>
                  <Button
                    onClick={() => {
                      setShowGuestPrompt(false);
                      openLoginModal();
                    }}
                    className="flex-1 bg-amber-400 hover:bg-amber-300 text-black font-bold"
                  >
                    Create Account
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Your cart is empty</h1>
          <Link href="/">
            <Button className="bg-amber-400 hover:!bg-amber-300 text-black font-bold px-8 py-4 rounded-none transition-colors">
              START SHOPPING
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to shop
          </Link>
          <h1 className="text-3xl font-black text-white">CHECKOUT</h1>
          
          {/* Login prompt for guests */}
          {!isLoggedIn && (
            <div className="mt-4 bg-amber-400/10 border border-amber-400/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <span className="text-white/80 text-sm">Have an account? Sign in to earn loyalty points and track orders.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={openLoginModal}
                className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Info */}
              <div className="bg-zinc-900 border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Contact Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone (e.g., +254 7XX XXX XXX)"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-zinc-900 border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-400" />
                  Shipping Address
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="sm:col-span-2 bg-zinc-800 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                  />
                  
                  {/* City with Autocomplete */}
                  <div className="relative" ref={cityInputRef}>
                    <input
                      type="text"
                      name="city"
                      placeholder="City / Town"
                      required
                      value={citySearch || formData.city}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        setFormData(prev => ({ ...prev, city: e.target.value }));
                      }}
                      onFocus={() => citySearch.length >= 2 && setShowCitySuggestions(true)}
                      className="w-full bg-zinc-800 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                    />
                    {isLoadingLocations && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-white/40" />
                    )}
                    
                    {/* City Suggestions Dropdown */}
                    <AnimatePresence>
                      {showCitySuggestions && citySuggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-1 bg-zinc-800 border border-white/10 rounded-lg max-h-60 overflow-y-auto"
                        >
                          {citySuggestions.map((location) => (
                            <button
                              key={location.id}
                              type="button"
                              onClick={() => selectCity(location)}
                              className="w-full px-4 py-3 text-left hover:bg-zinc-700 flex items-center gap-2 text-white"
                            >
                              <MapPin className="w-4 h-4 text-amber-400" />
                              <div>
                                <span className="font-medium">{location.name}</span>
                                <span className="text-white/50 text-sm ml-2">{location.county} County</span>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Kenya">Kenya</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="South Africa">South Africa</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="UAE">UAE</option>
                    <option value="Other">Other</option>
                  </select>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code (optional)"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                  />
                </div>
                
                {/* Shipping Info */}
                <div className="mt-4 p-3 bg-zinc-800/50 text-sm text-white/60">
                  <p>
                    🚚 Nairobi: KSh {shippingSettings.shippingNairobi} | 
                    Kenya: KSh {shippingSettings.shippingKenya} | 
                    International: KSh {shippingSettings.shippingInternational}
                    {shippingSettings.shippingFreeThreshold !== null && (
                      <span> | Free shipping on orders over KSh {shippingSettings.shippingFreeThreshold.toLocaleString()}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-zinc-900 border border-white/10 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  Payment Method
                </h2>
                
                {/* Payment Options */}
                <div className="grid sm:grid-cols-3 gap-3 mb-6">
                  {/* M-Pesa */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mpesa')}
                    className={cn(
                      "p-4 border text-center transition-all flex flex-col items-center gap-2",
                      paymentMethod === 'mpesa'
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-white/10 hover:border-white/30"
                    )}
                  >
                    <div className="w-16 h-10 bg-green-500 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs tracking-tight">M-PESA</span>
                    </div>
                    <span className="text-white font-medium text-sm">M-Pesa</span>
                  </button>
                  
                  {/* Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      "p-4 border text-center transition-all flex flex-col items-center gap-2",
                      paymentMethod === 'card'
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-white/10 hover:border-white/30"
                    )}
                  >
                    <div className="flex gap-3 items-center justify-center">
                      <SiVisa className="w-12 h-8 text-[#1A1F71]" />
                      <SiMastercard className="w-12 h-8" />
                    </div>
                    <span className="text-white font-medium text-sm">Card</span>
                  </button>
                  
                  {/* PayPal */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={cn(
                      "p-4 border text-center transition-all flex flex-col items-center gap-2",
                      paymentMethod === 'paypal'
                        ? "border-amber-400 bg-amber-400/10"
                        : "border-white/10 hover:border-white/30"
                    )}
                  >
                    <SiPaypal className="w-16 h-8 text-[#003087]" />
                    <span className="text-white font-medium text-sm">PayPal</span>
                  </button>
                </div>

                {/* M-Pesa Form */}
                {paymentMethod === 'mpesa' && (
                  <div className="bg-green-900/20 border border-green-500/20 p-4">
                    <p className="text-green-400 text-sm mb-3">
                      You'll receive an M-Pesa prompt on your phone to complete payment.
                    </p>
                    <input
                      type="tel"
                      name="mpesaNumber"
                      placeholder="M-Pesa Number (e.g., 0712345678)"
                      required
                      value={formData.mpesaNumber}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-800 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}

                {/* Card Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="Card Number"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full bg-zinc-800 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="cardExpiry"
                        placeholder="MM/YY"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        className="bg-zinc-800 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                      />
                      <input
                        type="text"
                        name="cardCvc"
                        placeholder="CVC"
                        value={formData.cardCvc}
                        onChange={handleInputChange}
                        className="bg-zinc-800 border border-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                {/* PayPal Form */}
                {paymentMethod === 'paypal' && (
                  <div className="bg-blue-900/20 border border-blue-500/20 p-4">
                    <p className="text-blue-400 text-sm">
                      You'll be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-400 font-medium">Order Failed</p>
                    <p className="text-white/60 text-sm mt-1">{errorMessage}</p>
                  </div>
                  <button 
                    onClick={() => setErrorMessage(null)}
                    className="text-white/40 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-amber-400 hover:!bg-amber-300 text-black font-bold py-4 rounded-none text-lg transition-colors"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    PROCESSING...
                  </span>
                ) : (
                  `PAY ${formatPrice(total)}`
                )}
              </Button>

              {/* Security */}
              <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
                <Shield className="w-4 h-4" />
                <span>Secure checkout powered by SSL encryption</span>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900 border border-white/10 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-zinc-800 flex-shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                      <p className="text-white/40 text-xs">{item.color} / {item.size}</p>
                      <p className="text-white/60 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-white font-medium text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Discount Code Input */}
              <div className="mb-4">
                {appliedDiscount ? (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium">{appliedDiscount.code}</span>
                      <span className="text-white/60 text-sm">
                        -{appliedDiscount.type === 'PERCENTAGE' ? `${appliedDiscount.value}%` : formatPrice(appliedDiscount.value)}
                        {appliedDiscount.discountAmount > 0 && (
                          <span className="ml-1">({formatPrice(appliedDiscount.discountAmount)} off)</span>
                        )}
                      </span>
                    </div>
                    <button
                      onClick={removeDiscount}
                      className="text-white/40 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        placeholder="Discount code"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value.toUpperCase());
                          setDiscountError(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyDiscount())}
                        className="w-full bg-zinc-800 border border-white/10 pl-10 pr-4 py-2.5 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400 text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleApplyDiscount}
                      disabled={validatingDiscount || !discountCode.trim()}
                      variant="outline"
                      className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10 px-4"
                    >
                      {validatingDiscount ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                )}
                {discountError && (
                  <p className="text-red-400 text-xs mt-1">{discountError}</p>
                )}
              </div>

              {/* Loyalty Points Redemption */}
              {isLoggedIn && user && (user.loyaltyPoints || 0) > 0 && (
                <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400 font-medium text-sm">Use Loyalty Points</span>
                    </div>
                    <span className="text-white/60 text-sm">{availablePoints} pts available</span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUsePoints(!usePoints);
                        if (usePoints) setPointsToRedeem(0);
                      }}
                      className={cn(
                        "w-5 h-5 border-2 flex items-center justify-center transition-all",
                        usePoints ? "bg-purple-500 border-purple-500" : "border-white/30"
                      )}
                    >
                      {usePoints && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className="text-white text-sm">Redeem points for discount</span>
                  </div>
                  
                  {usePoints && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="range"
                          min="0"
                          max={maxPointsValue}
                          value={pointsToRedeem}
                          onChange={(e) => setPointsToRedeem(parseInt(e.target.value))}
                          className="flex-1 accent-purple-500"
                        />
                        <input
                          type="number"
                          min="0"
                          max={maxPointsValue}
                          value={pointsToRedeem}
                          onChange={(e) => setPointsToRedeem(Math.min(parseInt(e.target.value) || 0, maxPointsValue))}
                          className="w-20 bg-zinc-800 border border-white/10 px-2 py-1 text-white text-sm text-center"
                        />
                      </div>
                      <p className="text-white/50 text-xs">
                        {pointsToRedeem} points = {formatPrice(pointsToRedeem)} discount
                      </p>
                      <button
                        type="button"
                        onClick={() => setPointsToRedeem(maxPointsValue)}
                        className="text-purple-400 text-xs hover:underline"
                      >
                        Use all available points
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                {appliedDiscount && appliedDiscount.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Discount</span>
                    <span className="text-green-400">-{formatPrice(appliedDiscount.discountAmount)}</span>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-400">Points Redeemed</span>
                    <span className="text-purple-400">-{formatPrice(pointsDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Shipping</span>
                  <span className="text-white">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Tax (16% VAT)</span>
                  <span className="text-white">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                  <span className="text-white">Total</span>
                  <span className="text-amber-400">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Loyalty Points Preview */}
              <div className="mt-4 p-3 bg-amber-400/10 border border-amber-400/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 text-sm font-medium">
                    Earn {loyaltyPointsEarned} loyalty points
                  </span>
                </div>
                {!isLoggedIn && (
                  <p className="text-white/50 text-xs mt-1">
                    Sign in to start earning points
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
