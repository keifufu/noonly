import { withStyles } from '@material-ui/core'
import { PureComponent } from 'react'

import { debounce, throttle } from 'library/utilities/lodash'

class Magnifier extends PureComponent {
	constructor(props) {
		super(props)

		this.onMouseMove = throttle(this.onMouseMove.bind(this), 20, { trailing: false })
		this.onTouchMove = throttle(this.onTouchMove.bind(this), 20, { trailing: false })
		this.calcImgBoundsDebounced = debounce(this.calcImgBounds, 200)
		this.state = {
			showZoom: false,
			mgOffsetX: 0,
			mgOffsetY: 0,
			relX: 0,
			relY: 0
		}
	}

	render() {
		const {
			src,
			width,
			height,
			className,
			zoomImgSrc,
			zoomFactor,
			mgHeight,
			mgWidth,
			mgBorderWidth,
			mgShape,
			mgShowOverflow,
			...otherProps
		} = this.props
		const { mgOffsetX, mgOffsetY, relX, relY, showZoom } = this.state
		const { classes } = this.props

		// Show/hide magnifying glass (opacity needed for transition)
		let mgClasses = classes.magnifyingGlass
		if (showZoom)
			mgClasses += ` ${classes.visible}`
		if (mgShape === 'circle')
			mgClasses += ` ${classes.circle}`

		return (
			<div
				className={`${classes.magnifier} ${className}`}
				style={{
					width,
					height,
					overflow: mgShowOverflow ? 'visible' : 'hidden'
				}}
			>
				<img
					src={src}
					width='100%'
					height='100%'
					{...otherProps}
					onLoad={() => {
						this.calcImgBounds()
					}}
					ref={(img) => {
						this.img = img
					}}
					draggable={false}
					alt=''
					style={{
						cursor: showZoom ? 'none' : 'default'
					}}
				/>
				{this.imgBounds && (
					<div
						className={mgClasses}
						style={{
							width: mgWidth,
							height: mgHeight,
							left: `calc(${relX * 100}% - ${mgWidth / 2}px + ${mgOffsetX}px - ${mgBorderWidth}px)`,
							top: `calc(${relY * 100}% - ${mgHeight / 2}px + ${mgOffsetY}px - ${mgBorderWidth}px)`,
							backgroundImage: `url('${zoomImgSrc || src}')`,
							backgroundPosition: `calc(${relX * 100}% + ${mgWidth / 2}px - ${relX
								* mgWidth}px) calc(${relY * 100}% + ${mgHeight / 2}px - ${relY * mgWidth}px)`,
							backgroundSize: `${zoomFactor * this.imgBounds.width}% ${zoomFactor
								* this.imgBounds.height}%`,
							borderWidth: mgBorderWidth
						}}
					/>
				)}
			</div>
		)
	}

	componentDidMount() {
		this.img.addEventListener('mouseenter', this.onMouseEnter, { passive: false })
		this.img.addEventListener('mousemove', this.onMouseMove, { passive: false })
		this.img.addEventListener('mouseout', this.onMouseOut, { passive: false })
		this.img.addEventListener('touchstart', this.onTouchStart, { passive: false })
		this.img.addEventListener('touchmove', this.onTouchMove, { passive: false })
		this.img.addEventListener('touchend', this.onTouchEnd, { passive: false })

		// Re-calculate image bounds on window resize
		window.addEventListener('resize', this.calcImgBoundsDebounced)
		// Re-calculate image bounds on scroll (useCapture: catch scroll events in entire DOM)
		window.addEventListener('scroll', this.calcImgBoundsDebounced, true)
	}

	componentWillUnmount() {
		// Remove all event listeners
		this.img.removeEventListener('mouseenter', this.onMouseEnter)
		this.img.removeEventListener('mousemove', this.onMouseMove)
		this.img.removeEventListener('mouseout', this.onMouseOut)
		this.img.removeEventListener('touchstart', this.onTouchStart)
		this.img.removeEventListener('touchmove', this.onTouchMove)
		this.img.removeEventListener('touchend', this.onTouchEnd)
		window.removeEventListener('resize', this.calcImgBoundsDebounced)
		window.removeEventListener('scroll', this.calcImgBoundsDebounced, true)
	}

	onMouseEnter = () => {
		this.calcImgBounds()
	}

	onMouseMove = (e) => {
		const { mgmouseoffsetx, mgmouseoffsety } = this.props

		if (this.imgBounds) {
			const { target } = e
			const relX = (e.clientX - this.imgBounds.left) / target.clientWidth
			const relY = (e.clientY - this.imgBounds.top) / target.clientHeight

			this.setState({
				mgOffsetX: mgmouseoffsetx,
				mgOffsetY: mgmouseoffsety,
				relX,
				relY,
				showZoom: e.buttons === 1
			})
		}
	}

	onMouseOut = () => {
		this.setState({
			showZoom: false
		})
	}

	onTouchStart = (e) => {
		e.preventDefault() // Prevent mouse event from being fired

		this.calcImgBounds()
	}

	onTouchMove = (e) => {
		e.preventDefault() // Disable scroll on touch

		if (this.imgBounds) {
			const { target } = e
			const { mgtouchoffsetx, mgtouchoffsety } = this.props
			const relX = (e.targetTouches[0].clientX - this.imgBounds.left) / target.clientWidth
			const relY = (e.targetTouches[0].clientY - this.imgBounds.top) / target.clientHeight

			// Only show magnifying glass if touch is inside image
			if (relX >= 0 && relY >= 0 && relX <= 1 && relY <= 1) {
				this.setState({
					mgOffsetX: mgtouchoffsetx,
					mgOffsetY: mgtouchoffsety,
					relX,
					relY,
					showZoom: true
				})
			} else {
				this.setState({
					showZoom: false
				})
			}
		}
	}

	onTouchEnd = (e) => {
		this.setState({
			showZoom: false
		})
	}

	calcImgBounds = () => {
		if (this.img)
			this.imgBounds = this.img.getBoundingClientRect()
	}
}

const styles = (theme) => ({
	magnifier: {
		position: 'relative',
		display: 'inline-block',
		lineHeight: 0
	},
	magnifyingGlass: {
		position: 'absolute',
		zIndex: 1,
		background: '#e5e5e5 no-repeat',
		border: 'solid #ebebeb',
		boxShadow: '2px 2px 3px rgba(0, 0, 0, 0.3)',
		opacity: 0,
		transition: 'opacity 0.3s',
		pointerEvents: 'none'
	},
	visible: {
		opacity: 1
	},
	circle: {
		borderRadius: '50%'
	}
})

Magnifier.defaultProps = {
	// Image
	width: '100%',
	height: 'auto',
	className: '',

	// Zoom image
	zoomImgSrc: '',
	zoomFactor: 1.5,

	// Magnifying glass
	mgWidth: 150,
	mgHeight: 150,
	mgBorderWidth: 2,
	mgShape: 'circle',
	mgShowOverflow: true,
	mgmouseoffsetx: 0,
	mgmouseoffsety: 0,
	mgtouchoffsetx: -50,
	mgtouchoffsety: -50
}

export default withStyles(styles)(Magnifier)