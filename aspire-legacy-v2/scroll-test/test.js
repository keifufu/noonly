const faker = require('faker')
const fs = require('fs')

const arr = []

function randomColor() {
	let color = '#';
	for (let i = 0; i < 6; i++) {
		const random = Math.random()
		const bit = (random * 16) | 0
		color += (bit).toString(16)
	}
	return color
}

function randomToken(length) {
	let string = ''
	let charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	for (let i = 0; i < length; i++) {
		string += charset[Math.floor(Math.random() * charset.length)]
	}
	return string
}

for (let i = 0; i < 500; i++) {
	setTimeout(() => {
		arr.push({
			createdAt: Date.now(),
			backgroundColor: randomColor(),
			id: randomToken(24),
			content: faker.lorem.text(5),
			author: ['keifufu', 'THDDDD'][i % 2 === 0 ? 0 : 1]
		})
	}, i * 250)
}

setTimeout(() => {
	fs.writeFileSync('./messages.json', JSON.stringify(arr))
}, 500 * 300)