import { makeTitle } from './cardText'
import { LOW_CONFIDENCE } from './classes'
import { LABELS, type Label, type Ticket } from './types'

export interface Prediction {
  label: Label
  confidence: number
  scores: Record<Label, number>
}

export function makeTicket(text: string, prediction: Prediction): Ticket {
  let runnerUp: Ticket['runnerUp'] = null
  if (prediction.confidence < LOW_CONFIDENCE) {
    const [label] = LABELS.filter((l) => l !== prediction.label).sort(
      (a, b) => prediction.scores[b] - prediction.scores[a],
    )
    runnerUp = { label, score: prediction.scores[label] }
  }
  return {
    id: crypto.randomUUID(),
    text,
    title: makeTitle(text),
    label: prediction.label,
    confidence: prediction.confidence,
    runnerUp,
    createdAt: Date.now(),
  }
}
