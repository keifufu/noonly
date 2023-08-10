/* eslint-disable react-hooks/exhaustive-deps */

import { Dispatch, RootState } from 'main/store/store'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import store from 'main/store'
import { useHistory } from 'react-router-dom'

const UseEffectComponent: React.FC = () => {
	const [isUpdating, setIsUpdating] = useState(false)
	const user = useSelector((state: RootState) => state.user)
	const dispatch: Dispatch = useDispatch()
	const history = useHistory()

	const updateSelectedAddress = () => {
		if (!user.addresses) return
		const selectedAddress = user.addresses.find((e) => e.id === user.selectedAddress && e.visible)
		if (!selectedAddress) {
			const [newSelectedAddress] = user.addresses.filter((e) => e.visible).sort((a, b) => a.order - b.order)
			if (newSelectedAddress) {
				dispatch.user.setSelectedAddress(newSelectedAddress.id)
			} else {
				if (isUpdating) return
				setIsUpdating(true)
				/* Make default address visible and select it */
				const createAddress = (username: string):string => `${username}@${process.env.REACT_APP_HOSTNAME}`
				const defaultAddress = user.addresses?.find((address) => address.address?.toLowerCase() === createAddress(user.username || ''))
				if (!defaultAddress) return
				dispatch.user.setSelectedAddress(defaultAddress.id)
				dispatch.user.updateAddresses({
					order: {
						[defaultAddress.id]: defaultAddress.order
					},
					visible: {
						[defaultAddress.id]: true
					},
					notification: false,
					onFail: () => window.location.reload(),
					onSuccess: () => setIsUpdating(false)
				})
			}
		}
	}

	useEffect(updateSelectedAddress, [user.addresses, user.selectedAddress])
	useEffect(updateSelectedAddress, [])

	useEffect(() => {
		/* Push history once */
		history.push(location.pathname)

		/* Block navigation when contextMenu or Modals are open, and close those instead */
		const calculateHistoryBlock = () => {
			const state = store.getState()
			if (typeof state.contextMenu.onClose === 'function') {
				dispatch.contextMenu.close()
				return false
			}
			if (state.modal[state.modal.mostRecentModal]?.open) {
				state.modal[state.modal.mostRecentModal].onClose()
				return false
			}
			/*
			 * if (typeof state.overlay?.onClose === 'function') {
			 * 	dispatch.overlay.close()
			 * 	return false
			 * }
			 */
			/* For other things to hook into */
			if (typeof state.functions.onBlockLocationChange === 'function') {
				state.functions.onBlockLocationChange()
				return false
			}
			return true
		}
		const unblock = history.block(calculateHistoryBlock())

		return () => unblock()
	}, [])

	return null
}

export default UseEffectComponent