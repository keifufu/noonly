import React from 'react'
import mergeClassNames from 'library/utilities/mergeClassNames'
import styles from './Divider.module.scss'

interface IProps {
	orientation?: 'horizontal' | 'vertical',
	className?: string
}

const Divider: React.FC<IProps> = ({ orientation = 'horizontal', className }) => {
	const _className = mergeClassNames(styles[orientation], className)
	return (
		<hr className={_className} />
	)
}

export default Divider