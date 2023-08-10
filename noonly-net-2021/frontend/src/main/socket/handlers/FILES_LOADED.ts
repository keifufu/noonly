import { InitialLoadTypes } from '@types'
import { Socket } from 'socket.io-client'
import store from 'main/store'

interface FilesLoadedData {
	files: Noonly.State.Files,
	invitedFiles: Noonly.State.FileInvite
}

export default (socket: Socket): Socket => socket.on('FILES_LOADED', (data: FilesLoadedData) => {
	store.dispatch.initialLoad.set({ type: InitialLoadTypes.FILES, value: true })
	store.dispatch.files.set(data.files)
	store.dispatch.fileInvites.set(data.invitedFiles)
})