import { createSignal } from 'solid-js'

export type TMail = {
  id: string
  from: string
  subject: string
  previewText: string
}

const [mail, setMail] = createSignal<TMail[]>([])

export function removeMail(id: string) {
  const newMail = mail().filter((m) => m.id !== id)
  setMail(newMail)
}

const MailStore = {
  get: () => mail(),
  set: (mail: TMail[]) => setMail(mail)
}

export default MailStore