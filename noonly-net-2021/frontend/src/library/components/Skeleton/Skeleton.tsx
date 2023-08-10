import React from 'react'
import mergeClassNames from 'library/utilities/mergeClassNames'
import styles from './Skeleton.module.scss'

interface IProps {
	hasLoaded?: boolean
	className?: string
	onClick?: () => void
}

const Skeleton: React.FC<IProps> = ({ children, hasLoaded, className, ...rest }) => {
	const _className = mergeClassNames(styles.root, !hasLoaded && styles.skeleton, className)
	return (
		<div className={_className} {...rest}>
			{children}
		</div>
	)
}

export default Skeleton