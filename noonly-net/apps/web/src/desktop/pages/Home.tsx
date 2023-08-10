import { type Component } from 'solid-js'
import Store from '../../shared/state/store'

const Home: Component = () => (
  <div>
      Hello, {Store.user.getUser().username}
    <button onClick={() => Store.user.logout()}>Logout</button>
  </div>
)

export default Home