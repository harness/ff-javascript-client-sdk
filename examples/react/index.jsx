import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { initialize, Event } from '@harnessio/ff-javascript-client-sdk'

const App = () => {
  const [featureFlags, setFeatureFlags] = useState({})

  useEffect(() => {
    const cf = initialize(
      '50e52f07-ec4b-4b4a-8743-fd5050c31e1c',
      {
        identifier: 'Harness',
        attributes: {
          lastUpdated: Date(),
          host: location.href
        }
      },
      {
        debug: true,
        baseUrl: 'http://35.199.167.179/api/1.0', // QA
        eventUrl: 'http://34.83.236.94/api/1.0'
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

    return () => {
      cf.close()
    }
  }, [])

  return <pre>{JSON.stringify(featureFlags, null, 2)}</pre>
}

ReactDOM.render(<App />, document.getElementById('root'))
