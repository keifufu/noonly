interface arg {
	operator: string,
	key: string,
	value: string
}

const filterByQuery = <Type>(items: Type[], query: string, exclude?: string[]): Type[] => {
	const args = []
	const qArgs = query.toLowerCase().match(/[^\s"']+|"([^"]*)"/gmi)

	if (!qArgs)
		return items

	let lastOneWasBad = false
	for (let i = 0; i < qArgs.length; i++) {
		const qArg = qArgs[i]
		if (lastOneWasBad) {
			lastOneWasBad = false
		} else if (['>=', '>', '<=', '<', '==', '='].includes(qArg[qArg.length - 1])) {
			lastOneWasBad = true
			args.push(`${qArg}${qArgs[i + 1]}`.split('"').join(''))
		} else {
			args.push(qArg)
		}
	}
	if (args.length === 0)
		return items

	const allArgs: arg[] = []
	args.forEach((arg) => {
		const pushArg = (operator: string) => {
			const splitArg = arg.split(operator)
			allArgs.push({
				operator,
				key: splitArg[0],
				value: splitArg[1]
			})
		}
		if (arg.includes('>=')) {
			pushArg('>=')
		} else if (arg.includes('>')) {
			pushArg('>')
		} else if (arg.includes('<=')) {
			pushArg('<=')
		} else if (arg.includes('<')) {
			pushArg('<')
		} else if (arg.includes('==')) {
			pushArg('==')
		} else if (arg.includes('=')) {
			pushArg('=')
		} else {
			allArgs.push({
				operator: 'ALL',
				key: '',
				value: arg
			})
		}
	})

	const filteredItems = items.filter((item: any) => {
		let anyFailed = false
		allArgs.forEach((arg) => {
			if (arg.operator === 'ALL') {
				let foundAny = false
				Object.keys(item).forEach((key) => {
					const val = item[key]
					if (exclude?.includes(key)) return
					if (typeof val === 'string') {
						if (val.toLowerCase().includes(arg.value))
							foundAny = true
					} else if (val === arg.value || val === parseInt(arg.value)) {
						foundAny = true
					}
				})
				if (!foundAny)
					anyFailed = true
			} else if (arg.operator === '>') {
				if (typeof item[arg.key] !== 'number') {
					anyFailed = true
					return
				}
				if (!(item[arg.key] > parseInt(arg.value)))
					anyFailed = true
			} else if (arg.operator === '>=') {
				if (typeof item[arg.key] !== 'number') {
					anyFailed = true
					return
				}
				if (!(item[arg.key] >= parseInt(arg.value)))
					anyFailed = true
			} else if (arg.operator === '<') {
				if (typeof item[arg.key] !== 'number') {
					anyFailed = true
					return
				}
				if (!(item[arg.key] < parseInt(arg.value)))
					anyFailed = true
			} else if (arg.operator === '<=') {
				if (typeof item[arg.key] !== 'number') {
					anyFailed = true
					return
				}
				if (!(item[arg.key] <= parseInt(arg.value)))
					anyFailed = true
			} else if (arg.operator === '==') {
				if (item[arg.key] !== arg.value)
					anyFailed = true
			} else if (arg.operator === '=') {
				if (typeof item[arg.key] === 'string') {
					if (!item[arg.key].toLowerCase().includes(arg.value))
						anyFailed = true
				} else if (item[arg.key] !== arg.value) {
					anyFailed = true
				}
			}
		})

		return !anyFailed
	})

	return filteredItems
}

export default filterByQuery