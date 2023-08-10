import { devBuild } from '../Utilities'
import store from '../redux/store'
import io from 'socket.io-client'

// const port = devBuild ? '98' : '97'
const port = '97'
const user = JSON.parse(localStorage.getItem('user'))
const socket = io(`https://aspire.icu:${port}`, { query: `token=${user?.token}` })
socket.onAny((event, payload) => emitEvent(event, payload))
/* Disconnect socket gracefully so that we can keep track of online/offline status */
window.addEventListener('beforeunload', () => socket.disconnect())

const executables = {}
const handler = {
    /**
	 * A Promise that resolves once the socket is connected
     * @returns {Promise}
	 **/
    awaitSocket() {
        const poll = resolve => {
            if(socket.connected) resolve()
            else setTimeout(_ => poll(resolve), 400)
        }
        return new Promise(poll)
    },
    /**
	 * Register a socket handler
     * @param {String} event - Event
	 * @param {Function} func - Function to execute
	 **/
    register(event, func) {
        if(!executables[event]) executables[event] = []
        executables[event].push(func)
    },
    /**
	 * Unregister a socket handler
     * @param {String} event - Event
	 * @param {Function} func - Registered function
	 **/
    unregister(event, func) {
        if(!executables[event]) return
        executables[event].splice(executables[event].indexOf(func), 1)
    },
    /**
	 * Emit an event
     * @param {String} event - Event
	 * @param payload - The data to send with the Event
	 **/
    emit(event, payload) {
        /* Log all emitted events in development */
        if(devBuild) {
            console.log('SOCKET', 'Emitting:', event, payload)
        }
        socket.emit(event, payload)
    },
    /**
	 * Get the Socket ID
     * @returns {String} id - Socket ID
	 **/
    getSocketID() {
        return socket.id
    }
}

function emitEvent(event, payload) {
    /* Log all emitted events in development */
    if(devBuild) {
        console.log('SOCKET', 'Receiving:', event, payload)
    }
    /* Send event to latest registered event handler */
    if(!executables[event] || executables[event].length === 0) return
    executables[event][executables[event].length - 1](payload, handler, store)
}

export default handler