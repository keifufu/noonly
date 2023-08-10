import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import mongoose, { Document } from 'mongoose'
import { Exclude } from 'class-transformer'
import { TimeStamps } from 'src/utils/types/TimeStamps'

@Schema({ collection: 'sessions', timestamps: true, toJSON: { virtuals: true, getters: true } })
export class Session {
	@Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
	userId: mongoose.Schema.Types.ObjectId

	@Prop({ default: 'unknown', maxlength: 256 })
	userAgent: string

	@Prop({ default: 'unknown', maxLength: 256 })
	ipAddress: string

	@Prop({ default: 'unknown', maxlength: 256 })
	location: string

	@Prop({ required: true })
	@Exclude()
	hashedRefreshToken: string

	@Prop({ required: true })
	authenticatedSession: boolean
}

export type SessionDocument = Session & Document & TimeStamps
export const SessionSchema = SchemaFactory.createForClass(Session)