import { Models } from '@rematch/core'
import mail from './mail.model'

export interface RootModel extends Models<RootModel> {
	mail: typeof mail
}

export const models: RootModel = {
	mail
}