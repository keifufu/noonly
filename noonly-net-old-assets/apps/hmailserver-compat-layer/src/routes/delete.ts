import { Express } from 'express'
import Joi from 'joi'
import validateBody from '../utils/validateBody'
import winax from 'winax'

const JoiObject = Joi.object({
	address: Joi.string().min(4).max(40).regex(/^[A-Za-z0-9_.]+$/).custom((value, helper) => {
		if (['.', '_'].includes(value[0]))
			return helper.message('"address" must not start with a . or a _' as any)
		if (['.', '_'].includes(value[value.length - 1]))
			return helper.message('"address" must not end with a . or a _' as any)
		return value
	}).required()
})

export default (app: Express) => app.post('/create', (req, res) => {
	const isValidBody = validateBody(req.body, JoiObject)
	if (!isValidBody) {
		res.status(400)
		res.json({ error: 'Invalid Body' })
		return
	}

	const obApp = winax.Object('hMailServer.Application')
	obApp.Authenticate('Administrator', process.env.HMAILSERVER_AUTH)
	// Doesn't exist if authentication failed
	if (!obApp.Domains) {
		res.status(500)
		res.json({ error: 'Failed to authenticate with hMailServer' })
		return
	}

	const obDomain = obApp.Domains.ItemByName('noonly.net')
	const obAccount = obDomain.Accounts.ItemByAddress(req.body.address)

	obDomain.Accounts.DeleteByDBID(obAccount.ID)
})