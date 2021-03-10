# Harness CF Client SDK for JavaScript

Basic library for integrating CF into javascript applications.

## Install

```
npm i @harnessio/ff-javascript-client-sdk
```

or

```
yarn add @harnessio/ff-javascript-client-sdk
```

## Usage

```js
import { initialize, Event } from '@harnessio/ff-javascript-client-sdk'
```

Initialize SDK with api key and target information.

```js
// Replace with your SDK Key
const FF_SDK_KEY = "2c2a12a1-6599-406e-96c4-031a51c8a51b"

const cf = initialize(FF_SDK_KEY, {
    identifier: YOUR-TARGET-IDENTIFIER,      // Target identifier
    name: YOUR-TARGET-NAME,                  // Optional target name
    attributes: {                            // Optional target attributes
      email: 'sample@sample.com'
    }
  }, {
    baseUrl: 'http://40.20.100.200/api/1.0', // Replace with your Feature Flags server
  });
```

### Listening to events from the `cf` instance.

```js
cf.on(Event.READY, flags => {
  // Event happens when connection to server is established
  // flags contains all evaluations against SDK key
})

cf.on(Event.CHANGED, flagInfo => {
  // Event happens when a changed event is pushed
  // flagInfo contains information about the updated feature flag
})

cf.on(Event.DISCONNECTED, () => {
  // Event happens when connection is disconnected
})

cf.on(Event.ERROR, () => {
  // Event happens when connection some error has occurred
})
```

### Getting value for a particular feature flag

```js
const value = cf.variation("dark-theme", false)
```

### Cleaning up

Remove a listener of an event by `cf.off`.

```js
cf.off(Event.ERROR, YOUR-CLOSURE)
```

Remove all listeners:

```js
cf.off()
```

On closing your application, call `cf.close()` to close the stream.

```js
cf.close();
```

## License

Apache version 2.