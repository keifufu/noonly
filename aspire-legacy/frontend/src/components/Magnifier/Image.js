import utils from './utils'
import React from 'react'

const Image = React.forwardRef(function(props, ref) {
	const { onImageLoad, onLoadRefresh, src, alt, ...otherProps } = props

	const [imageIdx, setImageIdx] = React.useState(0)
	const imageErrorRef = React.useRef(false)
	const imageArr = src.constructor === Array ? src : [src]
	if(!imageArr[imageIdx] && imageIdx !== 0) setImageIdx(0)

	return (
		<img
			ref={ref}
			src={imageArr[imageIdx]}
			alt={alt}
			onLoad={e => {
				onImageLoad(e)
				if(imageErrorRef.current) {
					onLoadRefresh()
				}
			}}
			onError={e => {
				if(imageIdx < imageArr.length) {
					imageErrorRef.current = true
					setImageIdx(idx => idx + 1)
				}
			}}
			{...otherProps}
		/>
	)
})

Image.defaultProps = {
	onImageLoad: utils.noop,
	onLoadRefresh: utils.noop
}

export default Image