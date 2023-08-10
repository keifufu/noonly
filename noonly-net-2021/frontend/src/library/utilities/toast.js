import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, chakra, createStandaloneToast } from '@chakra-ui/react'

import theme from 'library/common/theme'

const _toast = createStandaloneToast({ theme })

/* Don't even bother trying to convert this mess to TypeScript. Please. I tried. */

class Toast {
	mergeDefaultOptions(options, type) {
		const isMobile = window.innerWidth <= 768
		const toastOptions = {
			title: null,
			description: options,
			status: type,
			duration: isMobile ? 1500 : 5000,
			variant: 'solid',
			position: isMobile ? 'top' : 'bottom-left',
			...options,
			render: ({ id, onClose }) => (
				<Alert
					status={ toastOptions.status }
					variant={ toastOptions.variant }
					id={id}
					alignItems='start'
					borderRadius='md'
					boxShadow='lg'
					paddingEnd={8}
					textAlign='start'
					width='auto'
					onClick={onClose}
				>
					<AlertIcon />
					<chakra.div flex='1' maxWidth={toastOptions.action ? '80%' : '100%'}>
						{ toastOptions.title && <AlertTitle>{ toastOptions.title }</AlertTitle> }
						{ toastOptions.description && (
							<AlertDescription>{ toastOptions.description }</AlertDescription>
						)}
					</chakra.div>
					{ toastOptions.action && (
						<Button
							onClick={(e) => {
								e.stopPropagation()
								toastOptions.onClick?.(e)
							}}
							variant=''
							ml='1em'
							size='sm'
							position='absolute'
							insetEnd={2}
							top={2}
							_hover={{ bg: 'rgba(29, 29, 27, 0.24)' }}
						>
							{ toastOptions.action }
						</Button>
					)
					}
				</Alert>
			)
		}
		return toastOptions
	}

	show(options) {
		const toastOptions = this.mergeDefaultOptions(options, 'success')
		if (_toast.isActive(options.id))
			_toast.update(options.id, toastOptions)
		else
			_toast(toastOptions)
	}

	showError(options) {
		const toastOptions = this.mergeDefaultOptions(options, 'error')
		_toast.close(options.id)
		_toast(toastOptions)
	}

	showWarning(options) {
		const toastOptions = this.mergeDefaultOptions(options, 'warning')
		_toast.close(options.id)
		_toast(toastOptions)
	}

	update(id, options) {
		_toast.update(id, options)
	}

	isActive(id) {
		return _toast.isActive(id)
	}
}

const toast = new Toast()
export default toast