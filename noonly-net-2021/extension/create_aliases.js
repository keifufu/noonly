/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs')

const aliases = [
	[
		'live.com',
		'microsoftonline.com',
		'hotmail.com',
		'outlook.com',
		'microsoft.com',
		'office.com',
		'office365.com'
	],
	[
		'store.steampowered.com',
		'help.steampowered.com',
		'steampowered.com',
		'steamcommunity.com'
	]
]

const output = {}

aliases.forEach((alias) => {
	alias.forEach((domain) => {
		output[domain] = alias
	})
})

fs.writeFileSync('aliases.json', JSON.stringify(output, null, 2))