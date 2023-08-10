import mongoose from 'mongoose'
const { Schema } = mongoose

const channelSchema = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		required: true
	},
	name: {
		type: String,
		required: true,
		trim: true,
		maxLength: [128, 'Channel Name can\'t be longer than 128 characters'],
		minLength: [1, 'bruh dude']
		/* No idea what else to check for here */
	},
	type: {
		type: String,
		default: 'DM'
	},
	icon: {
		type: String,
		get: (val) => `https://${process.env.HOSTNAME}/userContent/icons/channel/${val}`
	},
	participants: [{ type: Schema.Types.ObjectId, ref: 'Users' }]
}, {
	timestamps: true
})

const Channel = mongoose.model('Channel', channelSchema)
export default Channel