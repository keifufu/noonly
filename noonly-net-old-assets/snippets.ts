/**
 * Omits keys from an object
 */
interface IOmit {
	<T extends object, K extends [...(keyof T)[]]>
	(obj: T, ...keys: K): {
			[K2 in Exclude<keyof T, K[number]>]: T[K2]
	}
}

const omit: IOmit = (obj, ...keys) => {
	const ret = {} as {
		[K in keyof typeof obj]: (typeof obj)[K]
	}
	let key: keyof typeof obj;
	for (key in obj) {
		if (!keys.includes(key)) {
			ret[key] = obj[key]
		}
	}
	return ret;
}

/**
 * Picks keys from an object
 */
interface IPick {
	<T extends object, K extends keyof T>
	(obj: T, ...keys: K[]): Pick<T, K>
}

const pick: IPick = (obj, ...keys) => {
	const ret = {} as {
		[K in keyof typeof obj]: (typeof obj)[K]
	}
	let key: keyof typeof keys;
	for (key in keys) {
		ret[key] = obj[key]
	}
	return ret;
}