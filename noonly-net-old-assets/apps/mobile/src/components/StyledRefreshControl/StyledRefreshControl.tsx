import React, { forwardRef } from 'react'

import { RefreshControl } from 'react-native'
import { useTheme } from 'providers/ThemeProvider'

interface IProps {
	refreshing: boolean,
	onRefresh: () => void
}

const StyledRefreshControl = forwardRef<RefreshControl, IProps>(({ refreshing, onRefresh, ...rest }, ref) => {
	const theme = useTheme()
	return (
		<RefreshControl
			progressBackgroundColor={theme.isDark ? theme.paper.colors.surface : theme.colors.white}
			colors={theme.isDark ? [theme.colors.white] : [theme.colors.black]}
			refreshing={refreshing}
			onRefresh={onRefresh}
			ref={ref}
			{...rest}
		/>
	)
})

export default StyledRefreshControl