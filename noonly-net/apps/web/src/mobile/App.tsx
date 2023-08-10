import { useRoutes } from '@solidjs/router'
import type { Component } from 'solid-js'
import Store from '../shared/state/store'
import Header from './Header'
import Sidebar from './Sidebar'
import ToastContainer from './Toasts'
import routes from './routes'

const MobileApp: Component = () => {
  const Routes = useRoutes(routes)

  const onClick = () => {
    Store.toast.add({
      message: 'Hello World',
      type: 'success'
    })
  }

  return (<>
    <div class='fixed h-[100%] w-full overflow-hidden bg-slate-700 text-white'>
      <ToastContainer />
      <Header />
      <Sidebar />
      <button onClick={onClick}>add toast</button>
      <Routes />
    </div>
  </>)
}

export default MobileApp