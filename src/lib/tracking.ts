/**
 * Estrutura de tracking configurada para o Meta Pixel ID: 1040143497542982
 */
export const META_PIXEL_ID = "1040143497542982";

export type TrackingEvent = "CTA_CLICK" | "ORDER_SUBMITTED";

type Payload = Record<string, string | number | boolean | undefined>;

export function track(event: TrackingEvent, payload: Payload = {}) {
  if (typeof window === "undefined") return;

  const w = window as unknown as {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  };

  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, ...payload });

  if (typeof w.gtag === "function") {
    w.gtag("event", event, payload);
  }

  if (typeof w.fbq === "function") {
    // Custom event tracking
    w.fbq("trackCustom", event, payload);

    // Standard Meta Pixel Event mappings for Facebook Ads
    if (event === "CTA_CLICK") {
      w.fbq("track", "InitiateCheckout", payload);
    } else if (event === "ORDER_SUBMITTED") {
      w.fbq("track", "Purchase", {
        value: payload.value ?? 750,
        currency: payload.currency ?? "MZN",
        content_name: "Decapante de Limpeza",
      });
      w.fbq("track", "Lead", payload);
    }
  }
}

