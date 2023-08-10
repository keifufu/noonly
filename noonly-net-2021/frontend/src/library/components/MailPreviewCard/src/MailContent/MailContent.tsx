import useIsMobile from 'library/hooks/useIsMobile'
import mergeClassNames from 'library/utilities/mergeClassNames'
import React from 'react'
import MailDate from '../MailDate'
import styles from './MailContent.module.scss'

interface MailContentProps {
	getSenderName: () => string | undefined
	subject: string
	content: string
	date: string
	read: boolean
}

const MailContent: React.FC<MailContentProps> = ({ getSenderName, subject, content, date, read }) => {
	const isMobile = useIsMobile()

	return (<>
		{isMobile ? (
			<div className={styles['root-mobile']}>
				<div className={styles['sender-date-wrapper-mobile']}>
					<div className={mergeClassNames(styles['sender-mobile'], { [styles['sender-mobile-unread']]: !read })}>
						{getSenderName()}
					</div>
					<MailDate date={date} className={mergeClassNames(styles['date-mobile'], { [styles['date-mobile-unread']]: !read })} />
				</div>
				<div className={mergeClassNames(styles['subject-mobile'], { [styles['subject-mobile-unread']]: !read })}>
					{subject}
				</div>
				<div className={styles['content-mobile']}>
					{content === subject ? '' : content}
				</div>
			</div>
		) : (
			<div className={styles.root}>
				<div className={mergeClassNames(styles.sender, { [styles['sender-unread']]: !read })}>
					{getSenderName()}
				</div>
				<div className={mergeClassNames(styles.subject, { [styles['subject-unread']]: !read })}>
					{subject} - {content}
				</div>
				<MailDate date={date} className={mergeClassNames(styles.date, { [styles['date-unread']]: !read })} />
			</div>
		)}
	</>)
}

export default MailContent