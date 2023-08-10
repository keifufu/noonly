function scorePassword(pass) {
	let score = 0
	if (!pass)
		return score

	const letters = {}
	for (let i = 0; i < pass.length; i++) {
		letters[pass[i]] = (letters[pass[i]] || 0) + 1
		score += 5.0 / letters[pass[i]]
	}

	const variations = {
		digits: (/\d/).test(pass),
		lower: (/[a-z]/).test(pass),
		upper: (/[A-Z]/).test(pass),
		nonWords: (/\W/).test(pass)
	}

	let variationCount = 0
	for (const check in variations)
		variationCount += (variations[check] === true) ? 1 : 0
	score += (variationCount - 1) * 10

	const _ = parseInt(score)
	const result = _ > 80 ? 4 : _ > 60 ? 3 : _ > 40 ? 2 : _ > 20 ? 1 : 0
	return result
}

export default scorePassword