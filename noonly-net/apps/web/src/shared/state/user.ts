import { createSignal, type Accessor } from 'solid-js'
import apiClient, { isTRPCClientError } from '../../apiClient'
import type { Session, User } from '../../types'
import Store from './store'

const [isLoading, setIsLoading] = createSignal(true)
const [user, setUser] = createSignal<User | null>(null)
const [session, setSession] = createSignal<Session | null>(null);

(async function refresh() {
  try {
    const result = await apiClient.auth.refresh.query()
    setUser(result.user)
    setSession(result.session)
    // jwt.expires = seconds until it expires
    const msUntilRefresh = (result.accessJwt.expires - (result.accessJwt.expires / 5)) * 1000
    setTimeout(refresh, msUntilRefresh)
    setIsLoading(false)
  } catch (cause) {
    setIsLoading(false)
  }
}())

const toastWrapper = async (cb: () => Promise<void>) => {
  try {
    await cb()
  } catch (cause) {
    if (isTRPCClientError(cause))
      Store.toast.add({ message: cause.message, type: 'alert' })
    console.debug('[toastWrapper] ' + cause)
  }
}

const UserStore = {
  isLoading,
  isLoggedIn: () => !isLoading() && user() !== null && session() !== null,
  // Forcing this to be typed as a user as I would only be using it in places where we know we're logged in anyway
  getUser: user as Accessor<User>,
  // ^ Same with session
  getSession: session as Accessor<Session>,
  register: (username: string, email: string, password: string) => toastWrapper(async () => {
    const result = await apiClient.auth.register.query({ username, email, password, encKeyStr_e: 'TODO:' })
    setUser(result.user)
    setSession(result.session)
  }),
  login: (login: string, password: string) => toastWrapper(async () => {
    const result = await apiClient.auth.login.query({ login, password })
    setUser(result.user)
    setSession(result.session)
  }),
  logout: () => toastWrapper(async () => {
    await apiClient.auth.logout.query()
    window.location.reload()
  }),
  verifyEmail: (code: string) => toastWrapper(async () => {
    const result = await apiClient.user.verifyEmail.query({ code })
    setUser(result.user)
  }),
  sendVerificationEmail: () => toastWrapper(async () => {
    await apiClient.user.sendVerificationEmail.query()
  }),
  authenticateWithMfa: (mfaCode: string) => toastWrapper(async () => {
    const result = await apiClient.auth.authenticateWithMfa.query({ mfaCode })
    setUser(result.user)
    setSession(result.session)
  }),
  sendMfaEmail: () => toastWrapper(async () => {
    await apiClient.user.sendMfaEmail.query()
  })
}

export default UserStore