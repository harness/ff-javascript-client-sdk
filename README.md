# Harness CF Client SDK for JavaScript

Basic library for integrating CF into javascript applications.

## Install

```
yarn install https://github.com/wings-software/js-client-sdk
```

## Usage

Import installed library:
```
import * as CF from "js-client-sdk";
```

Initialize SDK with api key and target
```
const cf = CF.initialize("2c2a12a1-6599-406e-96c4-031a51c8a51b", "replace with your target", {
  streamEnabled: true,
});
```

and customize it with configuration options:
```
export const defaultConfiguration: Options = {
  baseUrl: 'http://localhost:3000/api/1.0',
  streamEnabled: false,
  allAttributesPrivate: false,
  privateAttributeNames: [],
};
```

attach on connect listener:
```
cf.on("connected", () => {
    setConnected(true); // your custom function
});
```
attach on disconnect listener:
```
cf.on("disconnected", () => {
    setConnected(false); // your custom function
});
```

attach on reconnect listener:
```
cf.on("reconnected", () => {
    setConnected(true); // your custom function
});
```

attach on update listener:
```
cf.eventBus.on("changed", ({detail}) => {
    setFlag(detail); // your custom function
})
```

attach on error listener:
```
cf.eventBus.on("error", ({detail}) => {
    setFlag(detail); // your custom function
})
```

or evaluate flag with concrete function call:
```
const value = await cf.variation("bool-flag2", false);

OR 

cf.variation("bool-flag2", false).then(value => {
  // ...
})
```

on closing your application always close the client:
```
cf.close();
```