import AccountModel, { AccountClass, AccountDocument } from '../models/Account.model'

import { ReturnModelType } from '@typegoose/typegoose'
import mongoose from 'mongoose'

class AccountService {
	// eslint-disable-next-line no-useless-constructor
	constructor(
		private readonly accountModel: ReturnModelType<typeof AccountClass> = AccountModel
	// eslint-disable-next-line no-empty-function
	) { }

	toClient(account: AccountDocument): Noonly.API.Data.Account {
		const clientAccount: any = account.toObject()
		clientAccount.id = String(clientAccount._id)
		delete clientAccount._id
		delete clientAccount.owner
		return clientAccount
	}

	async findById(id: string): Promise<AccountDocument | null> {
		return await this.accountModel.findOne({ _id: id })
	}

	async findByOwnerId(ownerId: string): Promise<AccountDocument[]> {
		return await this.accountModel.find({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId })
	}

	async findTrash(ownerId: string): Promise<AccountDocument[]> {
		return await this.accountModel.find({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, trash: true })
	}

	async clearTrash(ownerId: string): Promise<{ ok?: number, n?: number } & { deletedCount?: number }> {
		return await this.accountModel.deleteMany({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, trash: true })
	}

	async createAccount(ownerId: string, site: string, username: string, address: string, password: string): Promise<AccountDocument> {
		const account = new this.accountModel({
			ownerId,
			site,
			username,
			address,
			password
		})
		return await account.save()
	}

	async delete(ownerId: string, id: string): Promise<AccountDocument | null> {
		return await this.accountModel.findOneAndDelete({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id })
	}

	async edit(ownerId: string, id: string, site: string, username: string, address: string, password: string): Promise<AccountDocument | null> {
		return await this.accountModel.findOneAndUpdate({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id }, {
			site,
			username,
			address,
			password
		}, { new: true })
	}

	async editIcon(ownerId: string, id: string, icon: string | null): Promise<AccountDocument | null> {
		return await this.accountModel.findOneAndUpdate({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id },
			{ icon: icon ? icon : undefined },
			{ new: true })
	}

	async editNote(ownerId: string, id: string, note: string): Promise<AccountDocument | null> {
		return await this.accountModel.findOneAndUpdate({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id }, { note }, { new: true })
	}

	async editTrash(ownerId: string, id: string, trash: boolean): Promise<AccountDocument | null> {
		return await this.accountModel.findOneAndUpdate({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id }, { trash }, { new: true })
	}

	async deleteIcon(icon: string): Promise<void> {
		await this.accountModel.updateMany({ icon }, { icon: undefined })
	}

	async setMfaSecret(ownerId: string, id: string, mfaSecret: string | null): Promise<AccountDocument | null> {
		return await this.accountModel.findOneAndUpdate({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id }, { mfaSecret }, { new: true })
	}
}

const accountService = new AccountService()

export default accountService