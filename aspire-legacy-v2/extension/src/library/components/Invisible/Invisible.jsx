function Invisible({ children, className, invisible }) {
	const hidden = typeof invisible === 'function' ? invisible() : invisible

	return (
		<div
			className={className}
			style={{ display: hidden ? 'none' : 'block' }}
		>
			{children}
		</div>
	)
}

export default Invisible