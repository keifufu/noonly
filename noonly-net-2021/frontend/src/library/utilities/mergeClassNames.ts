
/**
 * Example: mergeClassNames(styles.root, { [styles.shadow]: showClass })
 */
const mergeClassNames = (...args: any[]): string => {
	let className = ''

	const add = (_className: string) => {
		if (className.length === 0)
			className += _className
		else
			className += ` ${_className}`
	}

	args.forEach((arg) => {
		if (!arg) return
		if (typeof arg === 'object') {
			Object.keys(arg).forEach((key) => {
				if (arg[key])
					add(key)
			})
		} else {
			add(arg)
		}
	})

	return className
}

export default mergeClassNames