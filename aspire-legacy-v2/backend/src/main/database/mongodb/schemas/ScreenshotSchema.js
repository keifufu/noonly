import mongoose from 'mongoose'
const { Schema } = mongoose

const screenshotSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		required: true
	},
	name: {
		type: String,
		required: true,
		trim: true
	},
	type: {
		type: String,
		required: true,
		trim: true
	},
	size: {
		type: Number,
		required: true
	},
	favorite: {
		type: Boolean,
		default: false
	},
	trash: {
		type: Boolean,
		default: false
	}
}, {
	timestamps: true
})

const Screenshot = mongoose.model('Screenshots', screenshotSchema)
export default Screenshot