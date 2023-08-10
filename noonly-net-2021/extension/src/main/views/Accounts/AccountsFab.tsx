import { MdAdd, MdDeleteForever, MdExtension } from 'react-icons/md'
import { Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, chakra } from '@chakra-ui/react'
import { memo, useEffect, useState } from 'react'

import { Dispatch } from 'main/store/store'
import Fab from 'library/components/Fab'
import Invisible from 'library/components/Invisible'
import { onSubmitProps } from 'library/components/Modals/modals/AlertModal'
import { useDispatch } from 'react-redux'
import useIsMobile from 'library/hooks/useIsMobile'

interface IProps {
	trash: boolean
}

const isNewerVersion = (oldVer: string, newVer: string) => {
	const oldParts = oldVer.split('.')
	const newParts = newVer.split('.')
	for (let i = 0; i < newParts.length; i++) {
		const a = parseInt(newParts[i])
		const b = parseInt(oldParts[i])
		if (a > b) return true
		if (a < b) return false
	}
	return false
}

const AccountsFab: React.FC<IProps> = memo(({ trash }) => {
	const dispatch: Dispatch = useDispatch()
	const isMobile = useIsMobile()
	const [isOutdated, setIsOutdated] = useState(false)
	const [isInstalled, setIsInstalled] = useState(false)
	const [latestVersion, setLatestVersion] = useState<null | string>(null)

	useEffect(() => {
		if (!latestVersion) {
			fetch(`https://${process.env.REACT_APP_HOSTNAME}/public/chrome/chrome_extension_version`).then((res) => res.text()).then((version) => {
				setLatestVersion(version)
			})
		}
		const interval = setInterval(() => {
			if (!latestVersion) return
			const extensionVersion = document.getElementById('noonly-extension-version')?.innerHTML
			if (!extensionVersion) {
				if (isInstalled) setIsInstalled(false)
				return
			}
			if (isInstalled !== true) setIsInstalled(true)
			if (isNewerVersion(extensionVersion, latestVersion)) {
				if (!isOutdated) setIsOutdated(true)
			} else if (isOutdated) {
				setIsOutdated(false)
			}
		}, 1000)

		return () => clearInterval(interval)
	}, [isOutdated, isInstalled, latestVersion])

	return (<>
		<Invisible invisible={!!trash}>
			<Fab
				text='Create Account'
				rIcon={MdAdd}
				onClick={() => dispatch.modal.open({ id: 1 })}
			/>
			<Invisible invisible={isMobile}>
				<Popover placement='left-end'>
					<PopoverTrigger>
						<Fab
							isSecondary
							rIcon={MdExtension}
							colors={isOutdated ? { bg: 'yellow.500', hover: 'yellow.400', active: 'yellow.400' } : undefined}
						/>
					</PopoverTrigger>
					<PopoverContent>
						<PopoverArrow />
						<PopoverCloseButton />
						<PopoverHeader>
							{isOutdated
								? 'Your Extension is outdated'
								: isInstalled
									? 'Your Extension is up-to-date'
									: 'Download Chrome Extension'
							}
						</PopoverHeader>
						<PopoverBody>
							<Invisible invisible={isInstalled && !isOutdated}>
								<chakra.div>
									Click
									<chakra.a
										href={`https://${process.env.REACT_APP_HOSTNAME}/public/chrome/chrome_extension.crx`}
										target='_blank'
										rel='noopener'
										cursor='pointer'
										mx='1'
										color={'blue.200'}
										_hover={{ color: 'blue.300', textDecor: 'underline' }}
										display={{ base: 'block', sm: 'inline' }}
									>
										here
									</chakra.a>
									to {isOutdated ? 'update your' : 'download the'} Extension.
								</chakra.div>
							</Invisible>
							<Invisible invisible={!isInstalled || isOutdated}>
								<chakra.div>
									You'll be notified once there are updates available.
								</chakra.div>
							</Invisible>
						</PopoverBody>
					</PopoverContent>
				</Popover>
			</Invisible>
		</Invisible>
		<Invisible visible={!!trash}>
			<Fab
				text='Clear Trash'
				rIcon={MdDeleteForever}
				onClick={() => {
					dispatch.modal.open({
						id: 9,
						data: {
							header: 'Delete Accounts?',
							text: 'Are you sure you want to delete all these Accounts? You cannot undo this action afterwards.',
							buttons: ['Cancel', 'Delete'],
							onSubmit: ({ onSuccess, onFail }: onSubmitProps) => {
								dispatch.accounts.clearTrash({ onSuccess, onFail })
							}
						}
					})
				}}
			/>
		</Invisible>
	</>)
})

export default AccountsFab