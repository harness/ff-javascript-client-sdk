# Before you Begin

Harness Feature Flags (FF) is a feature management solution that enables users to change the software’s functionality,
without deploying new code. FF uses feature flags to hide code or behaviours without having to ship new versions of the
software. A feature flag is like a powerful if statement.

For more information, see https://harness.io/products/feature-flags/

To read more, see https://ngdocs.harness.io/category/vjolt35atg-feature-flags

To sign up, https://app.harness.io/auth/#/signup/

# Harness Feature Flags Client SDK for JavaScript

Library for integrating Harness Feature Flags into JavaScript UI applications.

## Install

```shell
npm i @harnessio/ff-javascript-client-sdk
```

or

```shell
yarn add @harnessio/ff-javascript-client-sdk
```

## Usage

```typescript
import { initialize, Event } from '@harnessio/ff-javascript-client-sdk'
```

Initialize SDK with api key and target information.

```typescript
initialize(FeatureFlagSDKKey: string, target: Target, options?: Options)
```

In which `Target` and `Options` are defined as:

```typescript
interface Target {
  identifier: string
  name?: string
  anonymous?: boolean
  attributes?: object
}

interface Options {
  baseUrl?: string
  eventUrl?: string
  eventsSyncInterval?: number
  pollingInterval?: number
  pollingEnabled?: boolean
  streamEnabled?: boolean
  debug?: boolean,
  cache?: boolean | CacheOptions
  logger?: Logger
}
```

For example:

```typescript
const client = initialize('00000000-1111-2222-3333-444444444444', {
  identifier: YOUR_TARGET_IDENTIFIER,      // Target identifier
  name: YOUR_TARGET_NAME,                  // Optional target name
  attributes: {                            // Optional target attributes
    email: 'sample@sample.com'
  }
})
```


## Streaming and Polling Mode

By default, Harness Feature Flags SDK has streaming enabled and polling enabled. Both modes can be toggled according to your preference using the SDK's configuration.

### Streaming Mode
Streaming mode establishes a continuous connection between your application and the Feature Flags service. 
This allows for real-time updates on feature flags without requiring periodic checks. 
If an error occurs while streaming and `pollingEnabled` is set to `true`,
the SDK will automatically fall back to polling mode until streaming can be reestablished. 
If `pollingEnabled` is `false`, streaming will attempt to reconnect without falling back to polling.

### Polling Mode
In polling mode, the SDK will periodically check with the Feature Flags service to retrieve updates for feature flags. The frequency of these checks can be adjusted using the SDK's configurations.

### No Streaming or Polling
If both streaming and polling modes are disabled (`streamEnabled: false` and `pollingEnabled: false`), 
the SDK will not automatically fetch feature flag updates after the initial fetch. 
This means that after the initial load, any changes made to the feature flags on the Harness server will not be reflected in the application until the SDK is re-initialized or one of the modes is re-enabled.

This configuration might be useful in specific scenarios where you want to ensure a consistent set of feature flags 
for a session or when the application operates in an environment where regular updates are not necessary. However, it's essential to be aware that this configuration can lead to outdated flag evaluations if the flags change on the server.

To configure the modes:

```typescript

const options = {
  streamEnabled: true, // Enable or disable streaming - default is enabled
  pollingEnabled: true, // Enable or disable polling - default is enabled if stream enabled, or disabled if stream disabled.
  pollingInterval: 60000, // Polling interval in ms, default is 60000ms which is the minimum. If set below this, will default to 60000ms.
}

const client = initialize(
  'YOUR_SDK_KEY',
  {
    identifier: 'Harness1',
    attributes: {
      lastUpdated: Date(),
      host: location.href
    }
  },
  options
)
```

## Listening to events from the `client` instance.

```typescript
client.on(Event.READY, flags => {
  // Event happens when connection to server is established
  // flags contains all evaluations against SDK key
})

client.on(Event.FLAGS_LOADED, evaluations => {
  // Event happens when flags are loaded from the server
})

client.on(Event.CACHE_LOADED, evaluations => {
  // Event happens when flags are loaded from the cache
})

client.on(Event.CHANGED, flagInfo => {
  // Event happens when a changed event is pushed
  // flagInfo contains the updated feature flag
})

client.on(Event.DISCONNECTED, () => {
  // Event happens when connection is disconnected
})

client.on(Event.CONNECTED, () => {
  // Event happens when connection has been lost and reestablished 
})

client.on(Event.POLLING, () => {
  // Event happens when polling begins
})

client.on(Event.POLLING_STOPPED, () => {
  // Event happens when polling stops
})

client.on(Event.ERROR, error => {
  // Event happens when connection some error has occurred
})

client.on(Event.ERROR_CACHE, error => {
  // Event happens when an error occurs when accessing the cache
})

client.on(Event.ERROR_AUTH, error => {
  // Event happens when unable to authenticate
})

client.on(Event.ERROR_FETCH_FLAGS, error => {
  // Event happens when unable to fetch flags from the service
})

client.on(Event.ERROR_FETCH_FLAG, error => {
  // Event happens when unable to fetch an individual flag from the service
})

client.on(Event.ERROR_METRICS, error => {
  // Event happens when unable to report metrics back to the service
})

client.on(Event.ERROR_STREAM, error => {
  // Event happens when the stream returns an error
})
```

### Getting value for a particular feature flag

If you would like to know that the default variation was returned when getting the value, for example, if the provided flag identifier wasn't found then pass true for the third argument withDebug:
```typescript
const result = client.variation('Dark_Theme', false, true);
```

When `withDebug` is set to true, the result object will have the following structure:

```typescript
interface VariationValueWithDebug {
  value: any,                 // The actual variation value
  isDefaultValue: boolean     // True if the default variation was returned, false otherwise
}
```

For the example above, if the flag identifier 'Dark_Theme' is not found, result would look like:

```typescript
{
  value: false,
  isDefaultValue: true
}
```

If you do not need to know the default variation was returned: 

```typescript
const variationValue = client.variation('Dark_Theme', false) // second argument is default value when variation does not exist
```

In this case, the result will be a direct value, either from the existing variation or the default value you provided. There won't be an object structure; you'll simply get the value itself.

For the example above:

- If the flag identifier 'Dark_Theme' exists in storage, variationValue would be the stored value for that identifier.
- If the flag identifier 'Dark_Theme' does not exist, variationValue would be the default value provided, in this case, false
### Cleaning up

Remove a listener of an event by `client.off`.

```typescript
client.off(Event.ERROR, error => {
  // Do something when an error occurs
})
```

Remove all listeners:

```typescript
client.off()
```

On closing your application, call `client.close()` to close the event stream.

```typescript
client.close()
```

## Caching

In practice flags rarely change and so it can be useful to cache the last received evaluations from the server to allow
your application to get started as fast as possible. Setting the `cache` option as `true` or as an object (see interface
below) will allow the SDK to store its evaluations to `localStorage` and retrieve at startup. This lets the SDK get
started near instantly and begin serving flags, while it carries on authenticating and fetching up-to-date evaluations
from the server behind the scenes.

```typescript
const client = initialize('00000000-1111-2222-3333-444444444444', {
    identifier: YOUR_TARGET_IDENTIFIER,
    name: YOUR_TARGET_NAME
  }, {
    cache: true // enable caching
  }
)
```

The `cache` option can also be passed as an object with the following options.

```typescript
interface CacheOptions {
  // maximum age of stored cache, in ms, before it is considered stale
  ttl?: number
  // storage mechanism to use, conforming to the Web Storage API standard, can be either synchronous or asynchronous
  // defaults to localStorage
  storage?: AsyncStorage | SyncStorage
}
```

## Set evaluations

In some cases it might be worthwhile providing the SDK with a set of evaluations which it can then serve instantly. You
might want to consider this when you need to:

- **reduce application startup time** by providing default values or a snapshot of evaluations. For example, if your
  application is server-side generated, then it might make sense to retrieve evaluations on the server and provide them
  in the HTML of the page to be injected into the SDK
- **provide network redundancy** by allowing your app to detect network connectivity issues accessing the service and
  loading evaluations from another source

To achieve this you can call the `setEvaluations` method at any time after initializing the client. The
`setEvaluations` method takes an array of `Evaluation` objects as an argument.

```typescript
client.setEvaluations(evals);
```

In which `Evaluation` is defined as:

```typescript
interface Evaluation {
  flag: string // Feature flag identifier
  identifier: string // variation identifier
  value: boolean | string | number | object | undefined // variation value
  kind: string // boolean | json | string | int
  deleted?: boolean // mark that feature flag is deleted
}
```

## Logging
By default, the Javascript Client SDK will log errors and debug messages using the `console` object. In some cases, it
can be useful to instead log to a service or silently fail without logging errors.

```typescript
const myLogger = {
  debug: (...data) => {
    // do something with the logged debug message
  },
  info: (...data) => {
    // do something with the logged info message
  },
  error: (...data) => {
    // do something with the logged error message
  },
  warn: (...data) => {
    // do something with the logged warning message
  }
}

const client = initialize(
  '00000000-1111-2222-3333-444444444444',
  {
    identifier: YOUR_TARGET_IDENTIFIER,
    name: YOUR_TARGET_NAME
  },
  {
    logger: myLogger // override logger
  }
)
```

## Import directly from unpkg

In case you want to import this library directly (without having to use npm or yarn):

```html
<script type="module">
  import { initialize, Event } from 'https://unpkg.com/@harnessio/ff-javascript-client-sdk/dist/sdk.client.js'
</script>
```

If you need to support old browsers which don't support ES Module:

```html
<script src="https://unpkg.com/@harnessio/ff-javascript-client-sdk/dist/sdk.client.js"></script>
<script>
  var initialize = HarnessFFSDK.initialize
  var Event = HarnessFFSDK.Event
</script>
```

## Further reading

[Integrating with webviews on mobile devices](mobile_device_support.md)

## License

Apache version 2.
