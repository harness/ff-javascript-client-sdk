import { variationFunction } from '../variation' // Modify the import based on your file structure.

describe('variation without debug', () => {
  it('should return the stored value when it exists', () => {
    const storage = { testFlag: true, otherFlag: true, anotherFlag: false }
    const mockMetricsHandler = jest.fn()

    const result = variationFunction('testFlag', false, storage, mockMetricsHandler)

    expect(result).toBe(true)
    expect(mockMetricsHandler).toBeCalledWith('testFlag', true)
  })

  it('should return the default value when stored value is undefined', () => {
    const storage = {}
    const mockMetricsHandler = jest.fn()

    const result = variationFunction('testFlag', false, storage, mockMetricsHandler)

    expect(result).toBe(false)
    expect(mockMetricsHandler).not.toBeCalled()
  })
})

describe('variation with debug', () => {
  const flagIdentifier = 'testFlag'
  it('should return debug type with stored value', () => {
    const storage = { testFlag: true, otherFlag: true, anotherFlag: false }
    const mockMetricsHandler = jest.fn()

    const result = variationFunction('testFlag', false, storage, mockMetricsHandler, true)

    expect(result.value).toBe(true)
    expect(result.isDefaultValue).toBe(false)

    expect(mockMetricsHandler).toBeCalledWith(flagIdentifier, true)
  })

  it('should return debug type with default value when flag is missing', () => {
    const storage = { otherFlag: true }
    const mockMetricsHandler = jest.fn()

    const result = variationFunction('testFlag', false, storage, mockMetricsHandler, true)

    expect(result).toStrictEqual({ isDefaultValue: true, value: false })
    expect(result.isDefaultValue).toBe(true)
  })
})
