'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Store,
  Mail,
  Phone,
  MapPin,
  Clock,
  Megaphone,
  Save,
  Loader2,
} from 'lucide-react';

interface StoreSettings {
  id: string;
  storeName: string;
  storeDescription: string | null;
  storeEmail: string | null;
  storePhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  country: string | null;
  openHour: string | null;
  closeHour: string | null;
  openDays: string | null;
  bannerEnabled: boolean;
  bannerText: string | null;
  bannerLink: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

const defaultSettings: StoreSettings = {
  id: '',
  storeName: 'Clothing Ctrl',
  storeDescription: 'Your one-stop fashion destination in Nairobi.',
  storeEmail: 'info@clothingctrl.com',
  storePhone: '+254 700 000 000',
  addressLine1: 'Cargen House, Harambee Ave',
  addressLine2: '3rd Floor, Room 310',
  city: 'Nairobi',
  country: 'Kenya',
  openHour: '12:00',
  closeHour: '18:00',
  openDays: 'Mon - Sat',
  bannerEnabled: false,
  bannerText: '',
  bannerLink: '',
  metaTitle: 'Clothing Ctrl | Nairobi Fashion Store',
  metaDescription: 'Your one-stop fashion destination in Nairobi, Kenya.',
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (data.settings) {
          setSettings({ ...defaultSettings, ...data.settings });
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings({ ...defaultSettings, ...data.settings });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof StoreSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="p-8 text-center text-white/40">Loading settings...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Store Settings</h2>
          <p className="text-white/40">Manage your store information and preferences</p>
        </div>
        <Button 
          className="bg-amber-400 hover:bg-amber-300 text-black font-bold"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400/10 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-white">Store Information</CardTitle>
                <CardDescription className="text-white/40">
                  Basic information about your store
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white/60">Store Name</Label>
              <Input
                value={settings.storeName}
                onChange={(e) => updateSetting('storeName', e.target.value)}
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>
            <div>
              <Label className="text-white/60">Store Description</Label>
              <Textarea
                value={settings.storeDescription || ''}
                onChange={(e) => updateSetting('storeDescription', e.target.value)}
                rows={3}
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-400/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-white">Contact Information</CardTitle>
                <CardDescription className="text-white/40">
                  How customers can reach you
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white/60">Email Address</Label>
              <Input
                type="email"
                value={settings.storeEmail || ''}
                onChange={(e) => updateSetting('storeEmail', e.target.value)}
                placeholder="info@clothingctrl.com"
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>
            <div>
              <Label className="text-white/60">Phone Number</Label>
              <Input
                type="tel"
                value={settings.storePhone || ''}
                onChange={(e) => updateSetting('storePhone', e.target.value)}
                placeholder="+254 700 000 000"
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Store Location */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-400/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-white">Store Location</CardTitle>
                <CardDescription className="text-white/40">
                  Physical store address
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white/60">Address Line 1</Label>
              <Input
                value={settings.addressLine1 || ''}
                onChange={(e) => updateSetting('addressLine1', e.target.value)}
                placeholder="Building name, Street"
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>
            <div>
              <Label className="text-white/60">Address Line 2</Label>
              <Input
                value={settings.addressLine2 || ''}
                onChange={(e) => updateSetting('addressLine2', e.target.value)}
                placeholder="Floor, Room number"
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/60">City</Label>
                <Input
                  value={settings.city || ''}
                  onChange={(e) => updateSetting('city', e.target.value)}
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                />
              </div>
              <div>
                <Label className="text-white/60">Country</Label>
                <Input
                  value={settings.country || ''}
                  onChange={(e) => updateSetting('country', e.target.value)}
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Hours */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-400/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-white">Store Hours</CardTitle>
                <CardDescription className="text-white/40">
                  When your store is open
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white/60">Open Days</Label>
              <Input
                value={settings.openDays || ''}
                onChange={(e) => updateSetting('openDays', e.target.value)}
                placeholder="Mon - Sat"
                className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/60">Opening Time</Label>
                <Input
                  type="time"
                  value={settings.openHour || '12:00'}
                  onChange={(e) => updateSetting('openHour', e.target.value)}
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                />
              </div>
              <div>
                <Label className="text-white/60">Closing Time</Label>
                <Input
                  type="time"
                  value={settings.closeHour || '18:00'}
                  onChange={(e) => updateSetting('closeHour', e.target.value)}
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcement Banner */}
        <Card className="bg-zinc-900 border-white/10 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-400/10 rounded-lg flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Announcement Banner</CardTitle>
                  <CardDescription className="text-white/40">
                    Show a promotional banner at the top of your website
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-white/60 text-sm">Enable</Label>
                <Switch
                  checked={settings.bannerEnabled}
                  onCheckedChange={(checked) => updateSetting('bannerEnabled', checked)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white/60">Banner Text</Label>
                <Input
                  value={settings.bannerText || ''}
                  onChange={(e) => updateSetting('bannerText', e.target.value)}
                  placeholder="🔥 Free shipping on orders over KES 5,000!"
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                  disabled={!settings.bannerEnabled}
                />
              </div>
              <div>
                <Label className="text-white/60">Banner Link (optional)</Label>
                <Input
                  value={settings.bannerLink || ''}
                  onChange={(e) => updateSetting('bannerLink', e.target.value)}
                  placeholder="/shop or https://..."
                  className="mt-1.5 bg-zinc-800 border-white/10 text-white focus:border-amber-400"
                  disabled={!settings.bannerEnabled}
                />
              </div>
            </div>
            
            {/* Preview */}
            {settings.bannerEnabled && settings.bannerText && (
              <div className="mt-4">
                <Label className="text-white/60 text-sm mb-2 block">Preview</Label>
                <div className="bg-amber-400 text-black text-center py-2 px-4 text-sm font-medium rounded">
                  {settings.bannerText}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
