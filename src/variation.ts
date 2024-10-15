import { Event, type VariationValue, type VariationValueWithDebug } from './types'
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
    eventBus.emit(Event.ERROR_DEFAULT_VARIATION_RETURNED, { flag: identifier, valueReturned: defaultValue })
  }

  return !withDebug ? value : { value, isDefaultValue: !identifierExists }
}
