import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const existingCustomer = await db.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer with loyalty record
    const customer = await db.customer.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
        phone: phone || null,
        isVerified: false,
        isActive: true,
        emailNotifications: true,
        smsNotifications: true,
      },
    });

    // Create loyalty record
    await db.loyalty.create({
      data: {
        customerId: customer.id,
        points: 0,
        tier: 'BRONZE',
      },
    });

    // Get customer with loyalty
    const customerWithLoyalty = await db.customer.findUnique({
      where: { id: customer.id },
      include: { loyalty: true },
    });

    // Return customer without password
    const { password: _, ...customerWithoutPassword } = customerWithLoyalty!;

    return NextResponse.json({
      customer: customerWithoutPassword,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
