import type { Prediction } from '../lib/tickets'
import { LABELS, isLabel, type Label } from '../lib/types'

const BASE = __API_URL__.replace(/\/+$/, '')

const REQUEST_TIMEOUT_MS = 35_000 // the Worker itself waits up to 25 s for the container
const RETRY_DELAY_MS = 5_000
const WAIT_LIMIT_MS = 6 * 60_000 // a cold start can take a few minutes

export class ApiError extends Error {}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function parsePredictions(data: unknown, expected: number): Prediction[] {
  const results = (data as { results?: unknown })?.results
  if (!Array.isArray(results) || results.length !== expected) {
    throw new ApiError('The classifier sent an unexpected answer.')
  }
  return results.map((item) => {
    const { label, confidence, scores } = item as {
      label?: unknown
      confidence?: unknown
      scores?: Record<string, unknown>
    }
    if (!isLabel(label) || typeof confidence !== 'number') {
      throw new ApiError('The classifier sent an unexpected answer.')
    }
    const full = {} as Record<Label, number>
    for (const l of LABELS) {
      const value = scores?.[l]
      full[l] = typeof value === 'number' ? value : 0
    }
    return { label, confidence, scores: full }
  })
}

// Sends messages to the API. While the container is waking up the Worker answers 503,
// so we wait and try again (and tell the UI via onWarmingUp).
export async function classifyMessages(messages: string[], onWarmingUp: () => void): Promise<Prediction[]> {
  if (!BASE) {
    throw new ApiError('API_URL is not set. Locally: add it to .env.local and restart npm run dev. On Vercel: add the variable and redeploy.')
  }
  const deadline = Date.now() + WAIT_LIMIT_MS

  for (;;) {
    let response: Response | null = null
    try {
      response = await fetch(`${BASE}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'TimeoutError'
      if (!timedOut) {
        throw new ApiError(
          'Cannot reach the classifier. Check your connection, and that this site is in ALLOWED_ORIGINS on the API.',
        )
      }
    }

    if (response?.ok) return parsePredictions(await response.json(), messages.length)

    if (response === null || response.status === 503) {
      onWarmingUp()
      if (Date.now() > deadline) throw new ApiError('The classifier did not wake up in time. Try again in a minute.')
      await sleep(RETRY_DELAY_MS)
      continue
    }
    if (response.status === 422) throw new ApiError('The message was rejected. Is it empty?')
    if (response.status === 413) throw new ApiError('The message is too long.')
    throw new ApiError(`The classifier failed to start or answer (HTTP ${response.status}).`)
  }
}
