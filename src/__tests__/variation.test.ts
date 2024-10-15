import { getVariation } from '../variation'
import type { Emitter } from 'mitt'
import {type DefaultVariationEventPayload, Event} from '../types'

describe('getVariation', () => {
  describe('without debug', () => {
    it('should return the stored value when it exists', () => {
      const storage = { testFlag: true, otherFlag: true, anotherFlag: false }
      const mockMetricsHandler = jest.fn()
      const mockEventBus: Emitter = {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        all: new Map()
      }

      const result = getVariation('testFlag', false, storage, mockMetricsHandler, mockEventBus)

      expect(result).toBe(true)
      expect(mockMetricsHandler).toHaveBeenCalledWith('testFlag', true)
      expect(mockEventBus.emit).not.toHaveBeenCalled()
    })

    it('should return the default value and emit event when it is missing', () => {
      const storage = {}
      const mockMetricsHandler = jest.fn()
      const mockEventBus: Emitter = {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        all: new Map()
      }

      const defaultValue = false
      const result = getVariation('testFlag', defaultValue, storage, mockMetricsHandler, mockEventBus)

      expect(result).toBe(defaultValue)
      expect(mockMetricsHandler).not.toHaveBeenCalled()

      const expectedEvent: DefaultVariationEventPayload = { flag: 'testFlag', defaultVariation: defaultValue }

      expect(mockEventBus.emit).toHaveBeenCalledWith(Event.ERROR_DEFAULT_VARIATION_RETURNED, expectedEvent)
    })
  })

  describe('with debug', () => {
    const flagIdentifier = 'testFlag'

    it('should return debug type with stored value', () => {
      const storage = { testFlag: true, otherFlag: true, anotherFlag: false }
      const mockMetricsHandler = jest.fn()
      const mockEventBus: Emitter = {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        all: new Map()
      }

      const result = getVariation('testFlag', false, storage, mockMetricsHandler, mockEventBus, true)

      expect(result).toEqual({ value: true, isDefaultValue: false })
      expect(mockMetricsHandler).toHaveBeenCalledWith(flagIdentifier, true)
      expect(mockEventBus.emit).not.toHaveBeenCalled()
    })

    it('should return debug type with default value when flag is missing', () => {
      const storage = { otherFlag: true }
      const mockMetricsHandler = jest.fn()
      const mockEventBus: Emitter = {
        emit: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        all: new Map()
      }

      const defaultValue = false
      const result = getVariation('testFlag', defaultValue, storage, mockMetricsHandler, mockEventBus, true)

      expect(result).toEqual({ value: defaultValue, isDefaultValue: true })
      expect(mockMetricsHandler).not.toHaveBeenCalled()

      const expectedEvent: DefaultVariationEventPayload = { flag: 'testFlag', defaultVariation: defaultValue }

      expect(mockEventBus.emit).toHaveBeenCalledWith(Event.ERROR_DEFAULT_VARIATION_RETURNED, expectedEvent)
    })
  })
})
