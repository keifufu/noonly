import { combineReducers } from 'redux'
import channelReducer from './channels/reducer'
import callReducer from './call/reducer'
import friendReducer from './friends/reducer'
import cloudReducer from './cloud/reducer'
import inboxReducer from './inbox/reducer'
import genericReducer from './generic/reducer'
import screenshotReducer from './screenshots/reducer'

const rootReducer = combineReducers({
	channels: channelReducer,
	call: callReducer,
	friends: friendReducer,
	cloud: cloudReducer,
	inbox: inboxReducer,
	generic: genericReducer,
	screenshots: screenshotReducer
})

export default rootReducer