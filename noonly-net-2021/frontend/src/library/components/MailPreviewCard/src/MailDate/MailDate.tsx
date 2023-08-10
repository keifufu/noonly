import React from 'react'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import mergeClassNames from 'library/utilities/mergeClassNames'
import styles from './MailDate.module.scss'

dayjs.extend(isToday)

interface MailDateProps {
	date: string
	className?: string
}

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

const MailDate: React.FC<MailDateProps> = ({ date, className }) => (
	<div className={mergeClassNames(styles.root, className)}>
		{formatDate(date)}
	</div>
)

export default MailDate