import { makeStyles, TextField as MUITextField } from '@material-ui/core'
import { Visibility, VisibilityOff, VpnKey } from '@material-ui/icons'
import { fieldToTextField } from 'formik-material-ui'
import { generatePassword } from '../Utilities'
import { IconButton } from '@material-ui/core'
import zxcvbn from 'zxcvbn'
import React from 'react'

const useStyles = makeStyles({
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
})

export default function TextField(props) {
	const [recentlyUpdated, setRecentlyUpdate] = React.useState(false)
	const { form, field, password, passwordGen, strength } = props
	const [input, setInput] = React.useState('')
	const [score, setScore] = React.useState(null)
	const classes = useStyles()

	if(props.field.value.length > 1 && strength && score === null) {
		setScore(zxcvbn(props.field.value, []).score)
		setInput(props.field.value)
	}

	const onChange = React.useCallback(e => {
		setRecentlyUpdate(true)
		form.setFieldValue(field.name, e.target.value)
		if(strength) {
			if(e.target.value.length > 32) {
				setTimeout(() => setRecentlyUpdate(false), 350)
				setTimeout(() => {
					if(recentlyUpdated) return
					setScore(zxcvbn(e.target.value, []).score)
				}, 500)
			} else {
				setScore(zxcvbn(e.target.value, []).score)
			}
		}
		setInput(e.target.value)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.setFieldValue, field.name])

	const classNames = []
	classNames.push(classes.bar)
	if(input.length > 0) classNames.push(classes[`strength${score}`])

	const [visibility, setVisibility] = React.useState(password ? false : true)
	const onClick = () => {
		if(input.length === 0 && passwordGen) {
			const password = generatePassword(24)
			onChange({ target: { value: password } })
		} else setVisibility(!visibility)
	}

	return (<>
		<MUITextField {...fieldToTextField(props)} type={visibility ? 'text' : 'password'} onChange={onChange} InputProps={{
			endAdornment: password && (
				<IconButton onClick={onClick}>
					{
						passwordGen && input.length === 0 ? <VpnKey /> :
						visibility ? <VisibilityOff/> : <Visibility/>
					}
				</IconButton>
			)}} />
		{strength && <div className={classNames.join(' ')}></div>}
	</>)
}