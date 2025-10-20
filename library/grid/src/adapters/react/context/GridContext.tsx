/**
 * React context for grid instance
 */

import React, { createContext, useContext } from 'react'
import type { IGridInstance } from '../../../types'

export interface GridContextValue {
  gridInstance: IGridInstance | null
}

export const GridContext = createContext<GridContextValue>({
  gridInstance: null
})

export function useGridContext(): GridContextValue {
  return useContext(GridContext)
}

export interface GridProviderProps {
  gridInstance: IGridInstance | null
  children: React.ReactNode
}

export function GridProvider({ gridInstance, children }: GridProviderProps): JSX.Element {
  return (
    <GridContext.Provider value={{ gridInstance }}>
      {children}
    </GridContext.Provider>
  )
}













