import { createSignal, type Component } from 'solid-js'
import Store from '../../shared/state/store'

const VerifyEmail: Component = () => {
  const [input, setInput] = createSignal('')

  return (
    <div>
      <div>We sent a verification code to {Store.user.getUser().email}</div>
      <input value={input()} onChange={(e) => setInput(e.currentTarget.value)} placeholder='enter code' />
      <button onClick={() => Store.user.verifyEmail(input())}>Submit</button>
      <button onClick={Store.user.sendVerificationEmail}>Resend verification email</button>
    </div>
  )
}

export default VerifyEmail