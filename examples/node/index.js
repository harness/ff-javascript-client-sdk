const { initialize, Event } = require('@harnessio/ff-javascript-client-sdk')
// const { initialize, Event } = require('../../dist/sdk.cjs')

const cf = initialize('e09224be-a463-4e6f-825e-325f101cb7b0', {
  identifier: 'Harness'
}, {
  baseUrl: 'http://34.82.119.242/api/1.0',
  debug: true
})

cf.on(Event.READY, flags => {
  console.log('ready', JSON.stringify(flags, null, 2))
})

cf.on(Event.CHANGED, flagInfo => {
  console.log('changed', JSON.stringify(flagInfo, null, 2))
})

setInterval((function() {
}), 10000);