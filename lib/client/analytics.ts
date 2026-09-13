"use client";

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, unknown>) => void };
  }
}

/**
 * Umami's script can be blocked (ad blockers, disabled JS features) or not yet
 * loaded when an event fires early — track() must never throw into a click handler.
 */
export function track(event: string, data?: Record<string, unknown>) {
  try {
    window.umami?.track(event, data);
  } catch {
    // Swallowed — analytics must never break the user-facing action it's attached to.
  }
}
