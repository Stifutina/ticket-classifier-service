import { useCallback, useEffect, useReducer } from 'react'
import { Board } from './components/Board'
import { ChatWidget } from './components/ChatWidget'
import { SetupScreen } from './components/SetupScreen'
import { SAMPLE_MESSAGES } from './lib/samples'
import type { Ticket } from './lib/types'
import { loadState, reducer, saveState } from './state/store'
import { useClassifier } from './state/useClassifier'

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => saveState(state), [state])

  const addTickets = useCallback((tickets: Ticket[]) => dispatch({ type: 'addTickets', tickets }), [])
  const { status, error, submit, dismissError } = useClassifier(addTickets)
  const busy = status !== 'idle'

  if (state.screen === 'setup') {
    return <SetupScreen settings={state.settings} hasTickets={state.tickets.length > 0} dispatch={dispatch} />
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1 className="topbar__title">Ticket Board</h1>
          <p className="topbar__sub">{state.tickets.length} tickets, sorted by a trained classifier</p>
        </div>
        <div className="topbar__actions">
          <button className="btn" onClick={() => void submit([...SAMPLE_MESSAGES])} disabled={busy}>
            Add sample messages
          </button>
          <button className="btn" onClick={() => dispatch({ type: 'clearTickets' })} disabled={state.tickets.length === 0}>
            Clear board
          </button>
          <button className="btn" onClick={() => dispatch({ type: 'openSetup' })}>
            Columns
          </button>
        </div>
      </header>

      {status === 'warming' && (
        <p className="banner" role="status">
          The classifier is waking up. The first request after a pause can take a minute or two. Your messages will
          appear as soon as it is ready.
        </p>
      )}
      {status === 'busy' && (
        <p className="banner banner--quiet" role="status">
          Sorting messages…
        </p>
      )}
      {error && (
        <p className="banner banner--error" role="alert">
          {error}
          <button className="link-btn" onClick={dismissError}>
            Dismiss
          </button>
        </p>
      )}

      {state.tickets.length === 0 && status === 'idle' && !error && (
        <p className="hint">
          The board is empty. Add sample messages, or open the chat in the corner and write as a customer.
        </p>
      )}

      <Board state={state} dispatch={dispatch} />
      <ChatWidget status={status} onSend={(message) => submit([message])} />
    </div>
  )
}
