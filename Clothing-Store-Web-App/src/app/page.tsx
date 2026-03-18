'use client';

import { useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/layout/Hero';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBanner } from '@/components/layout/AnnouncementBanner';
import { ShopSection } from '@/components/sections/ShopSection';
import {
  NewArrivalsSkeleton,
  LimitedDropSkeleton,
  CommunityGridSkeleton,
  NewsletterSkeleton,
} from '@/components/loading/Skeletons';

// Lazy load below-the-fold sections with dynamic imports
const NewArrivals = dynamic(
  () => import('@/components/sections/NewArrivals').then((mod) => mod.NewArrivals),
  {
    loading: () => <NewArrivalsSkeleton />,
    ssr: false,
  }
);

const LimitedDrop = dynamic(
  () => import('@/components/sections/LimitedDrop').then((mod) => mod.LimitedDrop),
  {
    loading: () => <LimitedDropSkeleton />,
    ssr: false,
  }
);

const CommunityGrid = dynamic(
  () => import('@/components/sections/CommunityGrid').then((mod) => mod.CommunityGrid),
  {
    loading: () => <CommunityGridSkeleton />,
    ssr: false,
  }
);

const Newsletter = dynamic(
  () => import('@/components/sections/Newsletter').then((mod) => mod.Newsletter),
  {
    loading: () => <NewsletterSkeleton />,
    ssr: false,
  }
);

// Lazy load modal/drawer components - only load when needed
const CartDrawer = dynamic(
  () => import('@/components/cart/CartDrawer').then((mod) => mod.CartDrawer),
  { ssr: false }
);

const QuickView = dynamic(
  () => import('@/components/products/QuickView').then((mod) => mod.QuickView),
  { ssr: false }
);

const LoginModal = dynamic(
  () => import('@/components/auth/LoginModal').then((mod) => mod.LoginModal),
  { ssr: false }
);

const WishlistDrawer = dynamic(
  () => import('@/components/wishlist/WishlistDrawer').then((mod) => mod.WishlistDrawer),
  { ssr: false }
);

const StyleAssistant = dynamic(
  () => import('@/components/sections/StyleAssistant').then((mod) => mod.StyleAssistant),
  { ssr: false }
);

export default function Home() {
  // Defer database seeding to after initial render using requestIdleCallback
  useEffect(() => {
    const seedDatabase = async () => {
      try {
        const response = await fetch('/api/seed', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
          console.log('Database seeded successfully');
        }
      } catch {
        console.log('Database may already be seeded');
      }
    };

    // Use requestIdleCallback for non-critical seeding
    if ('requestIdleCallback' in window) {
      const idleCallbackId = requestIdleCallback(
        () => {
          seedDatabase();
        },
        { timeout: 3000 }
      );
      return () => cancelIdleCallback(idleCallbackId);
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeoutId = setTimeout(seedDatabase, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  return (
    <main className="min-h-screen bg-black flex flex-col">
      {/* Announcement Banner - Live synced from admin settings */}
      <AnnouncementBanner />
      
      <Navbar />
      
      {/* Lazy loaded modals/drawers - only loaded when opened */}
      <Suspense fallback={null}>
        <CartDrawer />
        <QuickView />
        <LoginModal />
        <WishlistDrawer />
      </Suspense>
      
      {/* Hero Section - Critical, load immediately */}
      <Hero />
      
      {/* Shop Section - Above the fold, load immediately */}
      <section id="shop">
        <ShopSection />
      </section>
      
      {/* Below the fold sections - Lazy loaded */}
      <section id="new">
        <NewArrivals />
      </section>
      
      <section id="drop">
        <LimitedDrop />
      </section>
      
      <section id="community">
        <CommunityGrid />
      </section>
      
      <Newsletter />
      
      <Footer />
      
      {/* Style Assistant - Lazy loaded floating component */}
      <Suspense fallback={null}>
        <StyleAssistant />
      </Suspense>
    </main>
  );
}
