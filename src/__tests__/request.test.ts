import { EventSourcePolyfill } from 'event-source-polyfill'
import { addMiddlewareToEventSource, addMiddlewareToFetch } from '../request'

jest.mock('event-source-polyfill', () => ({
  EventSourcePolyfill: jest.fn()
}))

describe('request', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('addMiddlewareToFetch', () => {
    const originalFetch = window.fetch
    const fetchMock = jest.fn().mockResolvedValue(undefined)

    beforeAll(() => {
      window.fetch = fetchMock
    })

    afterAll(() => {
      window.fetch = originalFetch
    })

    test('it should wrap the fetch function and allow augmentation', async () => {
      const newHeader = 'TEST HEADER'
      const wrappedFetch = addMiddlewareToFetch(args => {
        args[1].headers = { ...args[1].headers, newHeader }
        return args
      })

      await wrappedFetch('someUrl', { headers: { header1: 'header1', header2: 'header2' } })

      expect(fetchMock).toHaveBeenCalledWith('someUrl', { headers: expect.objectContaining({ newHeader }) })
    })
  })

  describe('addMiddlewareToEventSource', () => {
    test('it should wrap the EventSource constructor and allow augmentation', async () => {
      const newHeader = 'TEST HEADER'
      const wrappedEventSource = addMiddlewareToEventSource(args => {
        args[1].headers = { ...args[1].headers, newHeader }
        return args
      })

      wrappedEventSource('someUrl', { headers: { header1: 'header1', header2: 'header2' } })

      expect(EventSourcePolyfill).toHaveBeenCalledWith('someUrl', { headers: expect.objectContaining({ newHeader }) })
    })
  })
})
