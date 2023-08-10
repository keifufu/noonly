import { ThemeType, useTheme } from './ThemeProvider'

import { Dialog } from 'react-native-paper'
import React from 'react'
import { ScrollView } from 'react-native'
import randomToken from 'utils/randomToken'

interface IContextProps {
	show: <T>(modal: React.FC<any>, props?: T) => void
}

export const ModalContext = React.createContext<IContextProps>({ show: () => null })

interface IModal {
	id: string
	modal: React.FC<any>
	props?: any
}

export interface ModalProps {
	id: string
	close: () => void
	show: <T>(modal: React.FC<any>, props?: T) => void
}

export const ModalProvider: React.FC = ({ children }) => {
	const [modals, setModals] = React.useState<IModal[]>([])

	function show<T>(modal: React.FC, props?: T) {
		setModals((modals) => ([
			...modals,
			{ id: randomToken(24), visible: true, modal, props }
		]))
	}

	const close = (id: string) => {
		setModals((modals) => modals.filter((modal) => modal.id !== id))
	}

	const ModalProviderState = React.useMemo(() => ({
		show
	}), [])

	return (<>
		<ModalContext.Provider value={ModalProviderState}>
			{children}
		</ModalContext.Provider>
		{modals.map(({ id, modal: Modal, props }) => (
			<Modal key={id} modal={{ id, close: () => close(id), show }} {...props} />
		))}
	</>)
}

export const useModal = (): IContextProps => React.useContext(ModalContext)

interface ModalOptions {
	dismissable?: boolean
	dismissableKeyboard?: boolean
}

export function createModal<T, CompProps>(makeStyles: (theme: ThemeType) =>
	T, Comp: React.FC<CompProps & { modal: ModalProps, styles: T }>, modalOptions?: ModalOptions): React.FC<CompProps & { modal: ModalProps, styles: T }> {
	const InternalModal: React.FC<any & CompProps & { modal: ModalProps, styles: T }> = ({ modal, ...rest }) => {
		const [isVisible, setIsVisible] = React.useState(false)
		const theme = useTheme()
		const styles = makeStyles(theme)

		React.useEffect(() => {
			// Needs a timeout for some reason
			setTimeout(() => {
				setIsVisible(true)
			}, 0)
		}, [])

		const onClose = () => {
			setIsVisible(false)
			setTimeout(() => {
				modal.close()
			}, 250)
		}

		return (
			<Dialog
				visible={isVisible}
				onDismiss={() => modal.close()}
				dismissable={modalOptions?.dismissable || true}
				style={(styles as any)?.modal}
			>
				<ScrollView keyboardShouldPersistTaps={modalOptions?.dismissableKeyboard ? 'handled' : 'always'}>
					<Comp styles={styles} modal={{ ...modal, close: onClose }} {...rest} />
				</ScrollView>
			</Dialog>
		)
	}
	return InternalModal
}