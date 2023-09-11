import type { VariationValue, VariationValueWithDebug } from './types'

export function getVariation(
  identifier: string,
  defaultValue: any,
  storage: Record<string, any>,
  metricsHandler: (flag: string, value: any) => void,
  withDebug?: boolean
): VariationValue | VariationValueWithDebug {
  const identifierExists = identifier in storage
  const value = identifierExists ? storage[identifier] : defaultValue

  if (identifierExists) {
    metricsHandler(identifier, value)
  }

  return !withDebug ? value : { value, isDefaultValue: !identifierExists }
}
