import { authenticator } from 'otplib'

export function generateMfaCode(secret: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const code = authenticator.generate(secret)
		resolve(code)
	})
}