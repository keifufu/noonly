const electron = require('electron')
const { app, BrowserWindow } = electron
const path = require('path')
const isDev = require('electron-is-dev')

let installExtension, REACT_DEVELOPER_TOOLS;
if(isDev) {
	const devTools = require('electron-devtools-installer')
	installExtension = devTools.default
	REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS
}

function createWindow() {
	const win = new BrowserWindow({
		width: 900,
		height: 680,
		webPreferences: {
			nodeIntegration: true
		}
	})
	win.loadURL(
		isDev
		? 'http://localhost:3000'
		: `file://${path.join(__dirname, '../build/index.html')}`
	)

	if(isDev) {
		win.webContents.openDevTools({ mode: 'right' })
	}
}

app.whenReady().then(() => {
	createWindow()

	if(isDev) {
		installExtension(REACT_DEVELOPER_TOOLS)
			.then(name => console.log(`Added Extension: ${name}`))
			.catch(error => console.log(`An error occurred: , ${error}`))
	}
})

app.on('window-all-closed', () => {
	if(process.platform === 'darwin') return
	app.quit()
})

app.on('activate', () => {
	if(BrowserWindow.getAllWindows().length > 0) return
	createWindow()
})