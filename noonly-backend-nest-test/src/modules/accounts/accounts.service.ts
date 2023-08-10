import { Account, AccountDocument } from './account.schema'
import { Connection, Model } from 'mongoose'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'

import CreateAccountDto from './dto/createAccount.dto'
import UpdateAccountDto from './dto/updateAccount.dto'

@Injectable()
export class AccountsService {
	constructor(
		@InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
		@InjectConnection() private readonly connection: Connection
	) {}

	public getAllAccounts(userId: string) {
		return this.accountModel.find({ ownerId: userId })
	}

	public async create(ownerId: string, createAccountDto: CreateAccountDto) {
		const newAccount = new this.accountModel({
			...createAccountDto,
			ownerId
		})

		try {
			const savedAccount = await newAccount.save()
			return savedAccount
		} catch (error) {
			throw new InternalServerErrorException(error)
		}
	}

	public async update(userId: string, accountData: UpdateAccountDto) {
		const account = await this.accountModel
			.findOneAndUpdate({ _id: userId }, accountData, { new: true })

		if (!account)
			throw new NotFoundException()

		return account
	}
}