import { BOARD_ORDER, CLASS_META } from '../lib/classes'
import { destination, displayName } from '../lib/settings'
import type { BoardState, Label, Ticket } from '../lib/types'
import type { Action } from '../state/store'
import { Column } from './Column'
import { TicketCard } from './TicketCard'

interface Props {
  state: BoardState
  dispatch: (action: Action) => void
}

// Where a card sits: a hand-made move wins, then the model's answer (or Other if that column is off).
function placeOf(ticket: Ticket, state: BoardState): Label {
  return destination(ticket.override ?? ticket.label, state.settings)
}

export function Board({ state, dispatch }: Props) {
  const { settings, tickets } = state
  const visible = BOARD_ORDER.filter((l) => settings.columns[l].enabled)
  const reviewsOn = settings.columns.positive_feedback.enabled

  const render = (ticket: Ticket) => (
    <TicketCard
      key={ticket.id}
      ticket={ticket}
      settings={settings}
      current={placeOf(ticket, state)}
      onMove={(id, to) => dispatch({ type: 'moveTicket', id, to })}
      onRemove={(id) => dispatch({ type: 'removeTicket', id })}
    />
  )

  const reviews = tickets.filter((t) => placeOf(t, state) === 'positive_feedback')

  return (
    <div className="board">
      <div className="columns">
        {visible.map((label) => {
          const items = tickets.filter((t) => placeOf(t, state) === label)
          return (
            <Column key={label} name={displayName(label, settings)} count={items.length} urgent={CLASS_META[label].urgent}>
              {items.map(render)}
            </Column>
          )
        })}
      </div>
      {reviewsOn && (
        <aside className="reviews">
          <Column name={displayName('positive_feedback', settings)} count={reviews.length}>
            {reviews.map(render)}
          </Column>
        </aside>
      )}
    </div>
  )
}
