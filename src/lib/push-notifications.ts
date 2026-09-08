// VAPID Web Push & Notification Helper Utilities

export const DEFAULT_VAPID_PUBLIC_KEY =
  "BIHG6ASufs0Wg7-D3cFPazrFNmudz4l-SGs9hJu7pWFAkX_GdIR2jktwYUz-o9WqiY0cspf38OuPHCdS-t3Vpaw";

export const DEFAULT_VAPID_PRIVATE_KEY =
  "X02BCMPnu_kTPW8n1gMk1gMiGwzP4bk_8FVAOpKURsc";

export function getVapidPublicKey(): string {
  return (
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_VAPID_PUBLIC_KEY) ||
    DEFAULT_VAPID_PUBLIC_KEY
  );
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Web Push notifications are not supported by this browser.");
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
    return reg;
  } catch (err) {
    console.error("Service worker registration failed:", err);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") {
    return "granted";
  }
  return await Notification.requestPermission();
}

export async function subscribeAdminPush(): Promise<PushSubscription | null> {
  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    throw new Error("Permissão de notificação negada pelo navegador.");
  }

  const reg = await registerServiceWorker();
  if (!reg) {
    throw new Error("Service Worker não está disponível no navegador.");
  }

  const publicKey = getVapidPublicKey();
  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  // Store in local storage for local client reference
  localStorage.setItem("admin_push_subscription", JSON.stringify(sub.toJSON()));
  return sub;
}

export async function unsubscribeAdminPush(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await sub.unsubscribe();
  }
  localStorage.removeItem("admin_push_subscription");
  return true;
}

export async function getAdminPushStatus(): Promise<{
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
}> {
  const supported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
  if (!supported) {
    return { supported: false, permission: "denied", subscribed: false };
  }

  const permission = Notification.permission;
  let subscribed = false;

  if (permission === "granted") {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      subscribed = !!sub;
    } catch {
      subscribed = false;
    }
  }

  return { supported, permission, subscribed };
}

/**
  Plays a soft 2-tone audio chime using Web Audio API when a new order is received.
 */
export function playOrderChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // First tone (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second tone (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0.4, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.6);
  } catch (err) {
    console.warn("Audio chime error:", err);
  }
}

/**
  Displays a native browser notification (when the tab is active/foreground).
 */
export function showLocalNotification(title: string, options?: NotificationOptions) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  try {
    const notification = new Notification(title, {
      icon: "/produto.png",
      badge: "/favicon.ico",
      vibrate: [200, 100, 200],
      ...options,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (err) {
    console.warn("Notification error:", err);
  }
}

/**
 * Triggers a full order alert (Audio chime + OS Notification + SW Notification)
 */
export async function triggerOrderAlert(order: {
  name: string;
  phone: string;
  address?: string;
  neighborhood?: string | null;
}) {
  playOrderChime();

  const title = `🚨 Novo Pedido: ${order.name}`;
  const body = `Telefone: ${order.phone} | Local: ${order.neighborhood || order.address || "Maputo/Matola"}`;

  // Try service worker notification first (works when tab is in background)
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: "/produto.png",
          badge: "/favicon.ico",
          vibrate: [200, 100, 200],
          data: { url: "/_authenticated/pedidos" },
        });
        return;
      }
    } catch (err) {
      console.warn("SW notification fallback error:", err);
    }
  }

  // Fallback to standard local Notification
  showLocalNotification(title, { body });
}

