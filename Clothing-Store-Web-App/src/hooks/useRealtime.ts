'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store Settings Interface
export interface StoreSettings {
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

// Social Handle Interface
export interface SocialHandle {
  id: string;
  platform: string;
  handle: string;
  url: string | null;
  isActive: boolean;
}

// Default settings
const defaultSettings: StoreSettings = {
  storeName: 'Clothing Ctrl',
  storeDescription: null,
  storeEmail: null,
  storePhone: null,
  addressLine1: null,
  addressLine2: null,
  city: 'Nairobi',
  country: 'Kenya',
  openHour: '12:00',
  closeHour: '18:00',
  openDays: 'Mon-Sat',
  bannerEnabled: false,
  bannerText: null,
  bannerLink: null,
  metaTitle: null,
  metaDescription: null,
};

// Settings Store
interface SettingsStore {
  settings: StoreSettings;
  socials: SocialHandle[];
  isLoading: boolean;
  lastUpdated: number | null;
  setSettings: (settings: Partial<StoreSettings>) => void;
  setSocials: (socials: SocialHandle[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      socials: [],
      isLoading: true,
      lastUpdated: null,
      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
          lastUpdated: Date.now(),
        })),
      setSocials: (socials) =>
        set({
          socials,
          lastUpdated: Date.now(),
        }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'clothing-ctrl-settings',
      partialize: (state) => ({
        settings: state.settings,
        socials: state.socials,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Sync Event Types
export type SyncEventType = 'SETTINGS_UPDATE' | 'SOCIALS_UPDATE' | 'ORDER_UPDATE';

export interface SyncEvent {
  type: SyncEventType;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  data: Record<string, unknown>;
  timestamp: string;
}

// SSE Connection State
interface SSEState {
  isConnected: boolean;
  lastEventTime: string | null;
  reconnectAttempts: number;
  connectionError: string | null;
}

// Hook for components that need live settings with SSE
export function useLiveSettings() {
  const settings = useSettingsStore((state) => state.settings);
  const socials = useSettingsStore((state) => state.socials);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const setSettings = useSettingsStore((state) => state.setSettings);
  const setSocials = useSettingsStore((state) => state.setSocials);
  const setLoading = useSettingsStore((state) => state.setLoading);

  // Fetch settings on mount
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch socials
  const fetchSocials = async () => {
    try {
      const response = await fetch('/api/social');
      const data = await response.json();
      if (data.handles) {
        setSocials(data.handles);
      }
    } catch (error) {
      console.error('Failed to fetch socials:', error);
    }
  };

  // Get banner settings
  const getBanner = () => {
    const { bannerEnabled, bannerText, bannerLink } = settings;
    if (!bannerEnabled || !bannerText) return null;
    return { enabled: bannerEnabled, text: bannerText, link: bannerLink };
  };

  // Get active socials
  const getActiveSocials = () => {
    return socials.filter((s) => s.isActive);
  };

  return {
    settings,
    socials,
    isLoading,
    getBanner,
    getActiveSocials,
    fetchSettings,
    fetchSocials,
    setSettings,
    setSocials,
  };
}

// SSE Hook for real-time updates
export function useRealtimeSync() {
  const setSettings = useSettingsStore((state) => state.setSettings);
  const setSocials = useSettingsStore((state) => state.setSocials);
  const fetchSettings = useLiveSettings().fetchSettings;
  const fetchSocials = useLiveSettings().fetchSocials;

  let eventSource: EventSource | null = null;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const connect = () => {
    if (typeof window === 'undefined') return;
    if (eventSource) {
      eventSource.close();
    }

    try {
      eventSource = new EventSource('/api/sync/events');

      eventSource.onopen = () => {
        console.log('SSE: Connected to sync events');
        reconnectAttempts = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          const data: SyncEvent = JSON.parse(event.data);

          // Handle different event types
          switch (data.type) {
            case 'CONNECTED':
              console.log('SSE: Connection confirmed');
              break;

            case 'KEEPALIVE':
              // Just a heartbeat, no action needed
              break;

            case 'SETTINGS_UPDATE':
              console.log('SSE: Settings updated');
              if (data.data) {
                setSettings(data.data as Partial<StoreSettings>);
              } else {
                fetchSettings();
              }
              break;

            case 'SOCIALS_UPDATE':
              console.log('SSE: Socials updated');
              fetchSocials();
              break;

            case 'ORDER_UPDATE':
              console.log('SSE: Order updated', data.data);
              // Emit custom event for order pages to handle
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('orderUpdate', { detail: data.data }));
              }
              break;

            default:
              console.log('SSE: Unknown event type:', data.type);
          }
        } catch (error) {
          console.error('SSE: Failed to parse event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE: Connection error:', error);
        eventSource?.close();
        eventSource = null;

        // Attempt reconnect with exponential backoff
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts);
          console.log(`SSE: Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeout = setTimeout(() => {
            reconnectAttempts++;
            connect();
          }, delay);
        } else {
          console.error('SSE: Max reconnect attempts reached');
        }
      };
    } catch (error) {
      console.error('SSE: Failed to create EventSource:', error);
    }
  };

  const disconnect = () => {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };

  return {
    connect,
    disconnect,
    isConnected: () => eventSource?.readyState === EventSource.OPEN,
  };
}

// Custom hook for pages that need real-time sync
export function useRealtime() {
  const { connect, disconnect, isConnected } = useRealtimeSync();
  const { fetchSettings, fetchSocials } = useLiveSettings();

  // Initialize on mount (client-side only)
  const init = () => {
    if (typeof window === 'undefined') return;
    
    // Fetch initial data
    fetchSettings();
    fetchSocials();
    
    // Connect to SSE for real-time updates
    connect();
  };

  // Cleanup
  const cleanup = () => {
    disconnect();
  };

  return {
    init,
    cleanup,
    isConnected,
  };
}
