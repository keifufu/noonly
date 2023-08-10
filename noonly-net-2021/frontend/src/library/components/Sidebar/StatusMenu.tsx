/* eslint-disable no-unused-vars */

import { Box, Circle, Menu, MenuButton } from '@chakra-ui/react'
import { memo, useEffect, useRef, useState } from 'react'

import { BsCaretRightFill } from 'react-icons/bs'
import ContextMenuItem from 'library/components/ContextMenuItem'
import ContextMenuList from 'library/components/ContextMenuList'
import { RootState } from 'main/store/store'
import { UserStatus } from '@types'
import socket from 'main/socket'
import { useSelector } from 'react-redux'

const StatusMenu: React.FC = memo(() => {
	const _status = useSelector((state: RootState) => state.user.status)
	const [isOpen, setIsOpen] = useState(false)
	const timeout = useRef<null | NodeJS.Timeout>(null)
	const [status, setStatus] = useState<Noonly.API.Data.UserStatus | undefined>(_status)

	useEffect(() => {
		setStatus(_status)
	}, [_status])

	const onOpen = () => {
		clearTimeout(timeout.current as NodeJS.Timeout)
		setIsOpen(true)
	}
	const onClose = () => setIsOpen(false)

	const changeStatus = (newStatus: Noonly.API.Data.UserStatus) => {
		if (status === newStatus) return
		setStatus(newStatus)
		socket.emit('USER_SET_STATUS', { status: newStatus })
	}

	return (
		<Menu
			placement='right'
			isOpen={isOpen}
			gutter={14}
		>
			<MenuButton
				as={ContextMenuItem}
				onMouseEnter={onOpen}
				onMouseLeave={() => (timeout.current = setTimeout(onClose, 150))}
			>
				<Box
					display='flex'
					alignItems='center'
					justifyContent='space-between'
				>
					Set Status
					<BsCaretRightFill size='12' />
				</Box>
			</MenuButton>
			<ContextMenuList
				onMouseEnter={onOpen}
				onMouseLeave={onClose}
			>
				<ContextMenuItem active={status === UserStatus.ONLINE} onClick={() => changeStatus(UserStatus.ONLINE)} >
					<Circle size='3' bg='green.400' mr='3' />
					Online
				</ContextMenuItem>
				<ContextMenuItem active={status === UserStatus.IDLE} onClick={() => changeStatus(UserStatus.IDLE)} >
					<Circle size='3' bg='yellow.400' mr='3' />
					Idle
				</ContextMenuItem>
				<ContextMenuItem active={status === UserStatus.DO_NOT_DISTURB} onClick={() => changeStatus(UserStatus.DO_NOT_DISTURB)} >
					<Circle size='3' bg='red.400' mr='3' />
					Do not Disturb
				</ContextMenuItem>
				<ContextMenuItem active={status === UserStatus.INVISIBLE} onClick={() => changeStatus(UserStatus.INVISIBLE)} >
					<Circle size='3' bg='gray.400' mr='3' />
					Invisible
				</ContextMenuItem>
			</ContextMenuList>
		</Menu>
	)
})

export default StatusMenu