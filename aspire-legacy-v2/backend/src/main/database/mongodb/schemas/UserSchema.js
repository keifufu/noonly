import mongoose from 'mongoose'
const { Schema } = mongoose

const addressSchema = new Schema({
	address: {
		type: String,
		required: true,
		unique: true,
		minLength: [1, 'Address cannot be shorter than 1 character'],
		maxLength: [40, 'Address cannot be longer than 40 characters'],
		set: (val) => val.split('@')[0],
		get: (val) => `${val}@${process.env.HOSTNAME}`
	},
	order: {
		type: Number,
		required: true,
		unique: true,
		min: 0
	},
	visible: {
		type: Boolean,
		default: true
	}
})

const userSchema = new Schema({
	username: {
		type: String,
		trim: true,
		unique: [true, 'Username already exists'],
		required: [true, 'No Username was specified'],
		maxLength: [24, 'Username cannot be longer than 24 characters'],
		validate: [(val) => {
			if (['noonly'].includes(val)) return false
			return true
		}, 'Invalid username']
	},
	password: {
		type: String,
		trim: true,
		required: [true, 'No Password was specified']
	},
	token: String,
	ss_token: String,
	cloud_token: String,
	addresses: {
		type: [addressSchema],
		required: true
	},
	channels: {
		type: [{ type: Schema.Types.ObjectId, ref: 'Channel' }]
	},
	settings: {
		type: String
		/* Should probably store settings as JSON? */
	}
})

const User = mongoose.model('Users', userSchema)
export default User