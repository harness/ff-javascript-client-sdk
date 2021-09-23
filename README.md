# Before you Begin
Harness Feature Flags (FF) is a feature management solution that enables users to change the software’s functionality, without deploying new code. FF uses feature flags to hide code or behaviours without having to ship new versions of the software. A feature flag is like a powerful if statement.

For more information, see https://harness.io/products/feature-flags/

To read more, see https://ngdocs.harness.io/category/vjolt35atg-feature-flags

To sign up, https://app.harness.io/auth/#/signup/


# Harness Feature Flags Client SDK for JavaScript

Library for integrating Harness Feature Flags into JavaScript UI applications.

## Install

```sh
npm i @harnessio/ff-javascript-client-sdk
```

or

```sh
yarn add @harnessio/ff-javascript-client-sdk
```

## Usage

```ts
import { initialize, Event } from '@harnessio/ff-javascript-client-sdk'
```

Initialize SDK with api key and target information.

```ts
initialize(FeatureFlagSDKKey: string, target: Target, options?: Options)
```

In which `Target` and `Options` are defined as:

```ts
interface Target {
  identifier: string
  name?: string
  anonymous?: boolean
  attributes?: object
}

interface Options {
  baseUrl?: string
  debug?: boolean
}
```

For example:

```ts
const cf = initialize('00000000-1111-2222-3333-444444444444', {
    identifier: YOUR-TARGET-IDENTIFIER,      // Target identifier
    name: YOUR-TARGET-NAME,                  // Optional target name
    attributes: {                            // Optional target attributes
      email: 'sample@sample.com'
    }
  });
```

### Listening to events from the `cf` instance.

```ts
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

cf.on(Event.ERROR, error => {
  // Event happens when connection some error has occurred
})
```

### Getting value for a particular feature flag

```ts
const value = cf.variation('Dark_Theme', false) // second argument is default value when variation does not exist
```

### Cleaning up

Remove a listener of an event by `cf.off`.

```ts
cf.off(Event.ERROR, error => {
  // Do something when an error occurs
})
```

Remove all listeners:

```ts
cf.off()
```

On closing your application, call `cf.close()` to close the event stream.

```ts
cf.close();
```

## Import directly from unpkg

In case you want to import this library directly (without having to use npm or yarn):

```html
<script type="module">
  import { initialize, Event } from 'https://unpkg.com/@harnessio/ff-javascript-client-sdk@1.4.4/dist/sdk.client.js'
</script>
```

If you need to support old browsers which don't support ES Module:

```html
<script src="https://unpkg.com/@harnessio/ff-javascript-client-sdk@1.4.4/dist/sdk.client.js"></script>
<script>
  var initialize = HarnessFFSDK.initialize
  var Event = HarnessFFSDK.Event
</script>
```

Remember to change the version `1.4.4` in the unpkg url accordingly.

## License

Apache version 2.
