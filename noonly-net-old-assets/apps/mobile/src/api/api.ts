import { Actions, createActions } from 'api/actions'
import apisauce, { ApisauceInstance } from 'apisauce'

import devBuild from 'utils/devBuild'

interface ApiType extends ApisauceInstance {
	actions: Actions
}

// TODO: change this
const prodApi = 'https://apidev.noonly.net'
const devApi = 'https://apidev.noonly.net'

const _api = apisauce.create({
	baseURL: devBuild ? devApi : prodApi,
	headers: { }
})

const api: ApiType = {
	..._api,
	actions: createActions(_api)
}

export default api