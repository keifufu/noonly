import { IconTypes } from 'solid-icons'
import { Component } from 'solid-js'

type IconButtonProps = {
  icon: IconTypes
  size?: number
  onClick: () => void
}

// https://www.npmjs.com/package/solid-icons
const IconButton: Component<IconButtonProps> = (props) => (
  <button
    class='p-2'
    onClick={props.onClick}
  >
    <props.icon size={props.size || 24} />
  </button>
)

export default IconButton