import { getVariation } from '../variation'

describe('getVariation', () => {
  describe('without debug', () => {
    it('should return the stored value when it exists', () => {
      const storage = { testFlag: true, otherFlag: true, anotherFlag: false }
      const mockMetricsHandler = jest.fn()

      const result = getVariation('testFlag', false, storage, mockMetricsHandler)

      expect(result).toBe(true)
      expect(mockMetricsHandler).toHaveBeenCalledWith('testFlag', true)
    })

    it('should return the default value when stored value is undefined', () => {
      const storage = {}
      const mockMetricsHandler = jest.fn()

      const result = getVariation('testFlag', false, storage, mockMetricsHandler)

      expect(result).toBe(false)
      expect(mockMetricsHandler).not.toHaveBeenCalled()
    })
  })

  describe('with debug', () => {
    const flagIdentifier = 'testFlag'

    it('should return debug type with stored value', () => {
      const storage = { testFlag: true, otherFlag: true, anotherFlag: false }
      const mockMetricsHandler = jest.fn()

      const result = getVariation('testFlag', false, storage, mockMetricsHandler, true)

      expect(result).toEqual({ value: true, isDefaultValue: false })
      expect(mockMetricsHandler).toHaveBeenCalledWith(flagIdentifier, true)
    })

    it('should return debug type with default value when flag is missing', () => {
      const storage = { otherFlag: true }
      const mockMetricsHandler = jest.fn()

      const result = getVariation('testFlag', false, storage, mockMetricsHandler, true)

      expect(result).toEqual({ value: false, isDefaultValue: true })
      expect(mockMetricsHandler).not.toHaveBeenCalled()
    })
  })
})
