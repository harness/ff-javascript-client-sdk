import type { Evaluation } from './types';
export declare function getCacheId(targetIdentifier: string): string;
export declare function loadFromCache(targetIdentifier: string): Evaluation[];
export declare function saveToCache(targetIdentifier: string, evaluations: Evaluation[]): void;
export declare function updateCachedEvaluation(targetIdentifier: string, evaluation: Evaluation): void;
export declare function removeCachedEvaluation(targetIdentifier: string, flagIdentifier: string): void;
