import ScreenshotModel, { ScreenshotClass, ScreenshotDocument } from '../models/Screenshot.model'

import { ReturnModelType } from '@typegoose/typegoose'
import mongoose from 'mongoose'

class ScreenshotService {
	// eslint-disable-next-line no-useless-constructor
	constructor(
		private readonly screenshotModel: ReturnModelType<typeof ScreenshotClass> = ScreenshotModel
	// eslint-disable-next-line no-empty-function
	) { }

	toClient(address: ScreenshotDocument): Noonly.API.Data.Screenshot {
		const clientMail: any = address.toObject()
		clientMail.id = String(clientMail._id)
		delete clientMail._id
		delete clientMail.owner
		return clientMail
	}

	async findTrash(ownerId: string): Promise<ScreenshotDocument[]> {
		return await this.screenshotModel.find({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, trash: true })
	}

	async findByOwnerId(ownerId: string): Promise<ScreenshotDocument[]> {
		return await this.screenshotModel.find({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId })
	}

	async clearTrash(ownerId: string): Promise<{ ok?: number, n?: number } & { deletedCount?: number }> {
		return await this.screenshotModel.deleteMany({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, trash: true })
	}

	async delete(ownerId: string, id: string): Promise<ScreenshotDocument | null> {
		return await this.screenshotModel.findOneAndDelete({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id })
	}

	async editFavorite(ownerId: string, id: string, favorite: boolean): Promise<ScreenshotDocument | null> {
		return await this.screenshotModel.findOneAndUpdate({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id },
			{ favorite },
			{ new: true })
	}

	async editTrash(ownerId: string, id: string, trash: boolean): Promise<ScreenshotDocument | null> {
		return await this.screenshotModel.findOneAndUpdate({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id },
			{ trash },
			{ new: true })
	}

	async create(ownerId: string, name: string, type: string, size: number): Promise<ScreenshotDocument> {
		const screenshot = new this.screenshotModel({ ownerId, name, type, size })
		return await screenshot.save()
	}
}

const screenshotService = new ScreenshotService()

export default screenshotService