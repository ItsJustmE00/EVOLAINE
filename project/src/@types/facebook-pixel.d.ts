declare module 'facebook-pixel' {
  export function init(pixelId: string, advancedMatching?: any, options?: any): void;
  export function pageView(): void;
  export function track(event: string, parameters?: Record<string, any>): void;
  export function trackCustom(event: string, parameters?: Record<string, any>): void;
  export function trackSingle(pixelId: string, event: string, parameters?: Record<string, any>): void;
  export function trackSingleCustom(pixelId: string, event: string, parameters?: Record<string, any>): void;
  export function initAndTrack(pixelId: string, event: string, parameters?: Record<string, any>): void;
  export function initAndTrackCustom(pixelId: string, event: string, parameters?: Record<string, any>): void;
  export function trackMultiple(pixelIds: string[], event: string, parameters?: Record<string, any>): void;
  export function trackMultipleCustom(pixelIds: string[], event: string, parameters?: Record<string, any>): void;
  export function trackForm(form: HTMLFormElement, event: string, parameters?: Record<string, any>): void;
  export function trackSingleForm(pixelId: string, form: HTMLFormElement, event: string, parameters?: Record<string, any>): void;
  export function trackMultipleForms(pixelIds: string[], form: HTMLFormElement, event: string, parameters?: Record<string, any>): void;
  export function trackSingleCustomForm(pixelId: string, form: HTMLFormElement, event: string, parameters?: Record<string, any>): void;
  export function trackMultipleCustomForms(pixelIds: string[], form: HTMLFormElement, event: string, parameters?: Record<string, any>): void;
  export function fbq(...args: any[]): void;
}

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}
