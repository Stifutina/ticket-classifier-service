import type { Label, PresetId } from './types'

// Below this the card is marked "low confidence".
// Provisional: on the English test set, correct answers averaged 0.95 and wrong ones 0.79.
// Tune it on the validation set (never on the test set) before relying on it.
export const LOW_CONFIDENCE = 0.7

// Left to right on the board. "Needs a human" goes first because it is the urgent one.
export const BOARD_ORDER: readonly Label[] = [
  'request_human',
  'billing_issue',
  'delivery_status',
  'return_request',
  'technical_issue',
  'other',
]

export const CLASS_META: Record<Label, { name: string; blurb: string; urgent: boolean }> = {
  request_human: { name: 'Needs a human', blurb: 'Asks for a person, or is clearly frustrated.', urgent: true },
  billing_issue: { name: 'Billing', blurb: 'Payment, invoice or refund problem.', urgent: false },
  delivery_status: { name: 'Delivery', blurb: 'Question about delivery status or timing.', urgent: false },
  return_request: { name: 'Returns', blurb: 'Wants to return or exchange an item.', urgent: false },
  technical_issue: { name: 'Technical', blurb: 'Something is broken or not working.', urgent: false },
  positive_feedback: { name: 'Positive feedback', blurb: 'Thanks or praise from a customer.', urgent: false },
  other: { name: 'Other', blurb: 'Does not fit the other categories.', urgent: false },
}

export const PRESETS: readonly { id: Exclude<PresetId, 'custom'>; name: string; enabled: readonly Label[] }[] = [
  {
    id: 'store',
    name: 'Online store',
    enabled: [
      'request_human',
      'billing_issue',
      'delivery_status',
      'return_request',
      'technical_issue',
      'positive_feedback',
      'other',
    ],
  },
  {
    id: 'saas',
    name: 'Software product',
    enabled: ['request_human', 'billing_issue', 'technical_issue', 'positive_feedback', 'other'],
  },
  {
    id: 'delivery',
    name: 'Delivery service',
    enabled: ['request_human', 'delivery_status', 'billing_issue', 'return_request', 'positive_feedback', 'other'],
  },
]
