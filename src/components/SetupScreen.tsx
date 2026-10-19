import { CLASS_META, PRESETS } from '../lib/classes'
import { LABELS, type PresetId, type Settings } from '../lib/types'
import type { Action } from '../state/store'

interface Props {
  settings: Settings
  hasTickets: boolean
  dispatch: (action: Action) => void
}

export function SetupScreen({ settings, hasTickets, dispatch }: Props) {
  const preset: PresetId = settings.businessType

  return (
    <main className="setup">
      <header className="setup__intro">
        <h1>Set up your board</h1>
        <p>
          Pick the kind of business you run. Customer messages are sorted into the columns you keep. Anything that
          belongs to a column you switch off goes to Other.
        </p>
      </header>

      <fieldset className="presets">
        <legend>Business type</legend>
        {PRESETS.map((p) => (
          <label key={p.id} className={`preset ${preset === p.id ? 'preset--on' : ''}`}>
            <input
              type="radio"
              name="preset"
              checked={preset === p.id}
              onChange={() => dispatch({ type: 'choosePreset', preset: p.id })}
            />
            {p.name}
          </label>
        ))}
        {preset === 'custom' && <span className="preset preset--on preset--static">Custom</span>}
      </fieldset>

      <section className="columns-setup" aria-label="Columns">
        <h2>Columns</h2>
        <ul>
          {LABELS.filter((l) => l !== 'positive_feedback').map((label) => (
            <ColumnRow key={label} label={label} settings={settings} dispatch={dispatch} />
          ))}
          <ColumnRow label="positive_feedback" settings={settings} dispatch={dispatch} panel />
        </ul>
      </section>

      <div className="setup__actions">
        <button className="btn btn--primary" onClick={() => dispatch({ type: 'openBoard' })}>
          {hasTickets ? 'Back to the board' : 'Open the board'}
        </button>
      </div>
    </main>
  )
}

function ColumnRow({
  label,
  settings,
  dispatch,
  panel = false,
}: {
  label: (typeof LABELS)[number]
  settings: Settings
  dispatch: (action: Action) => void
  panel?: boolean
}) {
  const column = settings.columns[label]
  const locked = label === 'other'
  return (
    <li className="column-row">
      <input
        id={`on-${label}`}
        type="checkbox"
        checked={column.enabled}
        disabled={locked}
        onChange={() => dispatch({ type: 'toggleColumn', label })}
        aria-label={`Show ${CLASS_META[label].name}`}
      />
      <div className="column-row__body">
        <input
          className="text-input"
          value={column.name}
          disabled={!column.enabled}
          maxLength={30}
          onChange={(e) => dispatch({ type: 'renameColumn', label, name: e.target.value })}
          aria-label={`Name for ${CLASS_META[label].name}`}
        />
        <p>
          {CLASS_META[label].blurb}
          {panel && ' Shown in the reviews panel, not as a column.'}
          {locked && ' Always on: it catches everything else.'}
        </p>
      </div>
    </li>
  )
}
