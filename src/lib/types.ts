// The seven classes of the classifier (same names as the model's labels).
export const LABELS = [
  'billing_issue',
  'delivery_status',
  'return_request',
  'technical_issue',
  'request_human',
  'positive_feedback',
  'other',
] as const

export type Label = (typeof LABELS)[number]

export function isLabel(value: unknown): value is Label {
  return typeof value === 'string' && (LABELS as readonly string[]).includes(value)
}

export interface ColumnSetting {
  enabled: boolean
  name: string
}

export type PresetId = 'store' | 'saas' | 'delivery' | 'custom'

export interface Settings {
  businessType: PresetId
  columns: Record<Label, ColumnSetting>
}

export interface Ticket {
  id: string
  text: string
  title: string
  label: Label // what the model said
  confidence: number // 0..1
  override?: Label // set when the user moves the card by hand
  runnerUp: { label: Label; score: number } | null // second guess, kept only when the model is unsure
  createdAt: number
}

export type Screen = 'setup' | 'board'

export interface BoardState {
  screen: Screen
  settings: Settings
  tickets: Ticket[]
}
