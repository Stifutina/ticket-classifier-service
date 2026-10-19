import { detectPreset, settingsFor } from '../lib/settings'
import { LABELS, isLabel, type BoardState, type Label, type PresetId, type Settings, type Ticket } from '../lib/types'

const STORAGE_KEY = 'ticket-board:v1'

export type Action =
  | { type: 'choosePreset'; preset: Exclude<PresetId, 'custom'> }
  | { type: 'toggleColumn'; label: Label }
  | { type: 'renameColumn'; label: Label; name: string }
  | { type: 'openBoard' }
  | { type: 'openSetup' }
  | { type: 'addTickets'; tickets: Ticket[] }
  | { type: 'moveTicket'; id: string; to: Label }
  | { type: 'removeTicket'; id: string }
  | { type: 'clearTickets' }

export const initialState: BoardState = { screen: 'setup', settings: settingsFor('store'), tickets: [] }

function withColumns(columns: Settings['columns']): Settings {
  return { businessType: detectPreset(columns), columns }
}

export function reducer(state: BoardState, action: Action): BoardState {
  switch (action.type) {
    case 'choosePreset':
      return { ...state, settings: settingsFor(action.preset, state.settings) }
    case 'toggleColumn': {
      if (action.label === 'other') return state
      const current = state.settings.columns[action.label]
      const columns = { ...state.settings.columns, [action.label]: { ...current, enabled: !current.enabled } }
      return { ...state, settings: withColumns(columns) }
    }
    case 'renameColumn': {
      const current = state.settings.columns[action.label]
      const columns = { ...state.settings.columns, [action.label]: { ...current, name: action.name } }
      return { ...state, settings: withColumns(columns) }
    }
    case 'openBoard':
      return { ...state, screen: 'board' }
    case 'openSetup':
      return { ...state, screen: 'setup' }
    case 'addTickets':
      return { ...state, tickets: [...action.tickets, ...state.tickets] }
    case 'moveTicket':
      return {
        ...state,
        tickets: state.tickets.map((t) => (t.id === action.id ? { ...t, override: action.to } : t)),
      }
    case 'removeTicket':
      return { ...state, tickets: state.tickets.filter((t) => t.id !== action.id) }
    case 'clearTickets':
      return { ...state, tickets: [] }
  }
}

// ---- localStorage ----
// Anything read from storage is untrusted (old version, hand-edited), so it is checked before use.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseTicket(value: unknown): Ticket | null {
  if (!isRecord(value)) return null
  const { id, text, title, label, confidence, runnerUp, override, createdAt } = value
  if (typeof id !== 'string' || typeof text !== 'string' || typeof title !== 'string') return null
  if (!isLabel(label) || typeof confidence !== 'number' || typeof createdAt !== 'number') return null
  let parsedRunnerUp: Ticket['runnerUp'] = null
  if (isRecord(runnerUp) && isLabel(runnerUp.label) && typeof runnerUp.score === 'number') {
    parsedRunnerUp = { label: runnerUp.label, score: runnerUp.score }
  }
  return {
    id,
    text,
    title,
    label,
    confidence,
    runnerUp: parsedRunnerUp,
    override: isLabel(override) ? override : undefined,
    createdAt,
  }
}

export function loadState(): BoardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const data: unknown = JSON.parse(raw)
    if (!isRecord(data) || !isRecord(data.settings) || !isRecord(data.settings.columns)) return initialState

    const columns = {} as Settings['columns']
    for (const label of LABELS) {
      const column = data.settings.columns[label]
      if (!isRecord(column) || typeof column.enabled !== 'boolean' || typeof column.name !== 'string') {
        return initialState
      }
      columns[label] = { enabled: label === 'other' ? true : column.enabled, name: column.name }
    }
    const tickets = Array.isArray(data.tickets)
      ? data.tickets.map(parseTicket).filter((t): t is Ticket => t !== null)
      : []
    return {
      screen: data.screen === 'board' ? 'board' : 'setup',
      settings: { businessType: detectPreset(columns), columns },
      tickets,
    }
  } catch {
    return initialState
  }
}

export function saveState(state: BoardState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage full or blocked: the board still works, it just won't be remembered
  }
}
