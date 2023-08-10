import makeAddSecondaryEmail, { AddSecondaryEmailBody } from './addSecondaryEmail'
import makeAuthenticateWithBackupCode, { AuthenticateWithBackupCodeBody } from './authenticateWithBackupCode'
import makeAuthenticateWithEmail, { AuthenticateWithEmailBody } from './authenticateWithEmail'
import makeAuthenticateWithGAuth, { AuthenticateWithGAuthBody } from './authenticateWithGAuth'
import makeAuthenticateWithSms, { AuthenticateWithSmsBody } from './authenticateWithSms'
import makeDeleteSession, { DeleteSessionBody } from './deleteSession'
import makeDisableGAuth, { DisableGAuthBody } from './disableGAuth'
import makeDisableSmsAuth, { DisableSmsAuthBody } from './disableSmsAuth'
import makeEnableGAuth, { EnableGAuthBody } from './enableGAuth'
import makeEnableSmsAuth, { EnableSmsAuthBody } from './enableSmsAuth'
import makeGenerateNewBackupCodes, { GenerateNewBackupCodesBody, GenerateNewBackupCodesReturnValue } from './generateNewBackupCodes'
import makeLogin, { LoginBody, LoginReturnValue } from './login'
import makeRefresh, { RefreshBody } from './refresh'
import makeRegister, { RegisterBody } from './register'
import makeRemoveSecondaryEmail, { RemoveSecondaryEmailBody } from './removeSecondaryEmail'
import makeRequestBackupCodes, { RequestBackupCodesBody, RequestBackupCodesReturnValue } from './requestBackupCodes'
import makeValidateSmsConfirmationCode, { ValidateSmsConfirmationCodeBody } from './validateSmsConfirmationCode'

import { ApisauceInstance } from 'apisauce'
import makeGenerateGAuthSecret from './generateGAuthSecret'
import makeLogout from './logout'
import makeResendEmailConfirmation from './resendEmailConfirmation'
import makeSendEmailAuthCode from './sendEmailAuthCode'
import makeSendSmsAuthCode from './sendSmsAuthCode'
import makeSendSmsConfirmationCode from './sendSmsConfirmationCode'

export interface Actions {
	refresh: (body?: RefreshBody) => Promise<Noonly.User | null>
	login: (body: LoginBody) => Promise<LoginReturnValue>
	authenticateWithGAuth: (body: AuthenticateWithGAuthBody) => Promise<Noonly.User>
	enableGAuth: (body: EnableGAuthBody) => Promise<void>
	generateGAuthSecret: () => Promise<string>
	disableGAuth: (body: DisableGAuthBody) => Promise<void>
	logout: () => Promise<void>
	addSecondaryEmail: (body: AddSecondaryEmailBody) => Promise<void>
	removeSecondaryEmail: (body: RemoveSecondaryEmailBody) => Promise<void>
	sendSmsConfirmationCode: () => Promise<void>
	validateSmsConfirmationCode: (body: ValidateSmsConfirmationCodeBody) => Promise<void>
	sendEmailAuthCode: () => Promise<void>
	authenticateWithEmail: (body: AuthenticateWithEmailBody) => Promise<Noonly.User>
	deleteSession: (body: DeleteSessionBody) => Promise<void>
	sendSmsAuthCode: () => Promise<void>
	authenticateWithSms: (body: AuthenticateWithSmsBody) => Promise<Noonly.User>
	enableSmsAuth: (body: EnableSmsAuthBody) => Promise<void>
	disableSmsAuth: (body: DisableSmsAuthBody) => Promise<void>
	authenticateWithBackupCode: (body: AuthenticateWithBackupCodeBody) => Promise<Noonly.User>
	requestBackupCodes: (body: RequestBackupCodesBody) => Promise<RequestBackupCodesReturnValue>
	generateNewBackupCodes: (body: GenerateNewBackupCodesBody) => Promise<GenerateNewBackupCodesReturnValue>
	resendEmailConfirmation: () => Promise<void>
	register: (body: RegisterBody) => Promise<Noonly.User>
}

export const createActions = (api: ApisauceInstance): Actions => ({
	refresh: makeRefresh(api),
	login: makeLogin(api),
	authenticateWithGAuth: makeAuthenticateWithGAuth(api),
	enableGAuth: makeEnableGAuth(api),
	generateGAuthSecret: makeGenerateGAuthSecret(api),
	disableGAuth: makeDisableGAuth(api),
	logout: makeLogout(api),
	addSecondaryEmail: makeAddSecondaryEmail(api),
	removeSecondaryEmail: makeRemoveSecondaryEmail(api),
	sendSmsConfirmationCode: makeSendSmsConfirmationCode(api),
	validateSmsConfirmationCode: makeValidateSmsConfirmationCode(api),
	sendEmailAuthCode: makeSendEmailAuthCode(api),
	authenticateWithEmail: makeAuthenticateWithEmail(api),
	deleteSession: makeDeleteSession(api),
	sendSmsAuthCode: makeSendSmsAuthCode(api),
	authenticateWithSms: makeAuthenticateWithSms(api),
	enableSmsAuth: makeEnableSmsAuth(api),
	disableSmsAuth: makeDisableSmsAuth(api),
	authenticateWithBackupCode: makeAuthenticateWithBackupCode(api),
	requestBackupCodes: makeRequestBackupCodes(api),
	generateNewBackupCodes: makeGenerateNewBackupCodes(api),
	resendEmailConfirmation: makeResendEmailConfirmation(api),
	register: makeRegister(api)
})