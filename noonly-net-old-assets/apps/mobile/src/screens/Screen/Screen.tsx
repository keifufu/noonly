import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Screen: React.FC = React.memo(({ children }) => (
	<SafeAreaView style={{ flex: 1 }}>
		{children}
	</SafeAreaView>
))

export default Screen