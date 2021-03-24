import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { initialize, Event } from '@harnessio/ff-javascript-client-sdk'

const App = () => {
  const [featureFlags, setFeatureFlags] = useState({})

  useEffect(() => {
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
