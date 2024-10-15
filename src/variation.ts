import {type DefaultVariationEventPayload, Event, type VariationValue, type VariationValueWithDebug} from './types'
import type { Emitter } from 'mitt'

export function getVariation(
  identifier: string,
  defaultValue: any,
  storage: Record<string, any>,
  metricsHandler: (flag: string, value: any) => void,
  eventBus: Emitter,
  withDebug?: boolean
): VariationValue | VariationValueWithDebug {
  const identifierExists = identifier in storage
  const value = identifierExists ? storage[identifier] : defaultValue

  if (identifierExists) {
    metricsHandler(identifier, value)
  } else {
    const payload: DefaultVariationEventPayload = { flag: identifier, defaultVariation: defaultValue }
    eventBus.emit(Event.ERROR_DEFAULT_VARIATION_RETURNED, payload)  }

  return !withDebug ? value : { value, isDefaultValue: !identifierExists }
}
