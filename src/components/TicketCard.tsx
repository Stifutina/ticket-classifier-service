import { CLASS_META, LOW_CONFIDENCE } from '../lib/classes'
import { displayName } from '../lib/settings'
import { LABELS, isLabel, type Label, type Settings, type Ticket } from '../lib/types'

interface Props {
  ticket: Ticket
  settings: Settings
  current: Label // where the card sits now
  onMove: (id: string, to: Label) => void
  onRemove: (id: string) => void
}

export function TicketCard({ ticket, settings, current, onMove, onRemove }: Props) {
  const percent = Math.round(ticket.confidence * 100)
  const low = ticket.confidence < LOW_CONFIDENCE
  const urgent = CLASS_META[current].urgent
  const time = new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const targets = LABELS.filter((l) => settings.columns[l].enabled)

  return (
    <article className={`card ${urgent ? 'card--urgent' : ''}`}>
      <header className="card__head">
        <h3 className="card__title">{ticket.title}</h3>
        <button className="icon-btn" onClick={() => onRemove(ticket.id)} aria-label={`Delete ticket: ${ticket.title}`}>
          ×
        </button>
      </header>
      <p className="card__blurb">{CLASS_META[ticket.label].blurb}</p>
      <blockquote className="card__quote">{ticket.text}</blockquote>

      <footer className="card__foot">
        <span className={`badge ${low ? 'badge--low' : 'badge--ok'}`} title="How sure the classifier is">
          {percent}% sure
        </span>
        <time className="card__time">{time}</time>
        <label className="card__move">
          <span className="visually-hidden">Move this ticket to</span>
          <select
            value={current}
            onChange={(e) => isLabel(e.target.value) && onMove(ticket.id, e.target.value)}
          >
            {targets.map((l) => (
              <option key={l} value={l}>
                {displayName(l, settings)}
              </option>
            ))}
          </select>
        </label>
      </footer>

      {low && !ticket.override && (
        <p className="card__warn">
          Not sure about this one
          {ticket.runnerUp && ` – it could also be “${displayName(ticket.runnerUp.label, settings)}”`}. Check it.
        </p>
      )}
    </article>
  )
}
