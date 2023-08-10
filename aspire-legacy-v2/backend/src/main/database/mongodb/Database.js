import mongoose from 'mongoose'

const dbURI = ''
mongoose.connect(dbURI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then((res) => {
	console.log('Connected to MongoDB')
}).catch((err) => {
	console.err('Failed to connect to MongoDB', err)
})