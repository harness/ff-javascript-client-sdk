import type { VariationValue, VariationValueWithDebug } from './types'

export function variationFunction(
  identifier: string,
  defaultValue: any,
  storage: Record<string, any>,
  metricsHandler: (flag: string, value: any) => void,
  withDebug: true
): VariationValueWithDebug
export function variationFunction(
  identifier: string,
  defaultValue: any,
  storage: Record<string, any>,
  metricsHandler: (flag: string, value: any) => void
): VariationValue
export function variationFunction(
  identifier: string,
  defaultValue: any,
  storage: Record<string, any>,
  metricsHandler: (flag: string, value: any) => void,
  withDebug: false
): VariationValue
export function variationFunction(
  identifier: string,
  defaultValue: any,
  storage: Record<string, any>,
  metricsHandler: (flag: string, value: any) => void,
  withDebug?: boolean
): VariationValue {
  const identifierExists = identifier in storage
  const value = identifierExists ? storage[identifier] : defaultValue

  if (identifierExists) {
    metricsHandler(identifier, value)
  }

  return !withDebug ? value : { value, isDefaultValue: !identifierExists }
}

