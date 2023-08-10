import { createMediaQuery } from '@solid-primitives/media';

const Input = ({ label, placeholder, value, onChange, style }) => {
  const isMobile = createMediaQuery('(max-width: 768px)');
  return (
    <div class={`flex justify-center w-full ${isMobile() ? '' : style}`}>
      <div class='mb-3 w-full'>
        <input
          type='text'
          class='
            form-control
            block
            w-full
            px-3
            py-1.5
            text-base
            font-normal
            bg-clip-padding
            border border-solid border-gray-500
            rounded
            transition
            ease-in-out
            m-0
            focus:text-gray-200 focus:bg-opacity-75 focus:border-blue-600 focus:outline-none
            bg-slate-800
            text-gray-100
          '
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  )
}

export default Input