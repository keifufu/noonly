import { RematchDispatch, RematchRootState, init } from '@rematch/core'
import { RootModel, models } from './models'

import devBuild from 'library/utilities/devBuild'

const store = init({
	redux: {
		devtoolOptions: { disabled: !devBuild }
	},
	models
})

export default store
export type Store = typeof store
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>