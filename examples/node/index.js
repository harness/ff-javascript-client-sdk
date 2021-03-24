const { initialize, Event } = require('@harnessio/ff-javascript-client-sdk')

const cf = initialize(
  '62f97de8-9748-447f-b2b5-8f506166643d',
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
