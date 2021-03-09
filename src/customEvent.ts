declare global {
  interface Window {
    CustomEvent: any;
  }
}

export interface CustomEventParams {
  bubbles: boolean;
  cancelable: boolean;
  detail: any;
}

(() => {
  if (typeof window.CustomEvent === 'function') return false;

  const CustomEvent = (event: string, params: CustomEventParams) => {
    params = params || { bubbles: false, cancelable: false, detail: null };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  };

  window.CustomEvent = CustomEvent;
})();
