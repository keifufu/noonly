export {}

declare global {
	namespace Noonly {
		interface Session {
			authenticatedSession: boolean,
			location: string,
			ipAddress: string,
			userAgent: string,
			createdAt: string,
			updatedAt: string,
			id: string
		}
		interface User {
			isGAuthEnabled: boolean
			isPhoneNumberConfirmed: boolean
			usePhoneNumberFor2FA: boolean
			phoneNumber: string | null
			username: string
			createdAt: string
			updatedAt: string
			id: string,
			sessions: Session[],
			isSecondaryEmailVerified: boolean,
			secondaryEmail: string | null,
			currentSessionId: string
		}
	}
}