import { Models } from '@rematch/core'
import accounts from './accounts'
import contextMenu from './contextMenu'
import functions from './functions'
import modal from './modal'
import sort from './sort'
import user from './user'

export interface RootModel extends Models<RootModel> {
	accounts: typeof accounts,
	contextMenu: typeof contextMenu,
	functions: typeof functions,
	modal: typeof modal,
	sort: typeof sort,
	user: typeof user
}

export const models: RootModel = {
	accounts,
	contextMenu,
	functions,
	modal,
	sort,
	user
}