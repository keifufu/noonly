import { Show } from "solid-js"

const Toast = ({ toast }) => {
  const { message, type, button } = toast
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-600',
  }
  return (
    <div style='justify-content: space-between;' class={`${colors[type]} flex shadow-lg mx-auto w-64 max-w-full text-sm pointer-events-auto bg-clip-padding rounded-lg block mb-3'`}>
      <div class='p-3 rounded break-words text-white'>
        {message}
      </div>
      <Show when={button}>
        <button onClick={button.onClick} class='select-none cursor-pointer flex-shrink bg-white bg-opacity-25 hover:bg-opacity-50 text-white font-bold m-2 rounded py-1 px-3'>{button.name}</button>
      </Show>
    </div>
  )
}

export default Toast