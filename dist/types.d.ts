export interface Target {
    identifier: string;
    name?: string;
    anonymous?: boolean;
    attributes?: object;
}
export interface StreamEvent {
    event: string;
    domain: string;
    identifier: string;
    version: number;
}
export declare enum Event {
    READY = "ready",
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
    CHANGED = "changed",
    ERROR = "error"
}
export declare type VariationValue = boolean | string | number | object | undefined;
export interface Evaluation {
    flag: string;
    identifier: string;
    value: VariationValue;
    kind: string;
    deleted?: boolean;
}
export interface EventCallbackMapping {
    [Event.READY]: (flags: Record<string, VariationValue>) => void;
    [Event.CONNECTED]: () => void;
    [Event.DISCONNECTED]: () => void;
    [Event.CHANGED]: (flag: Evaluation) => void;
    [Event.ERROR]: (error: unknown) => void;
}
export declare type EventOnBinding = <K extends keyof EventCallbackMapping>(event: K, callback: EventCallbackMapping[K]) => void;
export declare type EventOffBinding = <K extends keyof EventCallbackMapping>(event?: K, callback?: EventCallbackMapping[K]) => void;
export interface Result {
    on: EventOnBinding;
    off: EventOffBinding;
    variation: (identifier: string, defaultValue: any) => VariationValue;
    close: () => void;
}
export interface Options {
    baseUrl?: string;
    eventUrl?: string;
    streamEnabled?: boolean;
    allAttributesPrivate?: boolean;
    privateAttributeNames?: string[];
    debug?: boolean;
}
export interface MetricsInfo {
    featureIdentifier: string;
    featureValue: any;
    variationIdentifier: string;
    count: number;
    lastAccessed: number;
}
