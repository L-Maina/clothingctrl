'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { useLiveSettings } from '@/hooks/useRealtime';

interface BannerSettings {
  enabled: boolean;
  text: string | null;
  link: string | null;
}

export function AnnouncementBanner() {
  const [banner, setBanner] = useState<BannerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // Fetch banner settings on mount and periodically for "live" updates
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (data.settings) {
          setBanner({
            enabled: data.settings.bannerEnabled || false,
            text: data.settings.bannerText || null,
            link: data.settings.bannerLink || null,
          });
        }
      } catch (error) {
        console.error('Failed to fetch banner settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanner();

    // Poll for updates every 30 seconds for "live" effect
    const interval = setInterval(fetchBanner, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check if previously dismissed this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('banner-dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('banner-dismissed', 'true');
  };

  // Don't render while loading or if banner is disabled/not configured
  if (isLoading) return null;
  if (!banner?.enabled || !banner.text) return null;

  const content = (
    <div className="bg-amber-400 text-black relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage: `linear-gradient(45deg, transparent 25%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.1) 50%, transparent 50%, transparent 75%, rgba(0,0,0,0.1) 75%)`,
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-2.5 relative">
        <div className="flex items-center justify-center gap-2">
          {/* Animated icon */}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="text-lg"
          >
            🔥
          </motion.span>

          {/* Banner text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base font-bold tracking-tight text-center"
          >
            {banner.text}
          </motion.p>

          {/* Link indicator */}
          {banner.link && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden sm:flex items-center gap-1 ml-2"
            >
              <ChevronRight className="w-4 h-4" />
              <span className="text-xs font-semibold underline underline-offset-2">
                Shop Now
              </span>
            </motion.div>
          )}

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute right-2 sm:right-4 p-1 hover:bg-black/10 rounded-full transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="announcement-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          {banner.link ? (
            <Link href={banner.link} className="block hover:brightness-105 transition-all">
              {content}
            </Link>
          ) : (
            content
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to get banner height for adjusting navbar position
export function useBannerHeight() {
  const [banner, setBanner] = useState<BannerSettings | null>(null);
  // Initialize dismissed state from sessionStorage (only runs on client)
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('banner-dismissed') === 'true';
  });

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (data.settings) {
          setBanner({
            enabled: data.settings.bannerEnabled || false,
            text: data.settings.bannerText || null,
            link: data.settings.bannerLink || null,
          });
        }
      } catch (error) {
        console.error('Failed to fetch banner settings:', error);
      }
    };

    fetchBanner();
  }, []);

  // Banner height when visible (approx 44px for the banner content)
  if (!banner?.enabled || !banner.text || dismissed) {
    return 0;
  }
  return 44; // Approximate banner height in pixels
}
