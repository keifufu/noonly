import mongoose from 'mongoose'
const { Schema } = mongoose

const messageSchema = new Schema({
	content: {
		type: String,
		required: true
	},
	pinned: {
		type: Boolean,
		required: true
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'Author',
		required: true
	},
	attachments: {
		type: [{
			name: {
				type: String,
				required: true
			},
			size: {
				type: Number,
				required: true
			}
		}]
	}
}, {
	timestamps: true
})

const Message = mongoose.model('Messages', messageSchema)
export default Message