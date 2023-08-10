import { StyleSheet, View } from 'react-native'

import React from 'react'

const Center: React.FC = ({ children }) => {
	const styles = makeStyles()
	return (
		<View style={styles.root}>
			{children}
		</View>
	)
}

const makeStyles = () => StyleSheet.create({
	root: {
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center'
	}
})

export default Center