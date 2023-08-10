import { ObjectSchema } from 'joi'

const validateBody = (body: any, joiObject: ObjectSchema): boolean => {
	const validation = joiObject.validate(body)

	if (!validation.error)
		return true

	return false
}

export default validateBody