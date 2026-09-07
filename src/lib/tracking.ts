/**
 * Estrutura de tracking preparada para Meta Pixel / Google Analytics.
 * Não há IDs configurados: basta adicionar os scripts (Pixel/GA) e estes
 * eventos passam automaticamente a ser enviados.
 */
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
    w.fbq("trackCustom", event, payload);
  }
}
