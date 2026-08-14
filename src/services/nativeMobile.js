/**
 * @file src/services/nativeMobile.js
 * @description Native hardware & bridge services for Android/iOS via Capacitor with browser fallbacks.
 */

import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Network } from '@capacitor/network';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import toast from 'react-hot-toast';

/**
 * Initialize Mobile App Native Handlers (Back button, Network listeners, Status Bar).
 * @param {object} navigate - React Router navigate function
 */
export const initNativeMobileHandlers = (navigate) => {
  // 1. Status Bar styling
  try {
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: '#0F0E17' }).catch(() => {});
  } catch {}

  // 2. Network connectivity listeners
  try {
    Network.addListener('networkStatusChange', (status) => {
      if (!status.connected) {
        toast.error('⚠️ No Internet Connection! Check your network.', { id: 'network-status', duration: 6000 });
      } else {
        toast.success('🟢 Internet Connection Restored!', { id: 'network-status', duration: 3000 });
      }
    }).catch(() => {});
  } catch {}

  // 3. Android Hardware Back Button Handling
  try {
    let lastBackPress = 0;
    CapApp.addListener('backButton', ({ canGoBack }) => {
      const now = Date.now();
      const path = window.location.pathname;

      if (path === '/' || path === '/restaurants') {
        if (now - lastBackPress < 2000) {
          CapApp.exitApp();
        } else {
          lastBackPress = now;
          toast('Press back again to exit FoodRush', { icon: '👋', duration: 2000 });
        }
      } else {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          navigate('/restaurants');
        }
      }
    }).catch(() => {});
  } catch {}
};

/**
 * Native GPS Location Fetcher with graceful browser fallback.
 */
export const getNativeGPSLocation = async () => {
  try {
    const perm = await Geolocation.checkPermissions();
    if (perm.location !== 'granted') {
      const req = await Geolocation.requestPermissions();
      if (req.location !== 'granted') {
        throw new Error('Location permission denied');
      }
    }
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  } catch (err) {
    // Fallback to HTML5 browser geolocation
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (e) => reject(e),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }
};

/**
 * Native Camera & Gallery Photo capture.
 */
export const captureNativePhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // Prompts user: Camera or Photos
    });
    return image.dataUrl;
  } catch (err) {
    return null;
  }
};
