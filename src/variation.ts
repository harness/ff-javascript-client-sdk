import type { EnhancedVariationResult, VariationValue } from './types'

export function variation(
  storage: Record<string, any>,
  flag: string,
  defaultValue: any,
  metricsHandler: (flag: string, value: any) => void
): VariationValue {
  const value = storage[flag]
    metricsHandler(flag, value)
  return value !== undefined ? value : defaultValue
}

export function enhancedVariation(
  storage: Record<string, any>,
  flagIdentifier: string,
  defaultValue: any,
  metricsHandler: (flag: string, value: any) => void
): EnhancedVariationResult {
  if (!flagExists(storage, flagIdentifier)) {
    return {
      type: 'error',
      defaultValue,
      message: `The flag "${flagIdentifier}" does not exist in storage.`
    }
  }

  const value = storage[flagIdentifier]
  metricsHandler(flagIdentifier, value)

  if (value !== undefined) {
    return {
      type: 'success',
      value
    }
  } else {
    return {
      type: 'error',
      defaultValue,
      message: `The variation value for flag "${flagIdentifier}" is undefined. Returning default value.`
    }
  }
}

const flagExists = (storage: Record<string, any>, flag: string): boolean => {
  return storage.hasOwnProperty(flag)
}
