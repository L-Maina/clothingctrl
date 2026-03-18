'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBanner } from '@/components/layout/AnnouncementBanner';
import { CookieConsent } from '@/components/layout/CookieConsent';

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

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // Don't wrap admin pages with customer layout
  const isAdminPage = pathname?.startsWith('/admin');
  
  if (isAdminPage) {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-screen bg-black flex flex-col">
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
      
      {/* Page Content */}
      <div className="flex-1">
        {children}
      </div>
      
      <Footer />
      
      {/* Style Assistant - Lazy loaded floating component */}
      <Suspense fallback={null}>
        <StyleAssistant />
      </Suspense>
      
      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
