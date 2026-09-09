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

let globalAudioCtx: AudioContext | null = null;

/**
 * Unlocks the Web Audio API context on any user interaction (click/tap/keypress).
 */
export function unlockAudio() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!globalAudioCtx) {
      globalAudioCtx = new AudioCtx();
    }
    if (globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }
  } catch (err) {
    console.warn("Unlock audio error:", err);
  }
}

/**
  Plays a clear 3-tone audio chime using Web Audio API when a new order is received.
 */
export function playOrderChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!globalAudioCtx || globalAudioCtx.state === "closed") {
      globalAudioCtx = new AudioCtx();
    }

    if (globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }

    const ctx = globalAudioCtx;
    const now = ctx.currentTime;

    // Tone 1 (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.5, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2 (F#5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(739.99, now + 0.12);
    gain2.gain.setValueAtTime(0.6, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);

    // Tone 3 (A5)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(880, now + 0.25);
    gain3.gain.setValueAtTime(0.7, now + 0.25);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.25);
    osc3.stop(now + 0.7);
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
      badge: "/produto.png",
      vibrate: [300, 100, 300, 100, 300],
      requireInteraction: true,
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

import { toast } from "sonner";

/**
 * Triggers a full order alert (Audio chime + Toast + OS Notification + SW Notification)
 */
export async function triggerOrderAlert(order: {
  name: string;
  phone: string;
  address?: string;
  neighborhood?: string | null;
}) {
  unlockAudio();
  playOrderChime();

  const title = `🚨 NOVO PEDIDO: ${order.name}`;
  const body = `Telefone: ${order.phone} | Local: ${order.neighborhood || order.address || "Maputo/Matola"}`;

  // In-app visual toast alert
  toast.success(title, {
    description: body,
    duration: 10000,
  });

  // Try service worker notification first (works when tab is in background)
  if ("serviceWorker" in navigator && Notification.permission === "granted") {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: "/produto.png",
          badge: "/produto.png",
          vibrate: [300, 100, 300, 100, 300],
          tag: `order-${Date.now()}`,
          requireInteraction: true,
          data: { url: "/_authenticated/pedidos" },
        });
        return;
      }
    } catch (err) {
      console.warn("SW notification fallback error:", err);
    }
  }

  // Fallback to standard local Notification
  showLocalNotification(title, { body, requireInteraction: true });
}

/**
 * Triggers a status change notification (Audio chime + Toast + OS Notification + SW Notification)
 */
export async function triggerStatusChangeAlert(order: {
  name: string;
  status: string;
  phone?: string;
}) {
  playOrderChime();

  const statusLabels: Record<string, string> = {
    novo: "Novo 🆕",
    confirmado: "Confirmado ✅",
    em_entrega: "Em entrega 🚚",
    entregue: "Entregue 🏁",
    cancelado: "Cancelado ❌",
  };

  const statusName = statusLabels[order.status] || order.status;
  const title = `📦 Estado Atualizado: ${order.name}`;
  const body = `O pedido de ${order.name} passou para "${statusName}".`;

  // In-app visual toast alert
  toast.info(title, {
    description: body,
    duration: 7000,
  });

  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification && Notification.permission === "granted") {
        await reg.showNotification(title, {
          body,
          icon: "/produto.png",
          badge: "/produto.png",
          vibrate: [100, 50, 100],
          data: { url: "/_authenticated/pedidos" },
        });
        return;
      }
    } catch (err) {
      console.warn("SW status notification error:", err);
    }
  }

  showLocalNotification(title, { body });
}



