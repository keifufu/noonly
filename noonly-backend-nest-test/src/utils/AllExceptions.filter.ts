import { ArgumentsHost, Catch } from '@nestjs/common'

import { BaseExceptionFilter } from '@nestjs/core'

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
	catch(exception: any, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse()

		if (process.env.NODE_ENV === 'development')
			console.log(response.req.url, exception.status || 500, exception.message || 'Something went wrong')

		let responseMessage = exception.response?.message
		if (Array.isArray(responseMessage))
			[responseMessage] = responseMessage

		response
			.status(exception.status || 500)
			.json({
				status: exception.status || 500,
				success: false,
				error: responseMessage || exception.message || 'Something went wrong'
			})
	}
}