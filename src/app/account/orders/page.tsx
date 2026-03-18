'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Truck, CheckCircle, Clock, ExternalLink, Download, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productImage: string | null;
    quantity: number;
    price: number;
    color: string;
    size: string;
  }>;
  createdAt: string;
  reviewRequested: boolean;
  reviewed: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
  PROCESSING: { label: 'Processing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Package },
  SHIPPED: { label: 'Shipped', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Package },
};

export default function OrdersPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  // Fetch orders
  useEffect(() => {
    if (!isLoggedIn || !user?.email) return;

    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          headers: {
            'x-customer-email': user.email,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, user?.email]);

  const handlePrintReceipt = (orderId: string) => {
    window.open(`/api/orders/receipt/${orderId}?print=1`, '_blank');
  };

  const handleRequestReview = async (orderId: string) => {
    toast({
      title: 'Coming Soon',
      description: 'Review feature will be available soon!',
    });
  };

  if (!isLoggedIn || !user) {
    return (
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="bg-zinc-900 border-white/10">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-white/40 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Sign in to view your orders</h2>
              <p className="text-white/60 mb-6">
                Please sign in to your account to view your order history.
              </p>
              <Button asChild className="bg-amber-400 hover:bg-amber-300 text-black">
                <Link href="/">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => router.push('/account')}
              className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-white/60 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-white">My Orders</h1>
          </div>
          <p className="text-white/60">
            Track your orders and view your purchase history
          </p>
        </div>

        {/* Loyalty Card */}
        {user.loyaltyPoints > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-gray-900 to-gray-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Loyalty Points</p>
                  <p className="text-3xl font-bold">{user.loyaltyPoints}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">Member Tier</p>
                  <Badge className="bg-yellow-500 text-black text-lg px-4 py-1">
                    {user.loyaltyTier}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-zinc-900 border-white/10">
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full bg-zinc-800" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="bg-zinc-900 border-white/10">
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-white/40 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No orders yet</h2>
              <p className="text-white/60 mb-6">
                You have not placed any orders yet. Start shopping!
              </p>
              <Button asChild className="bg-amber-400 hover:bg-amber-300 text-black">
                <Link href="/">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              const StatusIcon = status.icon;

              return (
                <Card key={order.id} className="overflow-hidden bg-zinc-900 border-white/10">
                  <CardHeader className="bg-zinc-800/50 border-b border-white/10">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <CardTitle className="text-lg text-white">{order.orderNumber}</CardTitle>
                        <p className="text-sm text-white/60">
                          {new Date(order.createdAt).toLocaleDateString('en-KE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <Badge className={`${status.color} border`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-white/40" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white">{item.productName}</p>
                            <p className="text-sm text-white/60">
                              {item.color} / {item.size} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium text-white">
                            {order.currency} {item.price.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded mb-4">
                        <p className="text-sm text-blue-400 mb-1">
                          <Truck className="w-4 h-4 inline mr-1" />
                          Tracking Number: <strong>{order.trackingNumber}</strong>
                        </p>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-300 hover:text-blue-200 hover:underline"
                          >
                            Track your package <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Order Total */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div>
                        <p className="text-sm text-white/60">Total</p>
                        <p className="text-xl font-bold text-white">
                          {order.currency} {order.total.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintReceipt(order.id)}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Receipt
                        </Button>
                        {order.status === 'DELIVERED' && !order.reviewed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestReview(order.id)}
                            className="border-amber-400/50 text-amber-400 hover:bg-amber-400/10"
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
