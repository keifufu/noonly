import UserModel, { UserClass, UserDocument, UserStatus } from '../models/User.model'

import { AddressDocument } from '../models/Address.model'
import { ReturnModelType } from '@typegoose/typegoose'
import { UpdateWriteOpResult } from 'mongoose'
import addressService from './Address.service'
import mailService from './Mail.service'
import randomToken from '@library/utilities/randomToken'

class UserService {
	// eslint-disable-next-line no-useless-constructor
	constructor(
		private readonly userModel: ReturnModelType<typeof UserClass> = UserModel
	// eslint-disable-next-line no-empty-function
	) { }

	toClient(user: UserDocument): Noonly.API.Data.User {
		const clientUser: any = user.toObject()
		clientUser.id = String(clientUser._id)
		delete clientUser._id
		delete clientUser.usernameLowercase
		delete clientUser.password
		return clientUser
	}

	async fetchFullUserById(id: string): Promise<Noonly.API.Data.User | null> {
		const user = await this.userModel.findOne({ _id: id }).populate('addresses')
		if (!user) return null
		const populateAddresses = (addresses: AddressDocument[]): Promise<Noonly.API.Data.UserAddress[]> => new Promise((resolve) => {
			const populated: Noonly.API.Data.UserAddress[] = []
			let processed = 0
			addresses.forEach(async (address) => {
				const unread = await mailService.findUnread(address.id)
				const clientAddress = addressService.toClient(address)
				clientAddress.unread = unread.length
				populated.push(clientAddress)
				processed += 1

				if (processed === addresses.length)
					resolve(populated)
			})
		})

		const addresses = await populateAddresses(user.addresses as AddressDocument[])
		const clientUser = userService.toClient(user)
		clientUser.addresses = addresses

		return clientUser
	}

	async findByLogin(username: string, password: string): Promise<UserDocument | null> {
		return await this.userModel.findOne({ usernameLowercase: username.toLowerCase(), password })
	}

	async findById(id: string): Promise<UserDocument | null> {
		return await this.userModel.findOne({ _id: id })
	}

	async findByUsername(username: string): Promise<UserDocument | null> {
		return await this.userModel.findOne({ usernameLowercase: username.toLowerCase() })
	}

	async findByImageToken(imgToken: string): Promise<UserDocument | null> {
		return await this.userModel.findOne({ imgToken })
	}

	async editStatus(id: string, status: UserStatus): Promise<void> {
		await this.userModel.updateOne({
			_id: id
		}, {
			status
		})
	}

	async create(username: string, password: string, addressId: string): Promise<UserDocument> {
		const user = new this.userModel({
			username,
			usernameLowercase: username.toLowerCase(),
			password,
			imgToken: randomToken(10),
			cloudToken: randomToken(10),
			addresses: [addressId]
		})
		return await user.save()
	}

	async addAddress(id: string, addressId: string): Promise<void> {
		await this.userModel.updateOne({ _id: id }, {
			$push: {
				addresses: addressId
			}
		})
	}

	async removeAddress(id: string, addressId: string): Promise<void> {
		await this.userModel.updateOne({ _id: id }, {
			$pull: {
				addresses: addressId
			}
		})
	}

	async deleteIcon(id: string, icon: string): Promise<UpdateWriteOpResult> {
		return await this.userModel.updateOne({ _id: id }, {
			$pull: {
				icons: icon
			}
		})
	}

	async updateAvatar(id: string, avatar: string): Promise<void> {
		await this.userModel.updateOne({ _id: id }, { avatar }, { new: true })
	}

	async addIcon(id: string, icon: string): Promise<void> {
		await this.userModel.updateOne({ _id: id }, {
			$push: {
				icons: icon
			}
		})
	}
}

const userService = new UserService()

export default userService