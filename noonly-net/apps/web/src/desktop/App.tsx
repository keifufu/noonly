import { useRoutes } from '@solidjs/router'
import { Show, type Component } from 'solid-js'
import Store from '../shared/state/store'
import { rtc, useTheme } from '../shared/state/theme'
import ToastContainer from './Toasts'
import routes from './routes'

const DesktopApp: Component = () => {
  const Routes = useRoutes(routes)
  const { colorScheme, setColorScheme } = useTheme()

  return (<>
    <div class={rtc('min-h-screen w-full overflow-hidden bg-[{bg}] text-[{text}]')}>
      <ToastContainer />
      <Show when={Store.user.isLoading()}>
        <div>Loading...</div>
      </Show>
      <Show when={!Store.user.isLoading()}>
        <Routes />
      </Show>
      <button onClick={() => {
        setColorScheme(colorScheme() === 'dark' ? 'light' : 'dark')
      }}>Toggle theme</button>
    </div>
  </>)
}

export default DesktopApp