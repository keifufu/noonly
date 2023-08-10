import { Body, CACHE_MANAGER, Controller, Get, Inject, Param, Patch, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common'

import { Account } from './account.schema'
import { AccountsService } from './accounts.service'
import { Cache } from 'cache-manager'
import CreateAccountDto from './dto/createAccount.dto'
import MongooseClassSerializerInterceptor from 'src/utils/MongooseClassSerializer.interceptor'
import ParamsWithId from 'src/utils/paramsWithId'
import RequestWithUser from '../authentication/requestWithUser.interface'
import UpdateAccountDto from './dto/updateAccount.dto'
import JwtTwoFactorGuard from '../authentication/jwt-two-factor.guard'

@Controller('accounts')
export class AccountsController {
	constructor(
		private readonly accountsService: AccountsService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache
	) {}

	@UseGuards(JwtTwoFactorGuard)
	@Get()
	async getAccounts(@Req() request: RequestWithUser) {
		const cachedAccounts = await this.cacheManager.get(`accounts-${request.user.id}`)
		if (cachedAccounts) return cachedAccounts

		const accounts = await this.accountsService.getAllAccounts(request.user.id)
		await this.cacheManager.set(`accounts-${request.user.id}`, accounts)
		return accounts
	}

	@UseGuards(JwtTwoFactorGuard)
	@UseInterceptors(MongooseClassSerializerInterceptor(Account))
	@Post('create')
	async createAccount(
		@Body() createAccountDto: CreateAccountDto,
		@Req() request: RequestWithUser
	) {
		await this.cacheManager.del(`accounts-${request.user.id}`)
		return this.accountsService.create(request.user.id, createAccountDto)
	}

	@UseGuards(JwtTwoFactorGuard)
	@Patch(':id')
	async updateAccount(
		@Param() { id }: ParamsWithId,
		@Body() account: UpdateAccountDto,
		@Req() request: RequestWithUser
	) {
		await this.cacheManager.del(`accounts-${request.user.id}`)
		return this.accountsService.update(id, account)
	}
}