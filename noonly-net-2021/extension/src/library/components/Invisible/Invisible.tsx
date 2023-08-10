import { memo } from 'react'

interface IProps {
	children: JSX.Element | JSX.Element[],
	invisible?: boolean | (() => boolean),
	visible?: boolean | (() => boolean)
}

const Invisible: React.FC<IProps> = memo(({ children, invisible, visible }): JSX.Element => {
	const isVisible = typeof visible === 'function' ? visible() : visible
	const isInvisible = typeof invisible === 'function' ? invisible() : invisible
	const hidden = typeof isVisible === 'boolean' ? !isVisible : typeof isInvisible === 'boolean' ? isInvisible : false

	if (hidden) return <></>
	else return <>{children}</>
})

export default Invisible