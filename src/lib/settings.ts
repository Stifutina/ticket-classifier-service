import { CLASS_META, PRESETS } from './classes'
import { LABELS, type Label, type PresetId, type Settings } from './types'

export function settingsFor(preset: Exclude<PresetId, 'custom'>, previous?: Settings): Settings {
  const enabled = PRESETS.find((p) => p.id === preset)?.enabled ?? []
  const columns = {} as Settings['columns']
  for (const label of LABELS) {
    columns[label] = {
      enabled: label === 'other' || enabled.includes(label),
      // keep names the user already typed
      name: previous?.columns[label].name ?? CLASS_META[label].name,
    }
  }
  return { businessType: preset, columns }
}

export function detectPreset(columns: Settings['columns']): PresetId {
  const on = (label: Label) => columns[label].enabled
  for (const preset of PRESETS) {
    const matches = LABELS.every((label) => label === 'other' || on(label) === preset.enabled.includes(label))
    if (matches) return preset.id
  }
  return 'custom'
}

export function displayName(label: Label, settings: Settings): string {
  return settings.columns[label].name.trim() || CLASS_META[label].name
}

// Where a ticket lands. A class the user switched off falls into "Other".
// For positive_feedback the answer "positive_feedback" means: the reviews panel.
export function destination(label: Label, settings: Settings): Label {
  if (label === 'other') return 'other'
  return settings.columns[label].enabled ? label : 'other'
}
