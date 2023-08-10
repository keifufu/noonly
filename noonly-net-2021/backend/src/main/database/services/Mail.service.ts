import MailModel, { MailClass, MailDocument } from '../models/Mail.model'

import { ReturnModelType } from '@typegoose/typegoose'
import mongoose from 'mongoose'

interface MailCreateAction {
	ownerId: string,
	subject: string,
	previewText: string,
	sentToAddressId?: string,
	from: string,
	to: string,
	inReplyTo?: string,
	dateReceived: Date,
	dateSent: Date,
	messageId: string
}

class MailService {
	// eslint-disable-next-line no-useless-constructor
	constructor(
		private readonly mailModel: ReturnModelType<typeof MailClass> = MailModel
	// eslint-disable-next-line no-empty-function
	) { }

	toClient(address: MailDocument): Noonly.API.Data.Mail {
		const clientMail: any = address.toObject()
		clientMail.id = String(clientMail._id)
		delete clientMail._id
		return clientMail
	}

	async findById(ownerId: string, id: string): Promise<MailDocument | null> {
		return await this.mailModel.findOne({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id })
	}

	async findTrash(ownerId: string, addressId: string): Promise<MailDocument[]> {
		return await this.mailModel.find({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, sentToAddressId: addressId as unknown as mongoose.Schema.Types.ObjectId, trash: true })
	}

	async findOneAndDelete(ownerId: string, id: string): Promise<MailDocument | null> {
		return await this.mailModel.findOneAndDelete({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id })
	}

	async findReplies(ownerId: string, messageId: string): Promise<MailDocument[]> {
		return await this.mailModel.find({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, inReplyTo: messageId })
	}

	async findUnread(addressId: string): Promise<MailDocument[]> {
		return await this.mailModel.find({ sentToAddressId: addressId as unknown as mongoose.Schema.Types.ObjectId, read: false, trash: false, archived: false })
	}

	async findByAddress(ownerId: string, addressId: string): Promise<MailDocument[]> {
		return await this.mailModel.find({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, sentToAddressId: addressId as unknown as mongoose.Schema.Types.ObjectId })
	}

	async findByOwnerId(ownerId: string): Promise<MailDocument[]> {
		return await this.mailModel.find({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId })
	}

	async findByMessageId(ownerId: string, messageId: string): Promise<MailDocument | null> {
		return await this.mailModel.findOne({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, messageId })
	}

	async editArchived(ownerId: string, id: string, archived: boolean): Promise<MailDocument | null> {
		return await this.mailModel.findOneAndUpdate({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id },
			{ archived },
			{ new: true })
	}

	async editRead(ownerId: string, id: string, read: boolean): Promise<MailDocument | null> {
		return await this.mailModel.findOneAndUpdate({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id },
			{ read },
			{ new: true })
	}

	async editTrash(ownerId: string, id: string, trash: boolean): Promise<MailDocument | null> {
		return await this.mailModel.findOneAndUpdate({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id },
			{ trash },
			{ new: true })
	}

	async create({ ownerId, subject, previewText, sentToAddressId, from, to, inReplyTo, dateReceived, dateSent, messageId }: MailCreateAction): Promise<MailDocument> {
		const mail = new this.mailModel({
			ownerId,
			subject,
			previewText,
			sentToAddressId,
			from,
			to,
			inReplyTo,
			dateReceived,
			dateSent,
			messageId
		})
		return await mail.save()
	}
}

const mailService = new MailService()

export default mailService