import { useState, type FormEvent, type KeyboardEvent } from 'react'
import type { ClassifierStatus } from '../state/useClassifier'

interface Props {
  status: ClassifierStatus
  onSend: (message: string) => Promise<boolean>
}

interface Line {
  from: 'customer' | 'support'
  text: string
}

const GREETING: Line = { from: 'support', text: 'Hi! Write as a customer would. Your message becomes a ticket on the board.' }

export function ChatWidget({ status, onSend }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [lines, setLines] = useState<Line[]>([GREETING])
  const busy = status !== 'idle'

  async function send(event?: FormEvent) {
    event?.preventDefault()
    const text = draft.trim()
    if (!text || busy) return
    setDraft('')
    setLines((l) => [...l, { from: 'customer', text }])
    const ok = await onSend(text)
    setLines((l) => [
      ...l,
      { from: 'support', text: ok ? 'Thanks, we have your message. A ticket was created.' : 'Sorry, that did not go through.' },
    ])
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send()
    }
  }

  return (
    <div className="chat">
      {open && (
        <div className="chat__panel" role="dialog" aria-label="Customer chat">
          <header className="chat__head">Customer chat</header>
          <ul className="chat__log" aria-live="polite">
            {lines.map((line, i) => (
              <li key={i} className={`bubble bubble--${line.from}`}>
                {line.text}
              </li>
            ))}
            {busy && (
              <li className="bubble bubble--support bubble--wait">
                {status === 'warming' ? 'Waking the classifier up…' : 'Sorting…'}
              </li>
            )}
          </ul>
          <form className="chat__form" onSubmit={send}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              maxLength={1000}
              placeholder="Type a customer message"
              aria-label="Customer message"
            />
            <button className="btn btn--primary" type="submit" disabled={busy || !draft.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
      <button className="chat__toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? 'Close chat' : 'Chat as a customer'}
      </button>
    </div>
  )
}
