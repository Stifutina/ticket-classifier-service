import { useCallback, useState } from 'react'
import { classifyMessages } from '../api/classify'
import { makeTicket } from '../lib/tickets'
import type { Ticket } from '../lib/types'

export type ClassifierStatus = 'idle' | 'busy' | 'warming'

export function useClassifier(onTickets: (tickets: Ticket[]) => void) {
  const [status, setStatus] = useState<ClassifierStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(
    async (messages: string[]): Promise<boolean> => {
      setStatus('busy')
      setError(null)
      try {
        const predictions = await classifyMessages(messages, () => setStatus('warming'))
        onTickets(messages.map((message, i) => makeTicket(message, predictions[i])))
        return true
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
        return false
      } finally {
        setStatus('idle')
      }
    },
    [onTickets],
  )

  const dismissError = useCallback(() => setError(null), [])
  return { status, error, submit, dismissError }
}
