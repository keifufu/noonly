import { createVirtualizer, createWindowVirtualizer } from '@tanstack/solid-virtual'
import { Component, For, onMount } from 'solid-js'
import random from '../../shared/random'
import Store from '../../shared/state/store'
import { MailItem } from './Mail'

const Test: Component = () => {
  const mail = () => Store.mail.get()

  const onClick = () => {
    const mail = []
    for (let i = 0; i < 100; i++) {
      mail.push({
        id: i.toString(),
        from: 'keifufu',
        subject: 'Hello world',
        previewText: random(100)
      })
    }
    console.log('done generating mail')
    Store.mail.set(mail)
  }

  const rowVirtualizer = createVirtualizer({
    get count() {
      return mail().length
    },
    estimateSize: () => 100,
    overscan: 5
  })

  return (<>
    <div
      ref={(el) => onMount(() => virtualItem.measureElement(el))}
      style={{
        height: '400px',
        overflow: 'auto'
      }}
    >
      <button onClick={onClick}>Generate mail</button>
      <For each={mail()}>
        {(item) => (
          <MailItem mail={item} setPreventScroll={() => null} />
        )}
      </For>
    </div>
  </>)
}

export default Test