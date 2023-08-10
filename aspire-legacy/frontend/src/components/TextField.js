import { Visibility, VisibilityOff, VpnKey } from '@material-ui/icons'
import { TextField as MUITextField } from '@material-ui/core'
import { fieldToTextField } from 'formik-material-ui'
import { generatePassword } from '../Utilities'
import { IconButton } from '@material-ui/core'
import React, { Component } from 'react'
import zxcvbn from 'zxcvbn'

class TextField extends Component {
	constructor(props) {
		super(props)
		this.state = {
			input: '',
			score: 0,
			visibility: false
		}
	}
	
	render() {
		const { password, passwordGen, strength } = this.props
		const { input, score, visibility } = this.state
		const { onChange, onClick } = this

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
		Object.keys(_style.bar).forEach(key => style[key] = _style.bar[key])
		if(input.length > 0) {
			Object.keys(_style[`strength${score}`]).forEach(key => style[key] = _style[`strength${score}`][key])
		}

		return (<>
			<MUITextField {...fieldToTextField(this.props)} type={visibility ? 'text' : 'password'} onChange={onChange} InputProps={{
				endAdornment: password && (
					<IconButton onClick={onClick}>
						{
							passwordGen && input.length === 0 ? <VpnKey /> :
							visibility ? <VisibilityOff/> : <Visibility/>
						}
					</IconButton>
				)}} />
			{strength && <div style={style} />}
			<div style={_style.bar} />
		</>)
	}

	componentDidMount = () => {
		const { field, password, strength } = this.props
		const state = { visibility: password ? false : true }
		if(field.value.length > 1 && strength) {
			state['score'] = zxcvbn(field.value, []).score
			state['input'] = field.value
		}
		this.setState(state)
	}

	onChange = e => {
		const { form, field, strength } = this.props
		form.setFieldValue(field.name, e.target.value)
		this.recentlyUpdated = true
		if(strength) {
			if(e.target.value.length > 32) {
				setTimeout(() => this.recentlyUpdated = false, 350)
				setTimeout(() => {
					if(this.recentlyUpdated) return
					this.setState({ score: zxcvbn(e.target.value, []).score })
				}, 500)
			} else this.setState({ score: zxcvbn(e.target.value, []).score })
		}
		this.setState({ input: e.target.value })
	}

	onClick = () => {
		const { input, visibility } = this.state
		const { passwordGen } = this.props
		if(input.length === 0 && passwordGen) {
			const password = generatePassword(24)
			this.onChange({ target: { value: password } })
		} else this.setState({ visibility: !visibility })
	}
}
export default TextField