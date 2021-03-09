import './customEvent';
import { EventBus } from './eventbus';
import * as EventSource from 'eventsource';

declare global {
  interface Window {
    EventSourcePolyfill: any;
  }
}

export interface LocalStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<any>;
  remove(key: string): Promise<any>;
}

const getLocalStorage = (): LocalStorage => {
  try {
    if (window.localStorage) {
      return {
        get: (key: string) =>
          new Promise((resolve) => {
            resolve(window.localStorage.getItem(key));
          }),
        set: (key: string, value: any) =>
          new Promise((resolve) => {
            window.localStorage.setItem(key, value);
            resolve(value);
          }),
        remove: (key: string) =>
          new Promise((resolve) => {
            window.localStorage.removeItem(key);
            resolve(undefined);
          }),
      };
    }
  } catch (e) {
    return null;
  }
};

const getEventSource = () => {
  return (url: string, headers: object) => new EventSource(url, headers);
};

export interface Platform {
  logger: any;
  eventBus: EventBus;
  localStorage: LocalStorage;
  eventSource: any;
  userAgent: string;
}

export default (): Platform => {
  return {
    logger: console,
    eventBus: new EventBus('features'),
    localStorage: getLocalStorage(),
    eventSource: getEventSource(),
    userAgent: 'js-client',
  };
};
