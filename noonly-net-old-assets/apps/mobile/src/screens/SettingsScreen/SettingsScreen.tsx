import { Button, Card, IconButton, List, Switch, Text } from 'react-native-paper'

import { AppNavigationType } from 'navigators'
import ConfirmPasswordModal from 'modals/ConfirmPasswordModal'
import { ConfirmPasswordModalProps } from 'modals/ConfirmPasswordModal/ConfirmPasswordModal'
import ConfirmationModal from 'modals/ConfirmationModal'
import { ConfirmationModalProps } from 'modals/ConfirmationModal/ConfirmationModal'
import React from 'react'
import { View } from 'react-native'
import api from 'api'
import { useModal } from 'providers/ModalProvider'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from 'providers/ThemeProvider'
import { useToast } from 'providers/ToastProvider'
import { useUser } from 'providers/UserProvider'

const SettingsScreen: React.FC = () => {
	const theme = useTheme()
	const user = useUser()
	const toast = useToast()
	const navigation = useNavigation<AppNavigationType>()
	const modal = useModal()
	const isTwoFAEnabled = user.user.isGAuthEnabled || user.user.isSecondaryEmailVerified || user.user.usePhoneNumberFor2FA
	const [backupCodes, setBackupCodes] = React.useState<string[]>()

	const onRequestBackupCodes = (password: string) => new Promise<void>((resolve, reject) => {
		api.actions.requestBackupCodes({ password }).then((res) => {
			setBackupCodes(res)
			resolve()
		}).catch((error) => {
			toast.show(error, { type: 'error' })
			reject()
		})
	})

	const onGenerateNewBackupCodes = (password: string) => new Promise<void>((resolve, reject) => {
		api.actions.generateNewBackupCodes({ password }).then((res) => {
			setBackupCodes(res)
			resolve()
		}).catch((error) => {
			toast.show(error, { type: 'error' })
			reject()
		})
	})

	const deleteSession = (sessionId: string) => {
		api.actions.deleteSession({ sessionId }).then(() => {
			user.setUser({
				...user.user,
				sessions: user.user.sessions.filter((session) => session.id !== sessionId)
			})
			toast.show('Deleted Session')
		}).catch((error) => {
			toast.show(error, { type: 'error' })
		})
	}

	const onDisableGAuth = (password: string) => new Promise<void>((resolve, reject) => {
		api.actions.disableGAuth({ password }).then(() => {
			user.setUser({
				...user.user,
				isGAuthEnabled: false
			})
			toast.show('Disabled GAuth')
			resolve()
		}).catch((error) => {
			toast.show(error, { type: 'error' })
			reject(error)
		})
	})

	const onRemoveSecondaryEmail = (password: string) => new Promise<void>((resolve, reject) => {
		api.actions.removeSecondaryEmail({ password }).then(() => {
			user.setUser({
				...user.user,
				secondaryEmail: null,
				isSecondaryEmailVerified: false
			})
			toast.show('Removed secondary email')
			resolve()
		}).catch((error) => {
			toast.show(error, { type: 'error' })
			reject()
		})
	})

	const onDisableSmsAuth = (password: string) => new Promise<void>((resolve, reject) => {
		api.actions.disableSmsAuth({ password }).then(() => {
			user.setUser({
				...user.user,
				usePhoneNumberFor2FA: false
			})
			toast.show('Disabled Sms Auth')
			resolve()
		}).catch((error) => {
			toast.show(error, { type: 'error' })
			reject()
		})
	})

	const onEnableSmsAuth = (password: string) => new Promise<void>((resolve, reject) => {
		api.actions.enableSmsAuth({ password }).then(() => {
			user.setUser({
				...user.user,
				usePhoneNumberFor2FA: true
			})
			toast.show('Enabled Sms Auth')
			resolve()
		}).catch((error) => {
			toast.show(error, { type: 'error' })
			reject()
		})
	})

	const onResendEmailConfirmation = () => {
		api.actions.resendEmailConfirmation().then(() => {
			toast.show(`Resent confirmation link to ${user.user.secondaryEmail}`)
		}).catch((error) => {
			toast.show(error, { type: 'error' })
		})
	}

	return (
		<View>
			<Card>
				<Text>Dark Mode</Text>
				<Switch value={theme.isDark} onValueChange={() => theme.setScheme(theme.isDark ? 'light' : 'dark')} />
				<Button
					mode='contained'
					onPress={() => {
						if (user.user.isGAuthEnabled)
							return modal.show<ConfirmPasswordModalProps>(ConfirmPasswordModal, { onSubmit: onDisableGAuth })
						return navigation.navigate('EnableGAuth')
					}}
				>
					{user.user.isGAuthEnabled ? 'Disable' : 'Enable'} GAuth
				</Button>
				{
					user.user.secondaryEmail ? (<>
						<Text>
							Your backup email is {
								user.user.isSecondaryEmailVerified
									? 'verified.'
									: 'not verified. You will not be able to use this email to verify your identity.'
							}
						</Text>
						<Button
							mode='contained'
							onPress={() => modal.show<ConfirmPasswordModalProps>(ConfirmPasswordModal, { onSubmit: onRemoveSecondaryEmail })}
						>
							Remove Backup Email
						</Button>
					</>) : (
						<Button
							mode='contained'
							onPress={() => navigation.navigate('AddSecondaryEmail')}
						>
							Add Backup Email
						</Button>
					)
				}
				{
					(user.user.secondaryEmail && !user.user.isSecondaryEmailVerified) && (
						<Button
							onPress={() => onResendEmailConfirmation()}
						>
							Resend confirmation link
						</Button>
					)
				}
				{
					user.user.usePhoneNumberFor2FA ? (
						<Button
							mode='contained'
							onPress={() => modal.show<ConfirmPasswordModalProps>(ConfirmPasswordModal, { onSubmit: onDisableSmsAuth })}
						>
							Remove SMS Auth
						</Button>
					) : (
						<Button
							mode='contained'
							onPress={() => modal.show<ConfirmPasswordModalProps>(ConfirmPasswordModal, { onSubmit: onEnableSmsAuth })}
						>
							Enable SMS Auth
						</Button>
					)
				}
				{
					(isTwoFAEnabled && !backupCodes) && (
						<Button
							mode='contained'
							onPress={() => modal.show<ConfirmPasswordModalProps>(ConfirmPasswordModal, { onSubmit: onRequestBackupCodes })}
						>
							Show backup codes
						</Button>
					)
				}
				{
					(isTwoFAEnabled && backupCodes) && (<>
						<Card>
							{backupCodes.map((backupCode) => (
								<Text key={backupCode}>{backupCode}</Text>
							))}
						</Card>
						<Button
							onPress={() => {
								modal.show<ConfirmationModalProps>(ConfirmationModal, {
									title: 'Are you sure?',
									text: 'This will invalidate all existing backup codes',
									onConfirm: () => modal.show<ConfirmPasswordModalProps>(ConfirmPasswordModal, { onSubmit: onGenerateNewBackupCodes })
								})
							}}
						>
							Regenerate backup codes
						</Button>
						<Button
							onPress={() => setBackupCodes(undefined)}
						>
							Hide backup codes
						</Button>
					</>)
				}
				<Button
					mode='contained'
					onPress={() => {
						modal.show<ConfirmationModalProps>(ConfirmationModal, { title: 'Logout', text: 'Are you sure you want to continue?', onConfirm: () => user.logout() })
					}}
				>
					Logout
				</Button>
				<List.Section>
					<List.Subheader>Sessions</List.Subheader>
					{user.user.sessions.filter((session) => session.authenticatedSession).map((session) => (
						<List.Item
							key={session.id}
							title={`${session.userAgent}${session.id === user.user.currentSessionId ? ' (Current Session)' : ''}`}
							description={`${session.location} / ${session.ipAddress}`}
							right={(props) => (user.user.currentSessionId === session.id ? null : (
								<IconButton
									icon='delete'
									onPress={() => deleteSession(session.id)}
									{...props}
								/>
							))}
						/>
					))}
				</List.Section>
			</Card>
		</View>
	)
}

export default SettingsScreen