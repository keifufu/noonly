import { Models } from '@rematch/core'
import accounts from './accounts'
import contextMenu from './contextMenu'
import fileInvites from './fileInvites'
import files from './files'
import functions from './functions'
import initialLoad from './initialLoad'
import mail from './mail'
import modal from './modal'
import overlay from './overlay'
import screenshots from './screenshots'
import selection from './selection'
import sidebar from './sidebar'
import sort from './sort'
import user from './user'

export interface RootModel extends Models<RootModel> {
	accounts: typeof accounts,
	contextMenu: typeof contextMenu,
	fileInvites: typeof fileInvites,
	files: typeof files,
	functions: typeof functions,
	initialLoad: typeof initialLoad,
	mail: typeof mail,
	modal: typeof modal,
	overlay: typeof overlay,
	screenshots: typeof screenshots,
	selection: typeof selection,
	sidebar: typeof sidebar,
	sort: typeof sort,
	user: typeof user
}

export const models: RootModel = {
	accounts,
	contextMenu,
	fileInvites,
	files,
	functions,
	initialLoad,
	mail,
	modal,
	overlay,
	screenshots,
	selection,
	sidebar,
	sort,
	user
}