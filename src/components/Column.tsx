import { useState, type ReactNode } from 'react'

interface Props {
  name: string
  count: number
  urgent?: boolean
  children: ReactNode
}

export function Column({ name, count, urgent = false, children }: Props) {
  const [open, setOpen] = useState(true)
  return (
    <section className={`column ${urgent ? 'column--urgent' : ''} ${open ? '' : 'column--closed'}`}>
      <button className="column__head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="column__name">{name}</span>
        <span className="column__count">{count}</span>
        <span className="column__chevron" aria-hidden="true" />
      </button>
      {open && <div className="column__body">{count === 0 ? <p className="empty">No tickets yet.</p> : children}</div>}
    </section>
  )
}
