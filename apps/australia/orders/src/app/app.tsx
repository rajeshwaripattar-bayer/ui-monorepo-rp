// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss'

import NxWelcome from './nx-welcome'

import { Route, Routes, Link } from 'react-router-dom'
import './app.module.scss'
import '@gc/shared/assets/channel-theme-overrides.scss'
import type { ReactElement } from 'react'


import { Orders, OrderDetails } from '@gc/features-channel-orders'
import { useAppDispatch, RootState } from '@gc/features-channel-orders'
import { setNotification } from '@gc/redux-store'
//import { Contingency, Snackbar } from '@gc/components'

const App = ({ base: _base }: { base: string }): ReactElement => {
  const dispatch = useAppDispatch()
  return (
    <>
      <Routes>
        <Route path='/' element={<Orders />} />
        <Route path='/:code' element={<OrderDetails />} />
      </Routes>
       {/*<Snackbar handleClose={() => dispatch(setNotification({ open: false, message: '' }))} />
     <Contingency<RootState> codes={['ALL']} types={['dialog', 'loadingModal']} dispatch={dispatch} />*/}
    </>
  )
}



{/*export function App() {
  return (
    <div>

      <h1>Hello Rosh</h1>
     <NxWelcome title='australia-orders' />

      START: routes 
       These routes and navigation have been generated for you 
      Feel free to move and update them to fit your needs 
      <br />
      <hr />
      <br />
      <div role='navigation'>
        <ul>
          <li>
            <Link to='/'>Home</Link>
          </li>
          <li>
            <Link to='/page-2'>Page 2</Link>
          </li>
        </ul>
      </div>
      <Routes>
        <Route
          path='/'
          element={
            <div>
              This is the generated root route. <Link to='/page-2'>Click here for page 2.</Link>
            </div>
          }
        />
        <Route
          path='/page-2'
          element={
            <div>
              <Link to='/'>Click here to go back to root page.</Link>
            </div>
          }
        />
      </Routes>
      {/* END: routes 
    </div> 
  )
}*/}

export default App
