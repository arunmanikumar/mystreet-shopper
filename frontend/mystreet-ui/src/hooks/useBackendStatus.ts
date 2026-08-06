import { useEffect, useState } from 'react'
import { getBackendStatus } from '../services/testService'
import type { BackendStatus } from '../types/backend'

type BackendStatusState = {
  data: BackendStatus | null
  error: string | null
  isLoading: boolean
}

const initialState: BackendStatusState = {
  data: null,
  error: null,
  isLoading: true,
}

export function useBackendStatus() {
  const [state, setState] = useState<BackendStatusState>(initialState)

  useEffect(() => {
    let isMounted = true

    const loadStatus = async () => {
      try {
        const data = await getBackendStatus()

        if (!isMounted) {
          return
        }

        setState({ data, error: null, isLoading: false })
      } catch (error) {
        if (!isMounted) {
          return
        }

        const message = error instanceof Error ? error.message : 'Unable to load backend status.'
        setState({ data: null, error: message, isLoading: false })
      }
    }

    loadStatus()

    return () => {
      isMounted = false
    }
  }, [])

  return state
}