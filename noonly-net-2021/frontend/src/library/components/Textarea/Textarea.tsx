import React from 'react'
import mergeClassNames from 'library/utilities/mergeClassNames'
import styles from './Textarea.module.scss'

type TextAreaProps = React.HTMLProps<HTMLTextAreaElement>

interface IProps extends TextAreaProps {
	isInvalid?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, IProps>(({ isInvalid, className, ...args }, ref) => {
	const _className = mergeClassNames(styles.textarea, isInvalid ? styles.invalid : '', className)
	return (
		<textarea className={_className} ref={ref} {...args}>

		</textarea>
	)
})

export default Textarea