type EventCallback<DetailType = any> = (event: CustomEvent<DetailType>) => void;

export class EventBus<DetailType = any> {
  private eventTarget: EventTarget;
  private callbacks: Map<string, EventCallback[]>;

  constructor(description = '') {
    this.eventTarget = document.appendChild(document.createComment(description));
    this.callbacks = new Map<string, EventCallback[]>();
  }
  on(type: string, listener: (event?: CustomEvent<DetailType>) => void, configuration: object = {}): void {
    const listeners = this.callbacks.get(type);
    if (this.callbacks.has(type) && !listeners.includes(listener)) {
      listeners.push(listener);
    }
    this.callbacks.set(type, listeners);
    this.eventTarget.addEventListener(type, listener, configuration);
  }

  once(type: string, listener: (event: CustomEvent<DetailType>) => void): void {
    this.on(type, listener, { once: true });
  }

  off(type?: string, listener?: (event: CustomEvent<DetailType>) => void): void {
    // remove specified listener
    if (type && listener) {
      this.eventTarget.removeEventListener(type, listener);
      return;
    }

    if (type) {
      for (const callback of this.callbacks.get(type)) {
        this.eventTarget.removeEventListener(type, callback);
      }
      this.callbacks.delete(type);
      return;
    }

    // if no argument specified, remove all listeners
    for (const [key, listeners] of this.callbacks) {
      for (listener of listeners) {
        this.eventTarget.removeEventListener(key, listener);
      }
    }
    this.callbacks.clear();
  }

  emit(type: string, detail?: DetailType): boolean {
    return this.eventTarget.dispatchEvent(new CustomEvent(type, { detail }));
  }
}
