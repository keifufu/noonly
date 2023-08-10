import { Avatar, Text } from 'react-native-paper'
import { Pressable, StyleSheet, View } from 'react-native'
import { ThemeType, useTheme } from 'providers/ThemeProvider'

import React from 'react'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import { useToast } from 'providers/ToastProvider'

dayjs.extend(isToday)

/**
 * If date is from today, display time, eg: 16:54
 * If its from this year, display month and date, eg: Dec 27
 * Otherwise: Display Day/Month/Year, eg: 17/12/21
 */
const formatDate = (date: string) => {
	const _ = dayjs(date)
	const isToday = _.isToday()
	const isThisYear = _.year() === new Date().getFullYear()
	if (isToday)
		return _.format('HH:mm')
	if (isThisYear)
		return _.format('MMM D')
	return _.format('D[/]M[/]YY')
}

interface IMail {
	subject: string,
	from: string,
	previewText: string,
	date: string,
	read: boolean
}

interface IProps {
	mail: IMail
}

const MailRow: React.FC<IProps> = React.memo(({ mail }) => {
	const theme = useTheme()
	const styles = makeStyles(theme, mail)
	const toast = useToast()

	return (
		<Pressable
			onPress={() => {
				toast.show('Hello', { type: 'warning' })
			/* navigation.navigate('View', {
						text: item.previewText
					}) */
			}}
		>
			<View style={styles.root}>
				<Avatar.Text size={48} label={mail.from[0].toUpperCase()} style={styles.avatar} />
				<View style={styles.textWrapper}>
					<View style={styles.fromDateWrapper}>
						<Text style={styles.from} numberOfLines={1}>{mail.from}</Text>
						<Text style={styles.date}>{formatDate(mail.date)}</Text>
					</View>
					<Text style={styles.subject} numberOfLines={1}>{mail.subject}</Text>
					<Text style={styles.previewText} numberOfLines={1}>{mail.previewText}</Text>
				</View>
			</View>
		</Pressable>
	)
})

const makeStyles = (theme: ThemeType, mail: IMail) => StyleSheet.create({
	root: {
		backgroundColor: theme.colors['gray-800'],
		flexDirection: 'row',
		padding: 10,
		paddingRight: 15
	},
	fromDateWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	textWrapper: {
		flexDirection: 'column',
		flex: 1
	},
	avatar: {
		marginRight: 15
	},
	from: {
		fontSize: 16,
		fontWeight: mail.read ? 'normal' : 'bold',
		color: mail.read ? theme.colors['whiteAlpha-700'] : theme.colors.white
	},
	date: {
		fontSize: 12,
		fontWeight: mail.read ? 'normal' : 'bold',
		color: mail.read ? theme.colors['whiteAlpha-700'] : theme.colors.white
	},
	subject: {
		fontWeight: mail.read ? 'normal' : 'bold',
		color: mail.read ? theme.colors['whiteAlpha-700'] : theme.colors.white
	},
	previewText: {
		color: theme.colors['whiteAlpha-700']
	}
})

export default MailRow