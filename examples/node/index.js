const { initialize, Event } = require('@harnessio/ff-javascript-client-sdk')

const cf = initialize(
  'e09224be-a463-4e6f-825e-325f101cb7b0',
  {
    identifier: 'Harness'
  },
  {
    debug: true
  }
)

cf.on(Event.READY, flags => {
  console.log('ready', JSON.stringify(flags, null, 2))
})

cf.on(Event.CHANGED, flagInfo => {
  console.log('changed', JSON.stringify(flagInfo, null, 2))
})

setInterval(function () {}, 10000)
