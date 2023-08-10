import { createSignal, type Component } from 'solid-js'
import Store from '../../shared/state/store'

const VerifyMfa: Component = () => {
  const [input, setInput] = createSignal('')

  return (
    <div>
      <div>We sent a authentication code to {Store.user.getUser().email}</div>
      <input value={input()} onChange={(e) => setInput(e.currentTarget.value)} placeholder='enter code' />
      <button onClick={() => Store.user.authenticateWithMfa(input())}>Submit</button>
      <button onClick={Store.user.sendMfaEmail}>Resend authentication email</button>
    </div>
  )
}

export default VerifyMfa