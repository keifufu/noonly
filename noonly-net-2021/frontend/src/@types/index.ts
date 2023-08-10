/* eslint-disable no-unused-vars */

import { RootState } from 'main/store/store'

export enum UserStatus {
	ONLINE = 'Online',
	IDLE = 'Idle',
	DO_NOT_DISTURB = 'Do Not Disturb',
	INVISIBLE = 'Invisible'
}

export enum InitialLoadTypes {
	APP = 'app',
	MAIL = 'mail',
	ACCOUNTS = 'accounts',
	SCREENSHOTS = 'screenshots',
	FILES = 'files'
}

export enum SelectionTypes {
	MAIL = 'mail',
	SCREENSHOTS = 'screenshots',
	FILES = 'files'
}

declare global {
	namespace Noonly {
		namespace Data {
			export interface FileInvite {
				fileId: string,
				name: string,
				isFolder: boolean,
				owner: Noonly.API.Data.FileUser
			}
		}
		namespace State {
			export type Accounts = Noonly.API.Data.Account[]
			export interface ContextMenu {
				cursors: {
					x?: number,
					y?: number
				},
				onClose: (() => void) | null,
				id: number | null,
				data: any
			}
			export interface FileInvite {
				[fileId: string]: Noonly.Data.FileInvite
			}
			export interface Files {
				[id: string]: Noonly.API.Data.File
			}
			export interface Functions {
				onBlockLocationChange: (() => void) | null
			}
			export enum InitialLoadTypes {
				APP = 'app',
				MAIL = 'mail',
				ACCOUNTS = 'accounts',
				SCREENSHOTS = 'screenshots',
				FILES = 'files'
			}
			export interface InitialLoad {
				[InitialLoadTypes.APP]: boolean | 'DISCONNECTED',
				[InitialLoadTypes.MAIL]: boolean,
				[InitialLoadTypes.ACCOUNTS]: boolean,
				[InitialLoadTypes.SCREENSHOTS]: boolean,
				[InitialLoadTypes.FILES]: boolean
			}
			export type Mail = Noonly.API.Data.Mail[]
			export interface ModalSingle {
				open: boolean,
				onClose: () => void,
				data: any
			}
			export interface Modal {
				mostRecentModal: number,
				[open: number]: ModalSingle
			}
			export interface Overlay {
				onClose: (() => void) | null,
				id: null | number,
				data: any
			}
			export type Screenshots = Noonly.API.Data.Screenshot[]
			export enum SelectionTypes {
				MAIL = 'mail',
				SCREENSHOTS = 'screenshots',
				FILES = 'files'
			}
			export interface Selection {
				[SelectionTypes.MAIL]: string[],
				[SelectionTypes.SCREENSHOTS]: string[],
				[SelectionTypes.FILES]: string[]
			}
			export interface Sidebar {
				open: boolean
			}
			export interface SortValue {
				direction: string,
				method: string
			}
			export interface Sort {
				'screenshots': SortValue,
				'accounts': SortValue,
				'cloud': SortValue
			}
			export interface User extends Partial<Noonly.API.Data.User> {
				selectedAddress?: null | string
			}
		}
		namespace Action {
			export type AccountCreate = Noonly.API.Data.Account
			interface SingularAccountDelete {
				id: string,
				ids?: string[]
			}
			interface MultipleAccountDelete {
				id?: string,
				ids: string[]
			}
			export type AccountDelete = SingularAccountDelete | MultipleAccountDelete
			export interface AccountEditTrash {
				id: string,
				trash: boolean
			}
			export interface AccountEditNote {
				id: string,
				note: string
			}
			export interface AccountEditIcon {
				id: string,
				icon: string | null
			}
			export interface AccountDeleteIcon {
				icon: string
			}
      export interface AccountSetMfaSecret {
        id: string
        mfaSecret: string | null
      }
			export interface ContextMenuOpen {
				id: number,
				data?: any,
				e: React.MouseEvent<HTMLDivElement, MouseEvent>
			}
			export type ContextMenuClose = undefined
			export interface FileInviteDelete {
				id: string
			}
			export type FileCreate = Noonly.API.Data.File
			export interface FileDelete {
				ids: string[]
			}
			export interface FileRename {
				id: string,
				name: string
			}
			export interface FileEditTrash {
				ids: string[],
				trash: boolean
			}
			export interface FileEditParentId {
				ids: string[],
				parentId: string
			}
			export type FileUpdate = Partial<Noonly.API.Data.File>
			export interface FunctionsSetBlockLocationChange {
				func: (() => void) | null
			}
			export interface InitialLoadSet {
				type: Noonly.State.InitialLoadTypes,
				value: boolean | 'DISCONNECTED'
			}
			export interface MailDelete {
				ids: string[]
			}
			export interface MailEditRead {
				ids: string[],
				read: boolean
			}
			export interface MailEditTrash {
				ids: string[],
				trash: boolean
			}
			export interface MailEditArchived {
				ids: string[],
				archived: boolean
			}
			export interface MailFetchContent {
				id: string,
				images: Noonly.API.Data.MailImage[],
				attachments: Noonly.API.Data.MailAttachment[],
				html: string,
				text: string
			}
			export interface ModalOpen {
				id: number,
				data?: any
			}
			export interface ModalClose {
				id: number
			}
			export interface OverlayOpen {
				id: number,
				data?: any
			}
			export type OverlayClose = undefined
			export type ScreenshotAdd = Noonly.API.Data.Screenshot
			export interface ScreenshotDelete {
				ids: string[]
			}
			export interface ScreenshotEditFavorite {
				ids: string[],
				favorite: boolean
			}
			export interface ScreenshotEditTrash {
				ids: string[],
				trash: boolean
			}
			export interface SelectionToggleSelection {
				type: Noonly.State.SelectionTypes,
				id: string
			}
			export interface SelectionSetSelection {
				type: Noonly.State.SelectionTypes,
				ids: string[]
			}
			export type SidebarToggle = undefined
			export type SidebarSetOpen = boolean
			export interface SortSetDirection {
				type: 'screenshots' | 'cloud' | 'accounts',
				direction: string
			}
			export interface SortSetMethod {
				type: 'screenshots' | 'cloud' | 'accounts',
				method: string
			}
			export type UserAddAddress = Noonly.API.Data.UserAddress
			export interface UserRemoveAddress {
				id: string
			}
			export interface UserEditAddressName {
				id: string,
				name: string
			}
			export interface UserUpdateAddresses {
				order: Noonly.API.Data.UserAddressOrder,
				visible: Noonly.API.Data.UserAddressVisibility
			}
			export interface UserUploadAvatar {
				avatar: string
			}
			export interface UserUploadIcon {
				icon: string
			}
			export interface UserDeleteIcon {
				icon: string
			}
			export type UserSetSelectedAddress = string
			export interface UserEditUnread {
				ids: string[],
				rootState: RootState,
				address: string,
				read: boolean,
			}
			export interface UserSetUnread {
				[addressId: string]: number
			}
			export interface UserSetIncoming {
				address: string,
				incoming: boolean
			}
			export interface UserSetStatus {
				status: Noonly.API.Data.UserStatus
			}
		}
		namespace Effect {
			export interface AccountCreate {
				site: string,
				username: string,
				address: string,
				password: string,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface AccountEdit {
				id: string,
				site: string,
				username: string,
				address: string,
				password: string,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface AccountDelete {
				id: string,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface AccountClearTrash {
				onSuccess: () => void,
				onFail: () => void
			}
			export interface AccountEditTrash {
				id: string,
				trash: boolean,
				_redo?: boolean
			}
			export interface AccountEditNote {
				id: string,
				note: string,
				onSuccess: () => void
			}
			export interface AccountEditIcon {
				id: string,
				icon: string | null,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface AccountSetMfaSecret {
				id: string,
				mfaSecret: string | null,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface ContextMenuOpen {
				id: number,
				data?: any,
				e: React.MouseEvent<HTMLDivElement, MouseEvent> | any
			}
			export interface FileUpload {
				parentId: string,
				file: File
			}
			export interface FileCreate {
				parentId: string,
				isFolder: boolean,
				name: string,
				overwriteExisting?: boolean,
				appendName?: boolean,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface FileDelete {
				ids: string[],
				onSuccess: () => void,
				onFail: () => void
			}
			export interface FileClearTrash {
				onSuccess: () => void,
				onFail: () => void
			}
			export interface FileRename {
				id: string,
				name: string,
				overwriteExisting?: boolean,
				appendName?: boolean,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface FileEditTrash {
				ids: string[],
				trash: boolean,
				_redo?: boolean
			}
			export interface FileEditParentId {
				ids: string[],
				parentId: string,
				_redo?: boolean
			}
			export interface FileSendInvite {
				id: string,
				username: string,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface FileCancelInvite {
				fileId: string,
				userId: string,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface FileAcceptInvite{
				fileId: string,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface FileDenyInvite {
				fileId: string,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface FileUpdatePermissions {
				fileId: string,
				userId: string,
				permissions: {
					canRename: boolean,
					canEdit: boolean,
					canReplace: boolean,
					canManage: boolean,
					canUpload: boolean,
					canDelete: boolean,
					canMoveFiles: boolean,
				},
				onSuccess: () => void,
				onFail: () => void
			}
			export interface FileAddDlKey {
				id: string,
				password: string,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface FileUpdateDlKey {
				id: string,
				key: string,
				password: string,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface FileRemoveDlKey {
				id: string,
				key: string,
				onSuccess: () => void,
				onFail: () => void
			}
			export type MailRefresh = undefined
			export interface MailDelete {
				ids: string[],
				onSuccess: () => void,
				onFail: () => void
			}
			export interface MailClearTrash {
				onSuccess: () => void,
				onFail: () => void
			}
			export interface MailEditRead {
				ids: string[],
				read: boolean,
				notification?: boolean,
				_redo?: boolean
			}
			export interface MailEditTrash {
				ids: string[],
				trash: boolean,
				_redo?: boolean
			}
			export interface MailEditArchived {
				ids: string[],
				archived: boolean,
				_redo?: boolean
			}
			export interface OverlayOpen {
				id: number,
				data?: any
			}
			export interface ScreenshotDelete {
				ids: string[],
				onSuccess: () => void,
				onFail: () => void
			}
			export interface ScreenshotEditFavorite {
				ids: string[],
				favorite: boolean,
				onSuccess?: () => void,
				onFail?: () => void,
				_redo?: boolean
			}
			export interface ScreenshotEditTrash {
				ids: string[],
				trash: boolean,
				_redo?: boolean
			}
			export interface ScreenshotClearTrash {
				onSuccess: () => void,
				onFail: () => void
			}
			export interface UserAddAddress {
				address: string,
				name: string,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface UserRemoveAddress {
				id: string,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface UserEditAddressName {
				id: string,
				name: string,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface UserUpdateAddresses {
				order: Noonly.API.Data.UserAddressOrder,
				visible: Noonly.API.Data.UserAddressVisibility,
				notification?: boolean,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface UserUploadAvatar {
				image: Blob,
				imageName: string,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface UserUploadIcon {
				image: Blob,
				imageName: string,
				onSuccess: () => void,
				onFail: () => void
			}
			export interface UserDeleteIcon {
				icon: string,
				onSuccess: () => void,
				onFail: () => void
			}
		}
	}
}

declare global {
	namespace Noonly {
		/* Api */
		namespace API {
			/* Data Types */
			namespace Data {
				export interface Account {
					id: string,
					site: string,
					username: string,
					address: string,
					password: string,
					trash: boolean,
					icon?: string | null,
					note: string,
          mfaSecret: string | null,
					createdAt: string,
					updatedAt: string
				}
				export interface FileDlKey {
					fileId: string,
					key: string,
					password: string
				}
				export interface FileUser {
					username: string,
					avatar?: string
				}
				export interface FilePermission {
					userId: string,
					fileId: string,
					canRename: boolean,
					canEdit: boolean,
					canReplace: boolean,
					canManage: boolean,
					canUpload: boolean,
					canDelete: boolean,
					canMoveFiles: boolean
				}
				export interface File {
					id: string,
					owner: string,
					name: string,
					isFolder: boolean,
					parentId: string,
					size: number,
					trash: boolean,
					dlKeys: FileDlKey[],
					invited: FileUser[],
					sharedWith: FileUser[],
					permissions: FilePermission[],
					createdAt: string,
					updatedAt: string
				}
				export interface MailAttachment {
					filename: string,
					cid?: string,
					related?: boolean,
					path: string,
					id: string
				}
				export interface MailImage {
					cid: string,
					data: string
				}
				export interface Mail {
					id: string,
					ownerId: string,
					subject: string,
					previewText: string,
					from: string,
					to: string,
					sentToAddressId: string,
					sentFromAddressId?: string,
					inReplyTo?: string,
					read: boolean,
					trash: boolean,
					archived: boolean,
					dateReceived: string,
					dateSent: string,
					messageId: string
					/* After mail content has been fetched */
					images?: MailImage[],
					attachments?: MailAttachment[],
					text?: string,
					html?: string
				}
				export interface Screenshot {
					id: string,
					name: string,
					type: string,
					size: number,
					favorite: boolean,
					trash: boolean,
					createdAt: string,
					updatedAt: string
				}
				export enum UserStatus {
					ONLINE = 'Online',
					IDLE = 'Idle',
					DO_NOT_DISTURB = 'Do Not Disturb',
					INVISIBLE = 'Invisible'
				}
				export interface UserAddress {
					id: string,
					address: string,
					name: string,
					order: number,
					visible: boolean,
					unread?: number,
					incoming?: boolean
				}
				export interface UserAddressOrder {
					[id: string]: number
				}
				export interface UserAddressVisibility {
					[id: string]: boolean
				}
				export interface User {
					id: string,
					username: string,
					level: number,
					avatar?: string,
					status: UserStatus,
					icons: string[],
					imgToken: string,
					cloudToken: string,
					addresses: UserAddress[],
					settings: string
				}
			}
			/* Request Types */
			namespace Request {
				/* Auth Login Request (auth/login) */
				export interface AuthLogin {
					username: string,
					password: string,
					rememberMe: boolean
				}

				/* Auth Register Request (auth/register) */
				export interface AuthRegister {
					username: string,
					password: string
				}

				/* Account Create Request (accounts/create) */
				export interface AccountCreate {
					site: string,
					username: string,
					address: string,
					password: string
				}

				/* Account Edit Request (accounts/edit) */
				export interface AccountEdit {
					id: string,
					site: string,
					username: string,
					address: string,
					password: string
				}

				/* Account Delete Request (accounts/delete) */
				export interface AccountDelete {
					id: string
				}

				/* Account Clear Trash Request (accounts/clearTrash) */
				// Currently, this endpoint does not accept any body parameters

				/* Account Edit Trash Request (accounts/editTrash) */
				export interface AccountEditTrash {
					id: string,
					trash: boolean
				}

        export interface AccountSetMfaSecret {
          id: string,
          mfaSecret: string | null
        }

				/* Account Edit Note Request (accounts/editNote) */
				export interface AccountEditNote {
					id: string,
					note: string
				}

				/* Account Edit Icon Request (accounts/editIcon) */
				export interface AccountEditIcon {
					id: string,
					icon: string | null
				}

				/* File Upload Request (cloud/upload) */
				// Currently, this endpoint does not accept any body parameters

				/* File Create Request (cloud/create) */
				export interface FileCreate {
					parentId: string,
					isFolder: boolean,
					name: string,
					overwriteExisting: boolean,
					appendName: boolean
				}

				/* File Delete Request (cloud/delete) */
				export interface FileDelete {
					ids: string[]
				}

				/* File Clear Trash Request (cloud/clearTrash) */
				// Currently, this endpoint does not accept any body parameters

				/* File Rename Request (cloud/rename) */
				export interface FileRename {
					id: string,
					name: string,
					overwriteExisting: boolean,
					appendName: boolean
				}

				/* File Edit Trash Request (cloud/editTrash) */
				export interface FileEditTrash {
					ids: string[],
					trash: boolean
				}

				/* File Edit ParentId Request (cloud/editParentId) */
				export interface FileEditParentId {
					ids: string[],
					parentId: string
				}

				/* File Send Invite Request (cloud/sendInvite) */
				export interface FileSendInvite {
					id: string,
					username: string
				}

				/* File Cancel Invite Request (cloud/cancelInvite) */
				export interface FileCancelInvite {
					fileId: string,
					userId: string
				}

				/* File Accept Invite Request (cloud/acceptInvite) */
				export interface FileAcceptInvite {
					fileId: string
				}

				/* File Deny Invite Request (cloud/denyInvite) */
				export interface FileDenyInvite {
					fileId: string
				}

				/* File Update Permissions Request (cloud/updatePermissions) */
				export interface FileUpdatePermissions {
					fileId: string,
					userId: string,
					permissions: {
						canRename: boolean,
						canEdit: boolean,
						canReplace: boolean,
						canManage: boolean,
						canUpload: boolean,
						canDelete: boolean,
						canMoveFiles: boolean
					}
				}

				/* File Add DlKey Request (cloud/addDlKey) */
				export interface FileAddDlKey {
					id: string,
					password: string
				}

				/* File Update DlKey Request (cloud/updateDlKey) */
				export interface FileUpdateDlKey {
					id: string,
					key: string,
					password: string
				}

				/* File Remove DlKey Request (cloud/removeDlKey) */
				export interface FileRemoveDlKey {
					id: string,
					key: string
				}

				/* Mail Download Attachment Request (mail/downloadAttachment) */
				export interface MailDownloadAttachment {
					mailId: string,
					attachmentId: string
				}

				/* Mail Delete Request (mail/delete) */
				export interface MailDelete {
					ids: string[]
				}

				/* Mail Clear Trash Request (mail/clearTrash) */
				export interface MailClearTrash {
					addressId: string
				}

				/* Mail Edit Read Request (mail/editRead) */
				export interface MailEditRead {
					ids: string[],
					read: boolean
				}

				/* Mail Edit Trash Request (mail/editTrash) */
				export interface MailEditTrash {
					ids: string[],
					trash: boolean
				}

				/* Mail Edit Archived Request (mail/editArchived) */
				export interface MailEditArchived {
					ids: string[],
					archived: boolean
				}

				/* Screenshot Delete Request (screenshots/delete) */
				export interface ScreenshotDelete {
					ids: string[]
				}

				/* Screenshot Edit Favorite Request (screenshots/editFavorite) */
				export interface ScreenshotEditFavorite {
					ids: string[],
					favorite: boolean
				}

				/* Screenshot Edit Trash Request (screenshots/editTrash) */
				export interface ScreenshotEditTrash {
					ids: string[],
					trash: boolean
				}

				/* Screenshot Clear Trash Request (screenshots/clearTrash) */
				// Currently, this endpoint does not accept any body parameters

				/* User Add Address Request (user/addAddress) */
				export interface UserAddAddress {
					address: string,
					name: string
				}

				/* User Remove Address Request (user/removeAddress) */
				export interface UserRemoveAddress {
					id: string
				}

				/* User Edit Address Name Request (user/editAddressName) */
				export interface UserEditAddressName {
					id: string,
					name: string
				}

				/* User Update Addresses Request (user/updateAddresses) */
				export interface UserUpdateAddresses {
					order: Noonly.API.Data.UserAddressOrder,
					visible: Noonly.API.Data.UserAddressVisibility,
				}

				/* User Upload Avatar Request (user/uploadAvatar) */
				// Currently, this endpoint does not accept any body parameters

				/* User Upload Icon Request (user/uploadIcon) */
				// Currently, this endpoint does not accept any body parameters

				/* User Delete Icon Request (user/deleteIcon) */
				export interface UserDeleteIcon {
					icon: string
				}
			}
			/* Response Types */
			namespace Response {
				interface BaseResponse<T> {
					message: string
					data: T
				}

				/* Auth Login Response (auth/login) */
				export interface AuthLoginData {
					token: string
				}
				export type AuthLogin = BaseResponse<AuthLoginData>

				/* Auth Register Response (auth/login) */
				export interface AuthRegisterData {
					token: string
				}
				export type AuthRegister = BaseResponse<AuthRegisterData>

				/* Account Create Response (accounts/create) */
				export interface AccountCreateData {
					account: Noonly.API.Data.Account
				}
				export type AccountCreate = BaseResponse<AccountCreateData>

				/* Account Edit Response (accounts/edit) */
				export interface AccountEditData {
					account: Noonly.API.Data.Account
				}
				export type AccountEdit = BaseResponse<AccountEditData>

				/* Account Delete Response (accounts/delete) */
				export interface AccountDeleteData {
					deleted: {
						id: string
					}
				}
				export type AccountDelete = BaseResponse<AccountDeleteData>

				/* Account Clear Trash Response (accounts/clearTrash) */
				export interface AccountClearTrashData {
					deleted: {
						ids: string[]
					}
				}
				export type AccountClearTrash = BaseResponse<AccountClearTrashData>

				/* Account Edit Trash Response (accounts/editTrash) */
				export interface AccountEditTrashData {
					updated: {
						id: string,
						trash: boolean
					}
				}
				export type AccountEditTrash = BaseResponse<AccountEditTrashData>

        export interface AccountSetMfaSecretData {
          updated: {
            id: string,
            mfaSecret: string | null
          }
        }
        export type AccountSetMfaSecret = BaseResponse<AccountSetMfaSecretData>

				/* Account Edit Note Response (accounts/editNote) */
				export interface AccountEditNoteData {
					updated: {
						id: string,
						note: string
					}
				}
				export type AccountEditNote = BaseResponse<AccountEditNoteData>

				/* Account Edit Icon Response (accounts/editIcon) */
				export interface AccountEditIconData {
					updated: {
						id: string,
						icon: string
					}
				}
				export type AccountEditIcon = BaseResponse<AccountEditIconData>

				/* File Upload Response (cloud/upload) */
				export interface FileUploadData {
					file: Noonly.API.Data.File
				}
				export type FileUpload = BaseResponse<FileUploadData>

				/* File Create Response (cloud/create) */
				export interface FileCreateData {
					file: Noonly.API.Data.File,
					deletedId?: string
				}
				export type FileCreate = BaseResponse<FileCreateData>

				/* File Delete Response (cloud/delete) */
				export interface FileDeleteData {
					deleted: {
						ids: string[]
					}
				}
				export type FileDelete = BaseResponse<FileDeleteData>

				/* File Clear Trash Response (cloud/clearTrash) */
				export interface FileClearTrashData {
					deleted: {
						ids: string[]
					}
				}
				export type FileClearTrash = BaseResponse<FileClearTrashData>

				/* File Rename Response (cloud/rename) */
				export interface FileRenameData {
					updated: {
						id: string,
						name: string
					},
					deletedId?: string
				}
				export type FileRename = BaseResponse<FileRenameData>

				/* File Edit Trash Response (cloud/editTrash) */
				export interface FileEditTrashData {
					updated: {
						ids: string[],
						trash: boolean
					}
				}
				export type FileEditTrash = BaseResponse<FileEditTrashData>

				/* File Edit ParentId Response (cloud/editParentId) */
				export interface FileEditParentIdData {
					updated: {
						ids: string[],
						parentId: string
					}
				}
				export type FileEditParentId = BaseResponse<FileEditParentIdData>

				/* File Send Invite Response (cloud/sendInvite) */
				export interface FileSendInviteData {
					updated: {
						id: string,
						invited: Noonly.API.Data.FileUser[],
						permissions: Noonly.API.Data.FilePermission[]
					}
				}
				export type FileSendInvite = BaseResponse<FileSendInviteData>

				/* File Cancel Invite Response (cloud/cancelInvite) */
				export interface FileCancelInviteData {
					updated: {
						id: string,
						invited: Noonly.API.Data.FileUser[],
						permissions: Noonly.API.Data.FilePermission[]
					}
				}
				export type FileCancelInvite = BaseResponse<FileCancelInviteData>

				/* File Accept Invite Response (cloud/acceptInvite) */
				export interface FileAcceptInviteData {
					file: Noonly.API.Data.File
				}
				export type FileAcceptInvite = BaseResponse<FileAcceptInviteData>

				/* File Deny Invite Response (cloud/denyInvite) */
				export interface FileDenyInviteData {
					file: {
						id: string
					}
				}
				export type FileDenyInvite = BaseResponse<FileDenyInviteData>

				/* File Update Permissions Response */
				export interface FileUpdatePermissionsData {
					updated: {
						id: string,
						permissions: Noonly.API.Data.FilePermission[]
					}
				}
				export type FileUpdatePermissions = BaseResponse<FileUpdatePermissionsData>

				/* File Add DlKey Response (cloud/addDlKey) */
				export interface FileAddDlKeyData {
					updated: {
						id: string,
						dlKeys: Noonly.API.Data.FileDlKey[]
					}
				}
				export type FileAddDlKey = BaseResponse<FileAddDlKeyData>

				/* File Update DlKey Response (cloud/updateDlKey) */
				export interface FileUpdateDlKeyData {
					updated: {
						id: string,
						dlKeys: Noonly.API.Data.FileDlKey[]
					}
				}
				export type FileUpdateDlKey = BaseResponse<FileUpdateDlKeyData>

				/* File Remove DlKey Response (cloud/removeDlKey) */
				export interface FileRemoveDlKeyData {
					updated: {
						id: string,
						dlKeys: Noonly.API.Data.FileDlKey[]
					}
				}
				export type FileRemoveDlKey = BaseResponse<FileRemoveDlKeyData>

				/* Mail Delete Response (mail/delete) */
				export interface MailDeleteData {
					deleted: {
						ids: string[]
					}
				}
				export type MailDelete = BaseResponse<MailDeleteData>

				/* Mail Clear Trash Response (mail/clearTrash) */
				export interface MailClearTrashData {
					deleted: {
						ids: string[]
					}
				}
				export type MailClearTrash = BaseResponse<MailClearTrashData>

				/* Mail Edit Read Response (mail/editRead) */
				export interface MailEditReadData {
					updated: {
						ids: string[],
						read: boolean
					}
				}
				export type MailEditRead = BaseResponse<MailEditReadData>

				/* Mail Edit Trash Response (mail/editTrash) */
				export interface MailEditTrashData {
					updated: {
						ids: string[],
						trash: boolean
					}
				}
				export type MailEditTrash = BaseResponse<MailEditTrashData>

				/* Mail Edit Archived Request (mail/editArchived) */
				export interface MailEditArchivedData {
					updated: {
						ids: string[],
						archived: boolean
					}
				}
				export type MailEditArchived = BaseResponse<MailEditArchivedData>

				/* Screenshot Delete Response (screenshots/delete) */
				export interface ScreenshotDeleteData {
					deleted: {
						ids: string[]
					}
				}
				export type ScreenshotDelete = BaseResponse<ScreenshotDeleteData>

				/* Screenshot Edit Favorite Response (screenshots/editFavorite) */
				export interface ScreenshotEditFavoriteData {
					updated: {
						ids: string[],
						favorite: boolean
					}
				}
				export type ScreenshotEditFavorite = BaseResponse<ScreenshotEditFavoriteData>

				/* Screenshot Edit Trash Response (screenshots/editTrash) */
				export interface ScreenshotEditTrashData {
					updated: {
						ids: string[],
						trash: boolean
					}
				}
				export type ScreenshotEditTrash = BaseResponse<ScreenshotEditTrashData>

				/* Screenshot Clear Trash Response (screenshots/clearTrash) */
				export interface ScreenshotClearTrashData {
					deleted: {
						ids: []
					}
				}
				export type ScreenshotClearTrash = BaseResponse<ScreenshotClearTrashData>

				/* User Add Address Response (user/addAddress) */
				export interface UserAddAddressData {
					address: Noonly.API.Data.UserAddress
				}
				export type UserAddAddress = BaseResponse<UserAddAddressData>

				/* User Remove Address Response (user/removeAddress) */
				export interface UserRemoveAddressData {
					deleted: {
						id: string
					}
				}
				export type UserRemoveAddress = BaseResponse<UserRemoveAddressData>

				/* User Edit Address Name Response (user/editAddressName) */
				export interface UserEditAddressNameData {
					updated: {
						id: string,
						name: string
					}
				}
				export type UserEditAddressName = BaseResponse<UserEditAddressNameData>

				/* User Update Addresses Response (user/updateAddresses) */
				export interface UserUpdateAddressesData {
					updated: {
						order: Noonly.API.Data.UserAddressOrder,
						visible: Noonly.API.Data.UserAddressVisibility,
					}
				}
				export type UserUpdateAddresses = BaseResponse<UserUpdateAddressesData>

				/* User Upload Avatar Response (user/uploadAvatar) */
				export interface UserUploadAvatarData {
					updated: {
						avatar: string
					}
				}
				export type UserUploadAvatar = BaseResponse<UserUploadAvatarData>

				/* User Upload Icon Response (user/uploadIcon) */
				export interface UserUploadIconData {
					updated: {
						icon: string
					}
				}
				export type UserUploadIcon = BaseResponse<UserUploadIconData>

				/* User Delete Icon Response (user/deleteIcon) */
				export interface UserDeleteIconData {
					deleted: {
						icon: string
					}
				}
				export type UserDeleteIcon = BaseResponse<UserDeleteIconData>
			}
		}
	}
}