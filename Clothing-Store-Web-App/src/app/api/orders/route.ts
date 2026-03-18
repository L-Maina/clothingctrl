import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emitSyncEvent } from '@/lib/sync-events';
import { sendOrderConfirmation } from '@/lib/notifications';
import { v4 as uuidv4 } from 'uuid';

// Generate unique order number: CC-YYYYMMDD-XXXX
function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CC-${dateStr}-${random}`;
}

// Calculate loyalty points (1 point per 100 KES spent)
function calculateLoyaltyPoints(total: number): number {
  return Math.floor(total / 100);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerEmail,
      customerName,
      customerPhone,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      notes,
      isGuestOrder,
    } = body;

    // Validate required fields
    if (!customerEmail || !items || items.length === 0 || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find or create customer
    let customer = await db.customer.findUnique({
      where: { email: customerEmail.toLowerCase() },
      include: { loyalty: true },
    });

    if (!customer) {
      // Create guest customer (will appear in admin customers tab)
      customer = await db.customer.create({
        data: {
          email: customerEmail.toLowerCase(),
          name: customerName || null,
          phone: customerPhone || null,
          password: null, // Guest - no password
          isVerified: false,
          isActive: true,
          emailNotifications: true,
          smsNotifications: true,
        },
        include: { loyalty: true },
      });
    } else {
      // Update customer info if provided and missing
      if (customerName && !customer.name) {
        await db.customer.update({
          where: { id: customer.id },
          data: { name: customerName },
        });
      }
      if (customerPhone && !customer.phone) {
        await db.customer.update({
          where: { id: customer.id },
          data: { phone: customerPhone },
        });
      }
    }

    // Ensure customer has loyalty record
    if (!customer.loyalty) {
      await db.loyalty.create({
        data: {
          customerId: customer.id,
          points: 0,
          tier: 'BRONZE',
        },
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        color: item.color,
        size: item.size,
      });
    }

    // Calculate shipping (flat rate 500 KES for Nairobi, 800 KES for elsewhere)
    const shipping = shippingAddress.city?.toLowerCase() === 'nairobi' ? 500 : 800;

    // Calculate tax (16% VAT in Kenya)
    const tax = subtotal * 0.16;

    // Total
    const total = subtotal + shipping + tax;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order with items
    const order = await db.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        status: 'PENDING',
        subtotal,
        shipping,
        tax,
        total,
        currency: 'KES',
        shippingAddr: JSON.stringify(shippingAddress),
        billingAddr: billingAddress ? JSON.stringify(billingAddress) : null,
        paymentMethod: paymentMethod || null,
        paymentStatus: 'PENDING',
        notes: notes || null,
        isGuestOrder: isGuestOrder || false,
        guestEmail: isGuestOrder ? customerEmail : null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: {
          include: { loyalty: true },
        },
      },
    });

    // Add loyalty points
    const points = calculateLoyaltyPoints(total);
    if (points > 0 && customer.loyalty) {
      await db.loyalty.update({
        where: { customerId: customer.id },
        data: {
          points: { increment: points },
        },
      });

      // Update tier based on points
      const totalPoints = customer.loyalty.points + points;
      let tier = 'BRONZE';
      if (totalPoints >= 1000) tier = 'PLATINUM';
      else if (totalPoints >= 500) tier = 'GOLD';
      else if (totalPoints >= 200) tier = 'SILVER';

      await db.loyalty.update({
        where: { customerId: customer.id },
        data: { tier },
      });
    }

    // Clear cart items for this customer
    await db.cartItem.deleteMany({
      where: { customerId: customer.id },
    });

    // Emit sync event
    await emitSyncEvent('ORDER_UPDATE', 'CREATE', {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      customerEmail: customer.email,
    });

    // Send confirmation notification
    await sendOrderConfirmation({
      customerName: customer.name || customer.email.split('@')[0],
      email: customer.email,
      phone: customer.phone || undefined,
      orderNumber: order.orderNumber,
      total: order.total,
      currency: order.currency,
      orderId: order.id,
    });

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal,
        shipping,
        tax,
        total,
        currency: order.currency,
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        })),
        shippingAddress: JSON.parse(order.shippingAddr),
        createdAt: order.createdAt,
        loyaltyPointsEarned: points,
      },
      message: 'Order placed successfully!',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET - Get orders for customer (by email in header)
export async function GET(request: Request) {
  try {
    const customerEmail = request.headers.get('x-customer-email');
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const customer = await db.customer.findUnique({
      where: { email: customerEmail.toLowerCase() },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const orders = await db.order.findMany({
      where: { customerId: customer.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        currency: order.currency,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        estimatedDelivery: order.estimatedDelivery,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images ? JSON.parse(item.product.images)[0] : null,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        })),
        createdAt: order.createdAt,
        reviewRequested: order.reviewRequested,
        reviewed: order.reviewed,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}
