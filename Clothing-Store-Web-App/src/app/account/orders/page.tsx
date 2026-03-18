'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock, ExternalLink, Download, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

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

interface CustomerData {
  id: string;
  name: string | null;
  email: string;
  loyalty: {
    points: number;
    tier: string;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Package },
  SHIPPED: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: Package },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const { toast } = useToast();

  // Check for customer email (from localStorage or session)
  useEffect(() => {
    const email = localStorage.getItem('customerEmail');
    if (email) {
      setCustomerEmail(email);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch customer data
  useEffect(() => {
    if (!customerEmail) return;

    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/auth/customer/me?email=${customerEmail}`);
        if (response.ok) {
          const data = await response.json();
          setCustomer(data.customer);
        }
      } catch (error) {
        console.error('Failed to fetch customer:', error);
      }
    };

    fetchCustomer();
  }, [customerEmail]);

  // Fetch orders
  useEffect(() => {
    if (!customerEmail) return;

    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          headers: {
            'x-customer-email': customerEmail,
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
  }, [customerEmail]);

  const handlePrintReceipt = (orderId: string) => {
    window.open(`/api/orders/receipt/${orderId}?print=1`, '_blank');
  };

  const handleRequestReview = async (orderId: string) => {
    // This would open a review modal or navigate to a review page
    toast({
      title: 'Coming Soon',
      description: 'Review feature will be available soon!',
    });
  };

  if (!customerEmail) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Sign in to view your orders</h2>
              <p className="text-gray-600 mb-6">
                Please sign in to your account to view your order history.
              </p>
              <Button asChild>
                <Link href="/">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-gray-600">
            Track your orders and view your purchase history
          </p>
        </div>

        {/* Loyalty Card */}
        {customer?.loyalty && (
          <Card className="mb-8 bg-gradient-to-r from-gray-900 to-gray-700 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Loyalty Points</p>
                  <p className="text-3xl font-bold">{customer.loyalty.points}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">Member Tier</p>
                  <Badge className="bg-yellow-500 text-black text-lg px-4 py-1">
                    {customer.loyalty.tier}
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
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-6">
                You have not placed any orders yet. Start shopping!
              </p>
              <Button asChild>
                <Link href="/shop">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              const StatusIcon = status.icon;

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50 border-b">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-KE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <Badge className={status.color}>
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
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-gray-600">
                              {item.color} / {item.size} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            {order.currency} {item.price.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div className="bg-blue-50 p-4 rounded mb-4">
                        <p className="text-sm text-blue-800 mb-1">
                          <Truck className="w-4 h-4 inline mr-1" />
                          Tracking Number: <strong>{order.trackingNumber}</strong>
                        </p>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Track your package <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Order Total */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="text-xl font-bold">
                          {order.currency} {order.total.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintReceipt(order.id)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Receipt
                        </Button>
                        {order.status === 'DELIVERED' && !order.reviewed && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestReview(order.id)}
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
    </div>
  );
}
