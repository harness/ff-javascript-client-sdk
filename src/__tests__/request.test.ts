import { addMiddlewareToFetch } from '../request'

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
})
