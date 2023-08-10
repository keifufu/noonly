import mongoose from 'mongoose'
const { Schema } = mongoose

const passwordSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		required: true
	},
	site: {
		type: String,
		required: [true, 'No Site was specified'],
		trim: true
	},
	username: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true
	},
	password: {
		type: String,
		required: [true, 'No Password was specified']
	},
	trash: {
		type: Boolean,
		default: false
	},
	note: String,
	icon: String
}, {
	timestamps: true
})

const Password = mongoose.model('Passwords', passwordSchema)
export default Password