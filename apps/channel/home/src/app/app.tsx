import NxWelcome from './nx-welcome'
import '@gc/shared/assets/channel-theme-overrides.scss'
import type { ReactElement } from 'react'

const App = ({ base }: { base: string }): ReactElement => {
  return <NxWelcome title='channel-home' />
}

export default App
