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
    RECONNECTED = "reconnected",
    CHANGED = "changed",
    ERROR = "error"
}
export declare type VariationValue = string | number | object | undefined;
export interface Evaluation {
    flag: string;
    value: VariationValue;
    deleted?: boolean;
}
export declare type EventCallback = (event?: Evaluation[] | Error) => void;
export interface Result {
    on: (event: Event, callback: EventCallback) => void;
    off: (event: Event, callback: EventCallback) => void;
    variation: (identifier: string, defaultValue: any) => VariationValue;
    close: () => void;
}
export interface Options {
    debug: boolean;
    baseUrl: string;
    streamEnabled: boolean;
    allAttributesPrivate: boolean;
    privateAttributeNames: string[];
}
