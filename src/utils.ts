import { Options } from './types'

export const defaultOptions: Options = {
  debug: false,
  baseUrl: 'http://localhost:7999/api/1.0',
  streamEnabled: true,
  allAttributesPrivate: false,
  privateAttributeNames: []
}
