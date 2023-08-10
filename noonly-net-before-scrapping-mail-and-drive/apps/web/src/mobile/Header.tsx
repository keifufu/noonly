import { IoMenu, IoSearch } from 'solid-icons/io'
import { RiDesignPencilFill } from 'solid-icons/ri'
import { Component } from 'solid-js'
import IconButton from './IconButton'
import { openSidebar } from './Sidebar'

const Header: Component = () => {
  // sidebar button, title, search button, compose button
  const a = ''
  return (
    <div class='flex h-14 items-center bg-slate-800'>
      <IconButton icon={IoMenu} onClick={() => openSidebar(0.3)} />
      <div class='grow'>Inbox</div>
      <IconButton icon={IoSearch} onClick={() => null} />
      <IconButton icon={RiDesignPencilFill} onClick={() => null} />
    </div>
  )
}

export default Header