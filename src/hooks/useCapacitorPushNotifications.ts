// hooks/useCapacitorPushNotifications.ts
import { useEffect, useRef } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ✅ Platform-agnostic flags
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export const useCapacitorPushNotifications = (userId: string | undefined) => {
  const isMounted = useRef(true);
  const listenersRef = useRef<any[]>([]);

  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      if (listenersRef.current.length > 0) {
        // Only try to remove listeners if on native platform
        if (Capacitor.isNativePlatform()) {
          try {
            PushNotifications.removeAllListeners();
          } catch (e) {
            console.log('Cleanup skipped on web');
          }
        }
        listenersRef.current = [];
      }
    };
  }, []);

  useEffect(() => {
    // Skip if no user ID
    if (!userId) return;
    
    const platform = Capacitor.getPlatform();
    const isNative = Capacitor.isNativePlatform();
    
    console.log(`📱 Push notifications: Platform = ${platform}, Native = ${isNative}`);

    const initPushNotifications = async () => {
      if (isInitialized) {
        console.log('✅ Push notifications already initialized');
        return;
      }
      
      if (initializationPromise) {
        await initializationPromise;
        return;
      }

      initializationPromise = (async () => {
        try {
          // For Web: Use browser notifications as fallback
          if (!isNative) {
            console.log('🌐 Running on Web - using browser notifications');
            
            // Check if browser supports notifications
            if (!('Notification' in window)) {
              console.log('❌ Browser does not support notifications');
              return;
            }
            
            // Request permission for web notifications
            if (Notification.permission !== 'granted') {
              const permission = await Notification.requestPermission();
              if (permission !== 'granted') {
                console.log('❌ Web notification permission denied');
                return;
              }
            }
            
            console.log('✅ Web notifications ready');
            
            // Store web subscription info (optional - for push API)
            // For basic web notifications, we don't need to store token
            isInitialized = true;
            return;
          }
          
          // For Native (Android/iOS): Use Capacitor Push Notifications
          console.log(`📱 Initializing native push notifications for ${platform}`);
          
          // 1. Request permission
          const { receive } = await PushNotifications.requestPermissions();
          if (receive !== 'granted') {
            console.log('❌ Push notification permission denied');
            if (isMounted.current) {
              toast.error('Please enable notifications to receive order updates');
            }
            return;
          }
          console.log('✅ Push notification permission granted');

          // 2. Register with FCM/APNs
          await PushNotifications.register();
          console.log('✅ Push notifications registered');

          // Helper to safely add listener
          const addSafeListener = async <T>(
            eventName: string,
            handler: (data: T) => void
          ) => {
            try {
              const listener = await PushNotifications.addListener(eventName, handler);
              listenersRef.current.push(listener);
              return listener;
            } catch (err) {
              console.error(`Failed to add listener for ${eventName}:`, err);
              return null;
            }
          };

          // 3. Registration success - store token in Supabase
          await addSafeListener('registration', async (token: any) => {
            console.log(`✅ ${platform} registration success, token:`, token.value?.substring(0, 20) + '...');
            
            if (!isMounted.current) return;
            
            try {
              // Store token in Supabase
              const { error } = await supabase
                .from('push_subscriptions')
                .upsert({
                  user_id: userId,
                  push_token: token.value,
                  platform: platform,
                  device_name: platform === 'android' ? 'Android Device' : 'iOS Device',
                  is_active: true,
                  last_used_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }, {
                  onConflict: 'push_token',
                });
              
              if (error) {
                console.error('Failed to store push token:', error);
              } else {
                console.log(`✅ ${platform} token stored in Supabase`);
              }
            } catch (err) {
              console.error('Error storing push token:', err);
            }
          });

          // 4. Registration error
          await addSafeListener('registrationError', (err: any) => {
            console.error(`❌ ${platform} registration error:`, err);
            if (isMounted.current) {
              toast.error('Failed to register for notifications');
            }
          });

          // 5. Notification received while app is in foreground
          await addSafeListener('pushNotificationReceived', (notification: any) => {
            console.log(`📨 ${platform} push received (foreground):`, notification);
            
            if (isMounted.current) {
              const title = notification.title || 'Miramore Update';
              const body = notification.body || 'Your order has been updated';
              toast.info(`${title}\n${body}`, {
                duration: 5000,
              });
            }
          });

          // 6. Notification tapped (opens app from background)
          await addSafeListener('pushNotificationActionPerformed', async (action: any) => {
            console.log(`👆 ${platform} push notification tapped:`, action);
            
            if (!isMounted.current) return;
            
            const notificationData = action.notification?.data;
            const orderId = notificationData?.order_id || notificationData?.orderId;
            
            if (orderId) {
              console.log(`🔗 Navigate to order details: ${orderId}`);
              // Use custom event for navigation (works on all platforms)
              window.dispatchEvent(new CustomEvent('navigate-to-order', { detail: { orderId } }));
            }
          });

          isInitialized = true;
          console.log(`🎉 ${platform} push notifications fully initialized!`);

        } catch (error: any) {
          console.error('💥 Push init failed:', error);
          
          // Handle specific errors gracefully
          if (error.message?.includes('not implemented')) {
            console.log('⚠️ Push notifications not fully implemented on this platform');
          } else if (error.message?.includes('permission')) {
            console.log('⚠️ Notification permission denied');
          }
          
          isInitialized = false;
        } finally {
          initializationPromise = null;
        }
      })();

      await initializationPromise;
    };

    // Initialize after a short delay
    const timeoutId = setTimeout(() => {
      initPushNotifications();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [userId]);
};

// ✅ Helper to check if push is supported on current platform
export const isPushSupported = (): boolean => {
  // Web: Check if Notification API exists
  if (!Capacitor.isNativePlatform()) {
    return 'Notification' in window;
  }
  // Native: Always true (Capacitor handles it)
  return true;
};

// ✅ Helper to get current platform
export const getPushPlatform = (): string => {
  return Capacitor.getPlatform();
};

// ✅ Reinitialize push notifications (works for all platforms)
export const reinitializePushNotifications = async (userId: string) => {
  isInitialized = false;
  initializationPromise = null;
  
  const isNative = Capacitor.isNativePlatform();
  
  try {
    // For Native platforms
    if (isNative) {
      const { receive } = await PushNotifications.requestPermissions();
      if (receive !== 'granted') return false;
      await PushNotifications.register();
      isInitialized = true;
      return true;
    }
    
    // For Web
    if ('Notification' in window && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        isInitialized = true;
        return true;
      }
      return false;
    }
    
    isInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to reinitialize push notifications:', error);
    return false;
  }
};

// ✅ Send a test web notification (for development)
export const sendTestWebNotification = (title: string, body: string) => {
  if (!Capacitor.isNativePlatform() && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/logo.png' });
    return true;
  }
  return false;
};