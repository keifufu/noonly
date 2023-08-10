import AddressModel, { AddressClass, AddressDocument } from '../models/Address.model'

import { ReturnModelType } from '@typegoose/typegoose'
import mongoose from 'mongoose'

class AddressService {
	// eslint-disable-next-line no-useless-constructor
	constructor(
		private readonly addressModel: ReturnModelType<typeof AddressClass> = AddressModel
	// eslint-disable-next-line no-empty-function
	) { }

	toClient(address: AddressDocument): Noonly.API.Data.UserAddress {
		const clientAddress: any = address.toObject()
		clientAddress.id = String(clientAddress._id)
		delete clientAddress._id
		delete clientAddress.owner
		delete clientAddress.addressLowercase
		return clientAddress
	}

	async findById(ownerId: string, id: string): Promise<AddressDocument | null> {
		return await this.addressModel.findOne({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id })
	}

	async findByAddress(address: string): Promise<AddressDocument | null> {
		return await this.addressModel.findOne({ addressLowercase: address.toLowerCase() })
	}

	async create(address: string, name: string, order: number, ownerId?: string): Promise<AddressDocument> {
		const newAddress = new this.addressModel({
			ownerId,
			address,
			addressLowercase: address.toLowerCase(),
			name,
			order
		})
		return await newAddress.save()
	}

	async assignOwner(id: string, ownerId: string): Promise<void> {
		await this.addressModel.updateOne({ _id: id }, { ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId })
	}

	async editName(ownerId: string, id: string, name: string): Promise<AddressDocument | null> {
		return await this.addressModel.findOneAndUpdate({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id },
			{ name },
			{ new: true })
	}

	async delete(ownerId: string, id: string): Promise<AddressDocument | null> {
		return await this.addressModel.findOneAndDelete({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id })
	}

	async update(ownerId: string, id: string, order: number, visible: boolean): Promise<AddressDocument | null> {
		return await this.addressModel.findOneAndUpdate({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId, _id: id },
			{
				order,
				visible
			},
			{ new: true })
	}

	async findByUserId(ownerId: string): Promise<AddressDocument[]> {
		return await this.addressModel.find({ ownerId: ownerId as unknown as mongoose.Schema.Types.ObjectId })
	}
}

const addressService = new AddressService()

export default addressService