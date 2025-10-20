/**
 * LottieContext
 * React Context for global Lottie management
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { ILottieInstance } from '../../../types'
import type { LottieContextValue } from '../types'

const LottieContext = createContext<LottieContextValue | null>(null)

export function LottieProvider({ children }: { children: ReactNode }) {
  const [instances, setInstances] = useState<Map<string, ILottieInstance>>(new Map())

  const register = useCallback((id: string, instance: ILottieInstance) => {
    setInstances(prev => new Map(prev).set(id, instance))
  }, [])

  const unregister = useCallback((id: string) => {
    setInstances(prev => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  const playAll = useCallback(() => {
    instances.forEach(instance => instance.play())
  }, [instances])

  const pauseAll = useCallback(() => {
    instances.forEach(instance => instance.pause())
  }, [instances])

  const stopAll = useCallback(() => {
    instances.forEach(instance => instance.stop())
  }, [instances])

  const value: LottieContextValue = {
    instances,
    register,
    unregister,
    playAll,
    pauseAll,
    stopAll
  }

  return (
    <LottieContext.Provider value={value}>
      {children}
    </LottieContext.Provider>
  )
}

export function useLottieContext() {
  const context = useContext(LottieContext)
  if (!context) {
    throw new Error('useLottieContext must be used within LottieProvider')
  }
  return context
}


