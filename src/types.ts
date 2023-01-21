import React from 'react'

export type ObjectValues<T> = T[keyof T]

export const TASK_STATUS = {
    unstarted: 'unstarted',
    loading: 'loading',
    success: 'success',
    error: 'error',
} as const
export type TaskStatus = ObjectValues<typeof TASK_STATUS>

export const DATA_SOURCE = {
    scryfall: 'scryfall',
    local: 'local',
} as const
export type DataSource = ObjectValues<typeof DATA_SOURCE>

export type Setter<T> = React.Dispatch<React.SetStateAction<T>>