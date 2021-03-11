import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { initialize, Event } from '@harnessio/ff-javascript-client-sdk'

const App = () => {
  const [featureFlags, setFeatureFlags] = useState({})

  useEffect(() => {
    const cf = initialize(
      'e09224be-a463-4e6f-825e-325f101cb7b0',
      {
        identifier: 'Harness'
      },
      {
        baseUrl: 'http://34.82.119.242/api/1.0',
        debug: true
      }
    )

    cf.on(Event.READY, flags => {
      setFeatureFlags(flags)
    })

    cf.on(Event.CHANGED, flagInfo => {
      if (flagInfo.deleted) {
        setFeatureFlags(currentFeatureFlags => {
          delete currentFeatureFlags[flagInfo.flag]
          return { ...currentFeatureFlags }
        })
      } else {
        setFeatureFlags(currentFeatureFlags => ({ ...currentFeatureFlags, [flagInfo.flag]: flagInfo.value }))
      }
    })
  }, [])

  return <pre>{JSON.stringify(featureFlags, null, 2)}</pre>
}

ReactDOM.render(<App />, document.getElementById('root'))
