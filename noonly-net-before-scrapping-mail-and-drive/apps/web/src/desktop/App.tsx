import { useRoutes } from '@solidjs/router'
import type { Component } from 'solid-js'
import Store from '../shared/state/store'
import routes from './routes'
import ToastContainer from './Toasts'

const DesktopApp: Component = () => {
  const Routes = useRoutes(routes)

  const onClick = () => {
    Store.toast.add({
      message: 'Hello World',
      type: 'success'
    })
  }

  return (<>
    <div class='min-h-screen w-full bg-slate-700 text-white overflow-hidden'>
      <ToastContainer />
      <Routes />
      <button onClick={onClick}>add</button>
    </div>
  </>)
}

export default DesktopApp