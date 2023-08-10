import { FileCopy, Visibility, VisibilityOff, VpnKey } from '@material-ui/icons'
import { fade, TextField as MuiTextField } from '@material-ui/core'
import { fieldToTextField } from 'formik-material-ui'
import { useEffect, useState, useRef } from 'react'
import { useDispatch } from 'react-redux'

import generatePassword from 'library/utilities/generatePassword'
import scorePassword from 'library/utilities/scorePassword'
import IconButton from 'library/components/IconButton'
import copy from 'library/utilities/copy'

let recentlyUpdated = false
function TextField(props) {
	const { field, form, password, strength, passwordgenerator, copybutton, endadornment, textadornment } = props
	const dispatch = useDispatch()
	const [score, setScore] = useState(0)
	const [input, setInput] = useState('')
	const [visibility, setVisibility] = useState(false)
	const inputRef = useRef()

	useEffect(() => {
		setVisibility(!password)
	}, [password])

	useEffect(() => {
		if (field.value.length > 1 && strength)
			setScore(scorePassword(field.value))
		setInput(field.value)
	}, [field.value, strength])

	const onChange = (e) => {
		form.setFieldValue(field.name, e.target.value)
		recentlyUpdated = true
		if (strength) {
			if (e.target.value.length > 32) {
				setTimeout(() => {
					recentlyUpdated = false
				}, 350)
				setTimeout(() => {
					if (recentlyUpdated) return
					setScore(scorePassword(e.target.value))
				}, 500)
			} else {
				setScore(scorePassword(e.target.value))
			}
		}
		setInput(e.target.value)
	}

	const onClick = () => {
		if (input.length === 0 && passwordgenerator) {
			const password = generatePassword()
			copy(password).catch(() => {
				dispatch.notifications.add({
					text: 'Couldn\'t copy password',
					severity: 'error'
				})
			})
			onChange({ target: { value: password } })
		} else {
			setVisibility(!visibility)
		}
	}

	const copyInput = () => {
		copy(input).then(() => {
			dispatch.notifications.add('Copied to Clipboard')
		}).catch(() => {
			dispatch.notifications.add({
				text: 'Something went wrong',
				severity: 'error'
			})
		})
	}

	const _style = {
		bar: {
			transition: 'width 300ms ease-out',
			boxSizing: 'border-box',
			position: 'static',
			borderRadius: 100,
			marginTop: -6,
			marginLeft: 4,
			height: 2
		},
		strength0: { background: '#D1462F', width: '20%' },
		strength1: { background: '#D1462F', width: '40%' },
		strength2: { background: '#57B8FF', width: '60%' },
		strength3: { background: '#57B8FF', width: '80%' },
		strength4: { background: '#2FBF71', width: '98%' }
	}

	const style = {}
	Object.keys(_style.bar).forEach((key) => (style[key] = _style.bar[key]))
	if (input.length > 0)
		Object.keys(_style[`strength${score}`]).forEach((key) => (style[key] = _style[`strength${score}`][key]))

	const getInputTextWidth = () => {
		if (!inputRef.current) return 0

		const font = (element) => {
			const prop = ['font-style', 'font-variant', 'font-weight', 'font-size', 'font-family']
			let font = ''
			for (const x in prop)
				font += `${window.getComputedStyle(element, null).getPropertyValue(prop[x])} `
			return font
		}

		const c = document.createElement('canvas')
		const ctx = c.getContext('2d')
		ctx.font = font(inputRef.current)
		const textWidth = ctx.measureText(inputRef.current.value).width

		return textWidth
	}

	return (<>
		<MuiTextField
			{...fieldToTextField(props)}
			inputRef={inputRef}
			type={visibility ? 'text' : 'password'}
			onChange={onChange}
			style={{ backgroundColor: fade('#000', 0.1) }}
			InputProps={{
				startAdornment: textadornment && input.length > 0 && <div style={{
					position: 'fixed',
					marginLeft: getInputTextWidth() + 3,
					width: 0,
					overflow: 'visible',
					color: '#ababab',
					userSelect: 'none'
				}}
				>
					{textadornment}
				</div>,
				endAdornment: <div style={{ display: 'flex', flexDirection: 'row' }}>
					{
						password
						&& <IconButton onClick={onClick} icon={
							passwordgenerator && input.length === 0 ? VpnKey
								: visibility ? VisibilityOff : Visibility
						} tooltip={
							passwordgenerator && input.length === 0 ? 'Generate Password'
								: visibility ? 'Hide Password' : 'Show Password'
						} size={42} />
					}
					{
						copybutton === 1
						&& <IconButton
							onClick={copyInput}
							icon={FileCopy}
							tooltip='Copy to Clipboard'
							size={42}
						/>
					}
					{
						endadornment && endadornment
					}
				</div>
			}}
		/>
		{strength && <div style={style} />}
		{strength && <div style={_style.bar} /> }
	</>)
}

export default TextField