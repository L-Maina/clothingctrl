'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Image,
  Mail,
  Share2,
  TrendingUp,
  ShoppingCart,
  User,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Subscribers', href: '/admin/subscribers', icon: Mail },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Community', href: '/admin/community', icon: Image },
  { name: 'Social', href: '/admin/social', icon: Share2 },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

// Sample notifications - in production, these would come from the database
const sampleNotifications = [
  {
    id: '1',
    type: 'order',
    message: 'New order #ORD-006 received',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    type: 'customer',
    message: 'New customer registered',
    time: '15 min ago',
    read: false,
  },
  {
    id: '3',
    type: 'product',
    message: 'Bape Hoodie is low on stock',
    time: '1 hour ago',
    read: true,
  },
  {
    id: '4',
    type: 'subscriber',
    message: '5 new newsletter subscribers',
    time: '3 hours ago',
    read: true,
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const pathname = usePathname();

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-amber-400" />;
      case 'customer':
        return <User className="w-4 h-4 text-blue-400" />;
      case 'product':
        return <Package className="w-4 h-4 text-purple-400" />;
      case 'subscriber':
        return <Mail className="w-4 h-4 text-green-400" />;
      default:
        return <Bell className="w-4 h-4 text-white/40" />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-zinc-900 border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">CC</span>
            </div>
            <span className="text-white font-bold">Admin Panel</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-amber-400/10 text-amber-400'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-zinc-900">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-amber-400 text-black font-bold">A</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Admin</p>
              <p className="text-white/40 text-xs truncate">admin@clothingctrl.com</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" className="w-full border-white/10 text-white/60 hover:text-white hover:bg-white/5">
              <LogOut className="w-4 h-4 mr-2" />
              Exit Admin
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-zinc-950/80 backdrop-blur-lg border-b border-white/10">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-white/60 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-white">{title}</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative p-2 text-white/60 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{unreadCount}</span>
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-zinc-900 border-white/10">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <DropdownMenuLabel className="text-white">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-amber-400 hover:text-amber-300"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-white/40 text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={cn(
                            'flex items-start gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors',
                            !notification.read && 'bg-white/5'
                          )}
                        >
                          <div className="mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-sm truncate',
                              notification.read ? 'text-white/60' : 'text-white font-medium'
                            )}>
                              {notification.message}
                            </p>
                            <p className="text-white/40 text-xs">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-amber-400 rounded-full mt-1.5" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <div className="p-2">
                    <Link href="/admin/orders" className="block">
                      <Button variant="ghost" className="w-full text-white/60 hover:text-white hover:bg-white/5 text-sm">
                        View all activity
                      </Button>
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-amber-400 text-black font-bold text-sm">A</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 text-white/60 hidden md:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-white/10">
                  <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings" className="text-white/60 hover:text-white focus:text-white cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/analytics" className="text-white/60 hover:text-white focus:text-white cursor-pointer">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Analytics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild>
                    <Link href="/" className="text-red-400 focus:text-red-400 cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Exit Admin
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
