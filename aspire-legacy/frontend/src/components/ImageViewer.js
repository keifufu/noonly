import { Backdrop, withStyles } from '@material-ui/core'
import GlassMagnifier from './Magnifier/GlassMagnifier'
import React, { Component } from 'react'

class ImageViewer extends Component {
    render() {
		const { classes, open, data } = this.props
		const { onClose } = this
        return (
			<Backdrop open={open} className={classes.backdrop} onClick={onClose}>
				<i className={classes.parent}><GlassMagnifier allowOverflow imageSrc={data.src} className={classes.img} /></i>
			</Backdrop>
        )
	}

	componentDidMount = () => document.addEventListener('keydown', this.onKeyDown, false)
	componentWillUnmount = () => document.removeEventListener('keydown', this.onKeyDown, false)
	onKeyDown = e => { if(e.keyCode === 27) this.props.onClose() }

	onClose = e => {
		if(['img', 'i'].includes(e.target.nodeName.toLowerCase())) return
		this.props.onClose()
	}
}

const styles = theme => ({
	backdrop: {
		zIndex: 99999
	},
	parent: {
		display: 'flex',
		maxWidth: props => props.data.width === 'xs' ? '90%' : '55%',
		maxHeight: props => props.data.width === 'xs' ? '90%' : '55%'
	},
	img: {
		objectFit: 'contain',
		maxWidth: '100%',
		maxHeight: '100%'
	}
})

export default withStyles(styles, { withTheme: true })(ImageViewer)