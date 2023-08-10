import mongoose from 'mongoose'
const { Schema } = mongoose

const mailSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		required: true
	},
	from: {
		type: String,
		required: true
	},
	to: {
		type: String,
		required: true
	},
	in_reply_to: String,
	read: {
		type: Boolean,
		default: false
	},
	favorite: {
		type: Boolean,
		default: false
	},
	trash: {
		type: Boolean,
		default: false
	},
	archived: {
		type: Boolean,
		default: false
	},
	date: {
		type: Date,
		required: true
	},
	message_id: {
		type: String,
		required: true
	}
})

const Mail = mongoose.model('Mail', mailSchema)
export default Mail