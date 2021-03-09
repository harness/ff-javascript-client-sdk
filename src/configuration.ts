export interface Options {
  debug: boolean;
  baseUrl: string;
  streamEnabled: boolean;
  allAttributesPrivate: boolean;
  privateAttributeNames: string[];
}

export const defaultConfiguration: Options = {
  debug: false,
  baseUrl: 'http://localhost:7999/api/1.0',
  streamEnabled: false,
  allAttributesPrivate: false,
  privateAttributeNames: [],
};
