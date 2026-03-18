'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Star, 
  Package, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronRight,
  Crown,
  Award,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// Tier colors and info
const tierInfo = {
  BRONZE: { 
    color: 'from-amber-700 to-amber-900', 
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-900/20',
    borderColor: 'border-amber-700/30',
    nextTier: 'SILVER',
    pointsNeeded: 200,
    icon: Award,
  },
  SILVER: { 
    color: 'from-gray-400 to-gray-600', 
    textColor: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    borderColor: 'border-gray-500/30',
    nextTier: 'GOLD',
    pointsNeeded: 500,
    icon: Star,
  },
  GOLD: { 
    color: 'from-yellow-500 to-yellow-700', 
    textColor: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    nextTier: 'PLATINUM',
    pointsNeeded: 1000,
    icon: Crown,
  },
  PLATINUM: { 
    color: 'from-purple-400 to-purple-700', 
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    nextTier: null,
    pointsNeeded: null,
    icon: Sparkles,
  },
};

export default function AccountPage() {
  const router = useRouter();
  const { isLoggedIn, user, logout, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/');
    } else {
      // Refresh user data
      fetchCurrentUser();
    }
  }, [isLoggedIn, router, fetchCurrentUser]);

  if (!isLoggedIn || !user) {
    return null;
  }

  const tier = tierInfo[user.loyaltyTier as keyof typeof tierInfo] || tierInfo.BRONZE;
  const TierIcon = tier.icon;
  const progressPercent = tier.nextTier 
    ? Math.min((user.loyaltyPoints / tier.pointsNeeded!) * 100, 100)
    : 100;
  const pointsToNext = tier.nextTier 
    ? Math.max(tier.pointsNeeded! - user.loyaltyPoints, 0)
    : 0;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const quickLinks = [
    { 
      href: '/account/orders', 
      label: 'My Orders', 
      icon: Package, 
      description: 'Track and view your order history' 
    },
    { 
      href: '#wishlist', 
      label: 'Wishlist', 
      icon: Heart, 
      description: 'Your saved items' 
    },
    { 
      href: '#settings', 
      label: 'Account Settings', 
      icon: Settings, 
      description: 'Update your profile and preferences' 
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">MY ACCOUNT</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-white/10 p-6"
            >
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center mb-4">
                  <span className="text-black text-2xl font-black">
                    {(user.name || user.email)[0].toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {user.name || 'Customer'}
                </h2>
                <div className={cn("flex items-center gap-1 mt-1", tier.textColor)}>
                  <TierIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{user.loyaltyTier} Member</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex items-center gap-3 text-white/60">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span className="text-sm truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-white/60">
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
              </div>

              {/* Logout */}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full mt-6 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Loyalty Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={cn(
                "bg-gradient-to-br border p-6",
                tier.color,
                tier.borderColor
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TierIcon className="w-5 h-5 text-white" />
                    <span className="text-white/80 text-sm font-medium uppercase tracking-wider">
                      {user.loyaltyTier} Tier
                    </span>
                  </div>
                  <p className="text-white text-3xl font-black">
                    {user.loyaltyPoints.toLocaleString()} Points
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-xs">Total Earned</p>
                  <p className="text-white font-bold">{user.loyaltyPoints.toLocaleString()}</p>
                </div>
              </div>

              {/* Progress to next tier */}
              {tier.nextTier && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">{pointsToNext} points to {tier.nextTier}</span>
                    <span className="text-white/80">{Math.round(progressPercent)}%</span>
                  </div>
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="h-full bg-white/80 rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-white/80 text-xs">
                  ⭐ Earn 1 point per KSh 100 spent • 🎁 Redeem for discounts • 🚚 Free shipping at {tier.nextTier || 'current'} tier
                </p>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900 border border-white/10"
            >
              <h3 className="text-lg font-bold text-white p-6 border-b border-white/10">
                Quick Links
              </h3>
              <div className="divide-y divide-white/10">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center">
                      <link.icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{link.label}</p>
                      <p className="text-white/50 text-sm">{link.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-zinc-900 border border-white/10 p-6 text-center">
                <Package className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-white/50 text-sm">Total Orders</p>
              </div>
              <div className="bg-zinc-900 border border-white/10 p-6 text-center">
                <Heart className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-white/50 text-sm">Wishlist Items</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
